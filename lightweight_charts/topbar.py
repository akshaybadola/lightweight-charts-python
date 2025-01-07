import asyncio
from typing import Dict, Literal, Callable, Optional

from .util import jbool, Pane


ALIGN = Literal['left', 'right']


class Widget(Pane):
    def __init__(self, topbar, value, func: Optional[Callable] = None,
                 convert_boolean=False):
        super().__init__(topbar.win)
        self.value = value

        def wrapper(v, *args):
            if convert_boolean:
                self.value = False if v == 'false' else True
            else:
                self.value = v
            func(topbar._chart, v, *args)

        async def async_wrapper(v, *args):
            self.value = v
            await func(topbar._chart, v, *args)

        self.win.handlers[self.id] = async_wrapper if asyncio.iscoroutinefunction(func) else wrapper


class TextWidget(Widget):
    def __init__(self, topbar, initial_text, align, func):
        super().__init__(topbar, value=initial_text, func=func)

        callback_name = f'"{self.id}"' if func else ''

        self.run_script(f'{self.id} = {topbar.id}.makeTextBoxWidget("{initial_text}", "{align}", {callback_name})')

    def set(self, string):
        self.value = string
        self.run_script(f'{self.id}.innerText = "{string}"')


class SwitcherWidget(Widget):
    def __init__(self, topbar, options, default, align, func):
        super().__init__(topbar, value=default, func=func)
        self.options = list(options)
        self.run_script(f'{self.id} = {topbar.id}.makeSwitcher({self.options}, "{default}", "{self.id}", "{align}")')

    def set(self, option):
        if option not in self.options:
            raise ValueError(f"option '{option}' does not exist within {self.options}.")
        self.run_script(f'{self.id}.onItemClicked("{option}")')
        self.value = option


class MenuWidget(Widget):
    def __init__(self, topbar, options, default, separator, align, func):
        super().__init__(topbar, value=default, func=func)
        self.options = list(options)
        self.run_script(f'''
        {self.id} = {topbar.id}.makeMenu({list(options)}, "{default}", {jbool(separator)}, "{self.id}", "{align}")
        ''')

    # TODO this will probably need to be fixed
    def set(self, option):
        if option not in self.options:
            raise ValueError(f"Option {option} not in menu options ({self.options})")
        self.value = option
        self.run_script(f'''
            {self.id}._clickHandler("{option}")
        ''')
        # self.win.handlers[self.id](option)

    def update_items(self, items: list[str], default=None):
        default = default or items[0]
        self.options = items
        self.run_script(f'{self.id}.updateMenuItems({self.options}, "{default}")')


class CheckboxMenuWidget(Widget):
    def __init__(self, topbar, name, options, separator, align, func):
        super().__init__(topbar, value=name, func=func)
        self.options = list(options)
        self.run_script(f'''
        {self.id} = {topbar.id}.makeCheckboxMenu("{name}", {list(options)}, {jbool(separator)}, "{self.id}", "{align}")
        ''')

    # TODO this will probably need to be fixed
    def set(self, option):
        if option not in self.options:
            raise ValueError(f"Option {option} not in menu options ({self.options})")
        self.value = option
        self.run_script(f'''
            {self.id}._clickHandler("{option}")
        ''')
        # self.win.handlers[self.id](option)

    def update_items(self, items: list[str], default=None):
        default = default or items[0]
        self.options = items
        self.run_script(f'{self.id}.updateMenuItems({self.options}, "{default}")')


class ButtonWidget(Widget):
    def __init__(self, topbar, button, separator, align, toggle, func):
        super().__init__(topbar, value=False, func=func, convert_boolean=toggle)
        params = ", ".join([f'"{button}"',
                            f'"{self.id}"',
                            str(jbool(separator)),
                            "true",
                            f'"{align}"',
                            str(jbool(toggle))])
        script = f'{self.id} = {topbar.id}.makeButton({params})'
        self.run_script(script)

    def set(self, string):
        # self.value = string
        self.run_script(f'{self.id}.elem.innerText = "{string}"')


