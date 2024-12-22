import { GlobalParams } from "./global-params";

declare const window: GlobalParams

export class CheckboxMenu {
    private div: HTMLDivElement;
    private isOpen: boolean = false;
    private widget: any;
    private handler_id: string;
    private checkboxStates: { [key: string]: boolean } = {};

    constructor(
        private makeButton: Function,
        private callbackName: string,
        name: string,
        items: string[],
        separator: boolean,
        align: 'right' | 'left',
        handler_id: string
    ) {
        this.div = document.createElement('div');
        this.div.classList.add('topbar-menu');
        this.handler_id = handler_id;
        this.widget = this.makeButton(name+' ↓', null, separator, true, align);

        // Initialize checkbox states
        items.forEach(item => {
            this.checkboxStates[item] = false; // Default all to unchecked
        });

        this.updateMenuItems(items);

        this.widget.elem.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            if (!this.isOpen) {
                this.div.style.display = 'none';
                return;
            }
            let rect = this.widget.elem.getBoundingClientRect();
            this.div.style.display = 'flex';
            this.div.style.flexDirection = 'column';

            let center = rect.x + rect.width / 2;
            this.div.style.left = center - this.div.clientWidth / 2 + 'px';
            this.div.style.top = rect.y + rect.height + 'px';
        });
        document.body.appendChild(this.div);
    }

    updateMenuItems(items: string[]) {
        this.div.innerHTML = '';
        const hid = this.handler_id.split(".")[1];

        items.forEach(item => {
            const container = document.createElement('div');
            container.classList.add('topbar-button');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.margin = '4px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '8px';
            checkbox.checked = this.checkboxStates[item];

            const checkboxId = `topbar-checkbox-${hid}-${item}`;
            checkbox.id = checkboxId;

            checkbox.addEventListener('click', () => {
                this.checkboxStates[item] = checkbox.checked;
                this._clickHandler();
            });

            const label = document.createElement('label');
            label.innerText = item;
            label.htmlFor = checkboxId;

            container.appendChild(checkbox);
            container.appendChild(label);

            this.div.appendChild(container);
        });
    }

    private _clickHandler() {
        const checkedItems = Object.keys(this.checkboxStates).filter(key => this.checkboxStates[key]);
        const uncheckedItems = Object.keys(this.checkboxStates).filter(key => !this.checkboxStates[key]);
        window.callbackFunction(
            `${this.callbackName}_~_checked:${checkedItems.join(',')};;;unchecked:${uncheckedItems.join(',')}`
        );
    }
}
