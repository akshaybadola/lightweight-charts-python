import asyncio
import random
from typing import Union, Optional, Callable, Any
from threading import Lock

import numpy as np
import pandas as pd

from common_pyutil.monitor import Timer

from .table import Section
from .util import jbool, Pane, NUM


class FastTable(Pane):
    VALUE = 'CELL__~__VALUE__~__PLACEHOLDER'

    def __init__(
            self,
            window,
            width: NUM,
            height: NUM,
            headings: tuple,
            widths: Optional[tuple] = None,
            alignments: Optional[tuple] = None,
            position='left',
            draggable: bool = False,
            background_color: str = '#121417',
            border_color: str = 'rgb(70, 70, 70)',
            border_width: int = 1,
            heading_text_colors: Optional[tuple] = None,
            heading_background_colors: Optional[tuple] = None,
            return_clicked_cells: bool = False,
            func: Optional[Callable] = None,
            table_id: Optional[str] = None
    ):
        Pane.__init__(self, window)
        self._formatters = {}
        self.headings = headings
        self.is_shown = True

        def wrapper(rId, cId=None):
            if return_clicked_cells:
                func(self[int(rId)], cId)
            else:
                func(self[int(rId)])

        async def async_wrapper(rId, cId=None):
            if return_clicked_cells:
                await func(self[int(rId)], cId)
            else:
                await func(self[int(rId)])

        self.win.handlers[self.id] = async_wrapper if asyncio.iscoroutinefunction(func) else wrapper
        self.return_clicked_cells = return_clicked_cells

        self.run_script(f'''
        {self.id} = new Lib.Table(
            {width},
            {height},
            {list(headings)},
            {list(widths) if widths else []},
            {list(alignments) if alignments else []},
            '{position}',
            {jbool(draggable)},
            '{background_color}',
            '{border_color}',
            {border_width},
            {list(heading_text_colors) if heading_text_colors else []},
            {list(heading_background_colors) if heading_background_colors else []},
            '{table_id}'
        )''')
        self.run_script(f'{self.id}.callbackName = "{self.id}"') if func else None
        self._table_id = table_id
        if table_id:
            self.win.handlers[table_id] = func
        self.footer = Section(self, 'footer')
        self.header = Section(self, 'header')
        self._rows_cache = pd.DataFrame(columns=["row_id", *self.headings])
        self._rows_cache_lock = Lock()
        self._timer = Timer()

    def sort_by_column(self, column, ascending=True):
        with self._rows_cache_lock:
            row_ids = [*self._rows_cache.row_id]
            rows = self._rows_cache.copy()
            rows[[*self.headings[1:]]] = self._rows_cache[[*self.headings[1:]]].map(lambda x: float(x))
            rows.sort_values(column, ascending=ascending, inplace=True)
            rows = [[*map(str, x.tolist()[1:])] for x in rows.values]
            self._rows_cache.loc[:, self.headings] = np.array(rows)
            self.run_script(f'''{self.id}.bulkUpdateCells({row_ids}, {rows})''')

    def bulk_update_columns(self, columns: list[str], values: dict[int, list[str]]):
        with self._timer:
            with self._rows_cache_lock:
                rows = self._rows_cache.set_index("row_id")
                for k, v in values.items():
                    rows.loc[k, columns] = v
                self._rows_cache = rows.reset_index().copy()
                row_ids = [*self._rows_cache.row_id]
                vals = [x.tolist() for x in self._rows_cache.loc[:, columns].values]
                self.run_script(f'''{self.id}.bulkUpdateColumns({row_ids}, {vals}, {columns})''')

    def bulk_update_styles(self, styles: list[dict[str, str]]):
        row_ids = [*self._rows_cache.row_id]
        self.run_script(f'''{self.id}.bulkUpdateStyles({row_ids}, {styles})''')

    def new_row(self, *values, id=None):
        row_id = random.randint(0, 99_999_999) if not id else id
        with self._rows_cache_lock:
            self._rows_cache = pd.concat([
                self._rows_cache,
                pd.DataFrame.from_dict([dict(zip(["row_id", *self.headings], [row_id, *values]))])
            ])
            self.run_script(f'{self.id}.newRow("{row_id}", {jbool(self.return_clicked_cells)})')
            vals = ",".join(f"\"{v}\"" for v in values)
            self.run_script(f'{self.id}.updateRow("{row_id}", [{vals}])')

    def clear(self):
        self.run_script(f"{self.id}.clearRows()")
        self._rows_cache = pd.DataFrame(columns=["row_id", *self.headings])

    def keys(self):
        return [*self._rows_cache.row_id]

    def set_row_background_color(self, indx, column, color):
        self._style('backgroundColor', column, color)

    def set_row_text_color(self, indx, column, color):
        self._style('color', column, color)

    def delete_row(self):
        self.run_script(f"{self.id}.deleteRow('{self.id}')")

    def flash_row(self, row_indx):
        row_id = self.keys()[row_indx]
        self.run_script(f"{self.id}.flashRow({row_id})")

    def stop_flash_row(self, row_indx_or_sym: int | str):
        if isinstance(row_indx_or_sym, int):
            row_id = self.keys()[row_indx_or_sym]
        else:
            row_id = self._rows_cache[self._rows_cache.Sym == row_indx_or_sym].row_id.item()
        self.run_script(f"{self.id}.stopFlashRow({int(row_id)})")

    def _style(self, style, column, arg):
        self.run_script(f"{self.id}.styleCell({self.id}, '{column}', '{style}', '{arg}')")

    def get(self, key: int):
        with self._rows_cache_lock:
            return self._rows_cache[self._rows_cache.row_id == key]

    def __setitem__(self, k, v):
        self._rows_cache.loc[self._rows_cache.row_id == k] = [k, *v]

    def __getitem__(self, k):
        with self._rows_cache_lock:
            return self._rows_cache.loc[self._rows_cache.row_id == k]

    def format(self, column: str, format_str: str):
        self._formatters[column] = format_str

    def resize(self, width: NUM, height: NUM):
        self.run_script(f'{self.id}.reSize({width}, {height})')

    def visible(self, visible: bool):
        self.is_shown = visible
        self.run_script(f"""
        {self.id}._div.style.display = '{'flex' if visible else 'none'}'
        {self.id}._div.{'add' if visible else 'remove'}EventListener('mousedown', {self.id}.onMouseDown)
        """)