class TimeSliderWidget(Widget):
    def __init__(self, topbar, min_time: str = "9:00", max_time: str = "15:00",
                 step_minutes: int = 1, initial_value: str = "15:00", debounce_delay: int = 500,
                 align: str = "left", func: Optional[Callable] = None):
        super().__init__(topbar, value=initial_value, func=func, convert_boolean=False)
        params = ", ".join([f'"{min_time}"',
                            f'"{max_time}"',
                            f'{step_minutes}',
                            f'"{initial_value}"',
                            f'"{self.id}"',
                            f'debounce_delay={debounce_delay}',
                            f'align="{align}"'])
        script = f'{self.id} = {topbar.id}.makeTimeSlider({params})'
        self.run_script(script)


class SliderWidget(Widget):
    def __init__(self, topbar, min_val: float = 0, max_val: float = 1,
                 step: float = .1, initial_value: float = .2, debounce_delay: int = 500,
                 align: str = "left", func: Optional[Callable] = None):
        super().__init__(topbar, value=initial_value, func=func, convert_boolean=False)
        params = ", ".join([f'"{min_val}"',
                            f'"{max_val}"',
                            f'{step}',
                            f'"{initial_value}"',
                            f'"{self.id}"',
                            f'debounce_delay={debounce_delay}',
                            f'align="{align}"'])
        script = f'{self.id} = {topbar.id}.makeSlider({params})'
        self.run_script(script)


class TopBar(Pane):
    def __init__(self, chart):
        super().__init__(chart.win)
        self._chart = chart
        self._widgets: Dict[str, Widget] = {}
        self._created = False

    def _create(self):
        if self._created:
            return
        self._created = True
        self.run_script(f'{self.id} = {self._chart.id}.createTopBar()')

    def __getitem__(self, item):
        if widget := self._widgets.get(item):
            return widget
        raise KeyError(f'Topbar widget "{item}" not found.')

    def get(self, widget_name):
        return self._widgets.get(widget_name)

    def switcher(self, name, options: tuple, default: Optional[str] = None,
                 align: ALIGN = 'left', func: Optional[Callable] = None):
        self._create()
        self._widgets[name] = SwitcherWidget(self, options, default if default else options[0],
                                             align, func)

    def menu(self, name, options: tuple, default: Optional[str] = None, separator: bool = True,
             align: ALIGN = 'left', func: Optional[Callable] = None):
        self._create()
        self._widgets[name] = MenuWidget(self, options, default if default else options[0],
                                         separator, align, func)

    def checkboxmenu(self, name, options: tuple, separator: bool = True,
                     align: ALIGN = 'left', func: Optional[Callable] = None):
        self._create()
        self._widgets[name] = CheckboxMenuWidget(self, name, options, separator, align, func)

    def textbox(self, name: str, initial_text: str = '',
                align: ALIGN = 'left', func: Optional[Callable] = None):
        self._create()
        self._widgets[name] = TextWidget(self, initial_text, align, func)

    def button(self, name, button_text: str, separator: bool = True,
               align: ALIGN = 'left', toggle: bool = False, func: Optional[Callable] = None):
        self._create()
        self._widgets[name] = ButtonWidget(self, button_text, separator, align, toggle, func)

    def time_slider(self, min_time: str = "9:00", max_time: str = "15:00", step_minutes: int = 1,
                    initial_value: str = "15:00", debounce_delay: int = 500,
                    align: str = "left", func: Optional[Callable] = None):
        self._create()
        self._widgets["slider"] = TimeSliderWidget(self, min_time, max_time, step_minutes,
                                                   initial_value, debounce_delay, align, func)

    def slider(self, min_val: float = 0, max_val: float = 1,
               step: float = .1, initial_value: float = .2, debounce_delay: int = 500,
               align: str = "left", func: Optional[Callable] = None):
        self._create()
        self._widgets["slider"] = SliderWidget(self, min_val, max_val, step,
                                               initial_value, debounce_delay, align, func)
