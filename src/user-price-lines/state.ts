import { Delegate } from '../helpers/delegate';

export interface OrderInfo {
    id: string;
    price: number;
    ts: number;
}

export class OrdersState {
    private _orderAdded: Delegate<OrderInfo> = new Delegate();
    private _orderRemoved: Delegate<string> = new Delegate();
    private _orderChanged: Delegate<OrderInfo> = new Delegate();
    private _ordersChanged: Delegate = new Delegate();
    private _orders: Map<string, OrderInfo>;

    constructor() {
        this._orders = new Map();
        this._ordersChanged.subscribe(() => {
            this._updateOrdersArray();
        }, this);
    }

    destroy() {
        // TODO: add more destroying 💥
        this._ordersChanged.unsubscribeAll(this);
    }

    orderAdded(): Delegate<OrderInfo> {
        return this._orderAdded;
    }

    orderRemoved(): Delegate<string> {
        return this._orderRemoved;
    }

    orderChanged(): Delegate<OrderInfo> {
        return this._orderChanged;
    }

    ordersChanged(): Delegate {
        return this._ordersChanged;
    }

    addOrder(price: number, ts: number): string {
        const id = this._getNewId();
        const order: OrderInfo = {
            price,
            id,
            ts
        };
        this._orders.set(id, order);
        this._orderAdded.fire(order);
        this._ordersChanged.fire();
        return id;
    }

    removeOrder(id: string) {
        if (!this._orders.has(id)) return;
        this._orders.delete(id);
        this._orderRemoved.fire(id);
        this._ordersChanged.fire();
    }

    orders() {
        return this._ordersArray;
    }

    _ordersArray: OrderInfo[] = [];
    _updateOrdersArray() {
        this._ordersArray = Array.from(this._orders.values()).sort((a, b) => {
            return b.price - a.price;
        });
    }

    private _getNewId(): string {
        let id = Math.round(Math.random() * 1000000).toString(16);
        while (this._orders.has(id)) {
            id = Math.round(Math.random() * 1000000).toString(16);
        }
        return id;
    }
}
