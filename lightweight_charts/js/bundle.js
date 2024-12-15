var Lib = (function (exports, lightweightCharts) {
    'use strict';

    const paneStyleDefault = {
        backgroundColor: '#0c0d0f',
        hoverBackgroundColor: '#3c434c',
        clickBackgroundColor: '#50565E',
        activeBackgroundColor: 'rgba(0, 122, 255, 0.7)',
        mutedBackgroundColor: 'rgba(0, 122, 255, 0.3)',
        borderColor: '#3C434C',
        color: '#d8d9db',
        activeColor: '#ececed',
    };
    function globalParamInit() {
        window.pane = {
            ...paneStyleDefault,
        };
        window.containerDiv = document.getElementById("container") || document.createElement('div');
        window.setCursor = (type) => {
            if (type)
                window.cursor = type;
            document.body.style.cursor = window.cursor;
        };
        window.cursor = 'default';
        window.textBoxFocused = false;
    }
    const setCursor = (type) => {
        if (type)
            window.cursor = type;
        document.body.style.cursor = window.cursor;
    };
    // export interface SeriesHandler {
    //     type: string;
    //     series: ISeriesApi<SeriesType>;
    //     markers: SeriesMarker<"">[],
    //     horizontal_lines: HorizontalLine[],
    //     name?: string,
    //     precision: number,
    // }

    class Legend {
        handler;
        div;
        seriesContainer;
        ohlcEnabled = false;
        percentEnabled = false;
        linesEnabled = false;
        colorBasedOnCandle = false;
        text;
        candle;
        _lines = [];
        constructor(handler) {
            this.legendHandler = this.legendHandler.bind(this);
            this.handler = handler;
            this.ohlcEnabled = false;
            this.percentEnabled = false;
            this.linesEnabled = false;
            this.colorBasedOnCandle = false;
            this.div = document.createElement('div');
            this.div.classList.add("legend");
            this.div.style.maxWidth = `${(handler.scale.width * 100) - 8}vw`;
            this.div.style.display = 'none';
            const seriesWrapper = document.createElement('div');
            seriesWrapper.style.display = 'flex';
            seriesWrapper.style.flexDirection = 'row';
            this.seriesContainer = document.createElement("div");
            this.seriesContainer.classList.add("series-container");
            this.text = document.createElement('span');
            this.text.style.lineHeight = '1.8';
            this.candle = document.createElement('div');
            seriesWrapper.appendChild(this.seriesContainer);
            this.div.appendChild(this.text);
            this.div.appendChild(this.candle);
            this.div.appendChild(seriesWrapper);
            handler.div.appendChild(this.div);
            // this.makeSeriesRows(handler);
            handler.chart.subscribeCrosshairMove(this.legendHandler);
        }
        toJSON() {
            // Exclude the chart attribute from serialization
            const { _lines, handler, ...serialized } = this;
            return serialized;
        }
        // makeSeriesRows(handler: Handler) {
        //     if (this.linesEnabled) handler._seriesList.forEach(s => this.makeSeriesRow(s))
        // }
        makeSeriesRow(name, series) {
            const strokeColor = '#FFF';
            let openEye = `
    <path style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke:${strokeColor};stroke-opacity:1;stroke-miterlimit:4;" d="M 21.998437 12 C 21.998437 12 18.998437 18 12 18 C 5.001562 18 2.001562 12 2.001562 12 C 2.001562 12 5.001562 6 12 6 C 18.998437 6 21.998437 12 21.998437 12 Z M 21.998437 12 " transform="matrix(0.833333,0,0,0.833333,0,0)"/>
    <path style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke:${strokeColor};stroke-opacity:1;stroke-miterlimit:4;" d="M 15 12 C 15 13.654687 13.654687 15 12 15 C 10.345312 15 9 13.654687 9 12 C 9 10.345312 10.345312 9 12 9 C 13.654687 9 15 10.345312 15 12 Z M 15 12 " transform="matrix(0.833333,0,0,0.833333,0,0)"/>\`
    `;
            let closedEye = `
    <path style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke:${strokeColor};stroke-opacity:1;stroke-miterlimit:4;" d="M 20.001562 9 C 20.001562 9 19.678125 9.665625 18.998437 10.514062 M 12 14.001562 C 10.392187 14.001562 9.046875 13.589062 7.95 12.998437 M 12 14.001562 C 13.607812 14.001562 14.953125 13.589062 16.05 12.998437 M 12 14.001562 L 12 17.498437 M 3.998437 9 C 3.998437 9 4.354687 9.735937 5.104687 10.645312 M 7.95 12.998437 L 5.001562 15.998437 M 7.95 12.998437 C 6.689062 12.328125 5.751562 11.423437 5.104687 10.645312 M 16.05 12.998437 L 18.501562 15.998437 M 16.05 12.998437 C 17.38125 12.290625 18.351562 11.320312 18.998437 10.514062 M 5.104687 10.645312 L 2.001562 12 M 18.998437 10.514062 L 21.998437 12 " transform="matrix(0.833333,0,0,0.833333,0,0)"/>
    `;
            let row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            let div = document.createElement('div');
            let toggle = document.createElement('div');
            toggle.classList.add('legend-toggle-switch');
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "22");
            svg.setAttribute("height", "16");
            let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.innerHTML = openEye;
            let on = true;
            toggle.addEventListener('click', () => {
                if (on) {
                    on = false;
                    group.innerHTML = closedEye;
                    series.applyOptions({
                        visible: false
                    });
                }
                else {
                    on = true;
                    series.applyOptions({
                        visible: true
                    });
                    group.innerHTML = openEye;
                }
            });
            svg.appendChild(group);
            toggle.appendChild(svg);
            row.appendChild(div);
            row.appendChild(toggle);
            this.seriesContainer.appendChild(row);
            const color = series.options().color;
            this._lines.push({
                name: name,
                div: div,
                row: row,
                toggle: toggle,
                series: series,
                solid: color.startsWith('rgba') ? color.replace(/[^,]+(?=\))/, '1') : color
            });
        }
        legendItemFormat(num, decimal) { return num.toFixed(decimal).toString().padStart(8, ' '); }
        shorthandFormat(num) {
            const absNum = Math.abs(num);
            if (absNum >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            else if (absNum >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString().padStart(8, ' ');
        }
        setBgWhite() {
            this.div.style.background = "rgb(255, 255, 255)";
        }
        setBgBlack() {
            this.div.style.background = "rgb(0, 0, 0)";
        }
        legendHandler(param, usingPoint = false) {
            this.setBgWhite();
            if (!this.ohlcEnabled && !this.linesEnabled && !this.percentEnabled) {
                this.div.style.background = "rgb(0, 0, 0)";
                this.setBgWhite();
                return;
            }
            const options = this.handler.series.options();
            if (!param.time) {
                this.div.style.background = "rgb(0, 0, 0)";
                this.candle.style.color = 'transparent';
                this.candle.innerHTML = this.candle.innerHTML.replace(options['upColor'], '').replace(options['downColor'], '');
                this.setBgBlack();
                return;
            }
            let data;
            let logical = null;
            if (usingPoint) {
                const timeScale = this.handler.chart.timeScale();
                let coordinate = timeScale.timeToCoordinate(param.time);
                if (coordinate)
                    logical = timeScale.coordinateToLogical(coordinate.valueOf());
                if (logical)
                    data = this.handler.series.dataByIndex(logical.valueOf());
            }
            else {
                data = param.seriesData.get(this.handler.series);
            }
            this.candle.style.color = '';
            let str = '<span style="line-height: 1.8;">';
            if (data) {
                if (this.ohlcEnabled) {
                    str += `O ${this.legendItemFormat(data.open, this.handler.precision)} `;
                    str += `| H ${this.legendItemFormat(data.high, this.handler.precision)} `;
                    str += `| L ${this.legendItemFormat(data.low, this.handler.precision)} `;
                    str += `| C ${this.legendItemFormat(data.close, this.handler.precision)} `;
                }
                if (this.percentEnabled) {
                    let percentMove = ((data.close - data.open) / data.open) * 100;
                    let color = percentMove > 0 ? options['upColor'] : options['downColor'];
                    let percentStr = `${percentMove >= 0 ? '+' : ''}${percentMove.toFixed(2)} %`;
                    if (this.colorBasedOnCandle) {
                        str += `| <span style="color: ${color};">${percentStr}</span>`;
                    }
                    else {
                        str += '| ' + percentStr;
                    }
                }
                if (this.handler.volumeSeries) {
                    let volumeData;
                    if (logical) {
                        volumeData = this.handler.volumeSeries.dataByIndex(logical);
                    }
                    else {
                        volumeData = param.seriesData.get(this.handler.volumeSeries);
                    }
                    if (volumeData) {
                        str += this.ohlcEnabled ? `<br>V ${this.shorthandFormat(volumeData.value)}` : '';
                    }
                }
            }
            this.candle.innerHTML = str + '</span>';
            this._lines.forEach((e) => {
                if (!this.linesEnabled) {
                    e.row.style.display = 'none';
                    return;
                }
                e.row.style.display = 'flex';
                let data;
                if (usingPoint && logical) {
                    data = e.series.dataByIndex(logical);
                }
                else {
                    data = param.seriesData.get(e.series);
                }
                if (!data?.value)
                    return;
                let price;
                if (e.series.seriesType() == 'Histogram') {
                    price = this.shorthandFormat(data.value);
                }
                else {
                    const format = e.series.options().priceFormat;
                    price = this.legendItemFormat(data.value, format.precision); // couldn't this just be line.options().precision?
                }
                e.div.innerHTML = `<span style="color: ${e.solid};">▨</span>    ${e.name} : ${price}`;
            });
        }
    }

    function ensureDefined(value) {
        if (value === undefined) {
            throw new Error('Value is undefined');
        }
        return value;
    }

    //* PluginBase is a useful base to build a plugin upon which
    //* already handles creating getters for the chart and series,
    //* and provides a requestUpdate method.
    class PluginBase {
        _chart = undefined;
        _series = undefined;
        requestUpdate() {
            if (this._requestUpdate)
                this._requestUpdate();
        }
        _requestUpdate;
        attached({ chart, series, requestUpdate, }) {
            this._chart = chart;
            this._series = series;
            this._series.subscribeDataChanged(this._fireDataUpdated);
            this._requestUpdate = requestUpdate;
            this.requestUpdate();
        }
        detached() {
            this._requestUpdate = undefined;
            // NOTE: The following lines commented out otherwise lightweight-charts
            // throws up error about series being undefined
            // this._chart = undefined;
            // this._series = undefined;
        }
        get chart() {
            return ensureDefined(this._chart);
        }
        get series() {
            return ensureDefined(this._series);
        }
        _fireDataUpdated(scope) {
            if (this.dataUpdated) {
                this.dataUpdated(scope);
            }
        }
    }

    const defaultOptions$2 = {
        lineColor: '#1E80F0',
        lineStyle: lightweightCharts.LineStyle.Solid,
        width: 4,
    };

    var InteractionState;
    (function (InteractionState) {
        InteractionState[InteractionState["NONE"] = 0] = "NONE";
        InteractionState[InteractionState["HOVERING"] = 1] = "HOVERING";
        InteractionState[InteractionState["DRAGGING"] = 2] = "DRAGGING";
        InteractionState[InteractionState["DRAGGINGP1"] = 3] = "DRAGGINGP1";
        InteractionState[InteractionState["DRAGGINGP2"] = 4] = "DRAGGINGP2";
        InteractionState[InteractionState["DRAGGINGP3"] = 5] = "DRAGGINGP3";
        InteractionState[InteractionState["DRAGGINGP4"] = 6] = "DRAGGINGP4";
    })(InteractionState || (InteractionState = {}));
    class Drawing extends PluginBase {
        _paneViews = [];
        _options;
        _points = [];
        _state = InteractionState.NONE;
        _startDragPoint = null;
        _latestHoverPoint = null;
        static _mouseIsDown = false;
        static hoveredObject = null;
        static lastHoveredObject = null;
        _listeners = [];
        constructor(options) {
            super();
            this._options = {
                ...defaultOptions$2,
                ...options,
            };
        }
        updateAllViews() {
            this._paneViews.forEach(pw => pw.update());
        }
        paneViews() {
            return this._paneViews;
        }
        applyOptions(options) {
            this._options = {
                ...this._options,
                ...options,
            };
            this.requestUpdate();
        }
        updatePoints(...points) {
            for (let i = 0; i < this.points.length; i++) {
                if (points[i] == null)
                    continue;
                this.points[i] = points[i];
            }
            this.requestUpdate();
        }
        detach() {
            for (const s of this._listeners) {
                document.body.removeEventListener(s.name, s.listener);
            }
            this._listeners = [];
            this._options.lineColor = 'transparent';
            this.series.detachPrimitive(this);
            this.requestUpdate();
            this.detached();
        }
        get points() {
            return this._points;
        }
        _subscribe(name, listener) {
            document.body.addEventListener(name, listener);
            this._listeners.push({ name: name, listener: listener });
        }
        _unsubscribe(name, callback) {
            document.body.removeEventListener(name, callback);
            const toRemove = this._listeners.find((x) => x.name === name && x.listener === callback);
            this._listeners.splice(this._listeners.indexOf(toRemove), 1);
        }
        _handleHoverInteraction(param) {
            this._latestHoverPoint = param.point;
            if (Drawing._mouseIsDown) {
                this._handleDragInteraction(param);
            }
            else {
                if (this._mouseIsOverDrawing(param)) {
                    if (this._state != InteractionState.NONE)
                        return;
                    this._moveToState(InteractionState.HOVERING);
                    Drawing.hoveredObject = Drawing.lastHoveredObject = this;
                }
                else {
                    if (this._state == InteractionState.NONE)
                        return;
                    this._moveToState(InteractionState.NONE);
                    if (Drawing.hoveredObject === this)
                        Drawing.hoveredObject = null;
                }
            }
        }
        static _eventToPoint(param, series) {
            if (!series || !param.point || !param.logical)
                return null;
            const barPrice = series.coordinateToPrice(param.point.y);
            if (barPrice == null)
                return null;
            return {
                time: param.time || null,
                logical: param.logical,
                price: barPrice.valueOf(),
            };
        }
        static _getDiff(p1, p2) {
            const diff = {
                logical: p1.logical - p2.logical,
                price: p1.price - p2.price,
            };
            return diff;
        }
        _addDiffToPoint(point, logicalDiff, priceDiff) {
            if (!point)
                return;
            point.logical = point.logical + logicalDiff;
            point.price = point.price + priceDiff;
            point.time = this.series.dataByIndex(point.logical)?.time || null;
        }
        _handleMouseDownInteraction = () => {
            // if (Drawing._mouseIsDown) return;
            Drawing._mouseIsDown = true;
            this._onMouseDown();
        };
        _handleMouseUpInteraction = () => {
            // if (!Drawing._mouseIsDown) return;
            Drawing._mouseIsDown = false;
            this._moveToState(InteractionState.HOVERING);
        };
        _handleDragInteraction(param) {
            if (this._state != InteractionState.DRAGGING &&
                this._state != InteractionState.DRAGGINGP1 &&
                this._state != InteractionState.DRAGGINGP2 &&
                this._state != InteractionState.DRAGGINGP3 &&
                this._state != InteractionState.DRAGGINGP4) {
                return;
            }
            const mousePoint = Drawing._eventToPoint(param, this.series);
            if (!mousePoint)
                return;
            this._startDragPoint = this._startDragPoint || mousePoint;
            const diff = Drawing._getDiff(mousePoint, this._startDragPoint);
            this._onDrag(diff);
            this.requestUpdate();
            this._startDragPoint = mousePoint;
        }
    }

    class DrawingPaneRenderer {
        _options;
        constructor(options) {
            this._options = options;
        }
    }
    class TwoPointDrawingPaneRenderer extends DrawingPaneRenderer {
        _p1;
        _p2;
        _hovered;
        constructor(p1, p2, options, hovered) {
            super(options);
            this._p1 = p1;
            this._p2 = p2;
            this._hovered = hovered;
        }
        _getScaledCoordinates(scope) {
            if (this._p1.x === null || this._p1.y === null ||
                this._p2.x === null || this._p2.y === null)
                return null;
            return {
                x1: Math.round(this._p1.x * scope.horizontalPixelRatio),
                y1: Math.round(this._p1.y * scope.verticalPixelRatio),
                x2: Math.round(this._p2.x * scope.horizontalPixelRatio),
                y2: Math.round(this._p2.y * scope.verticalPixelRatio),
            };
        }
        // _drawTextLabel(scope: BitmapCoordinatesRenderingScope, text: string, x: number, y: number, left: boolean) {
        //  scope.context.font = '24px Arial';
        //  scope.context.beginPath();
        //  const offset = 5 * scope.horizontalPixelRatio;
        //  const textWidth = scope.context.measureText(text);
        //  const leftAdjustment = left ? textWidth.width + offset * 4 : 0;
        //  scope.context.fillStyle = this._options.labelBackgroundColor;
        //  scope.context.roundRect(x + offset - leftAdjustment, y - 24, textWidth.width + offset * 2,  24 + offset, 5);
        //  scope.context.fill();
        //  scope.context.beginPath();
        //  scope.context.fillStyle = this._options.labelTextColor;
        //  scope.context.fillText(text, x + offset * 2 - leftAdjustment, y);
        // }
        _drawEndCircle(scope, x, y) {
            const radius = 9;
            scope.context.fillStyle = '#000';
            scope.context.beginPath();
            scope.context.arc(x, y, radius, 0, 2 * Math.PI);
            scope.context.stroke();
            scope.context.fill();
            // scope.context.strokeStyle = this._options.lineColor;
        }
    }

    function setLineStyle(ctx, style) {
        const dashPatterns = {
            [lightweightCharts.LineStyle.Solid]: [],
            [lightweightCharts.LineStyle.Dotted]: [ctx.lineWidth, ctx.lineWidth],
            [lightweightCharts.LineStyle.Dashed]: [2 * ctx.lineWidth, 2 * ctx.lineWidth],
            [lightweightCharts.LineStyle.LargeDashed]: [6 * ctx.lineWidth, 6 * ctx.lineWidth],
            [lightweightCharts.LineStyle.SparseDotted]: [ctx.lineWidth, 4 * ctx.lineWidth],
        };
        const dashPattern = dashPatterns[style];
        ctx.setLineDash(dashPattern);
    }

    class HorizontalLinePaneRenderer extends DrawingPaneRenderer {
        _point = { x: null, y: null };
        constructor(point, options) {
            super(options);
            this._point = point;
        }
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                if (this._point.y == null)
                    return;
                const ctx = scope.context;
                const scaledY = Math.round(this._point.y * scope.verticalPixelRatio);
                const scaledX = this._point.x ? this._point.x * scope.horizontalPixelRatio : 0;
                ctx.lineWidth = this._options.width;
                ctx.strokeStyle = this._options.lineColor;
                setLineStyle(ctx, this._options.lineStyle);
                ctx.beginPath();
                ctx.moveTo(scaledX, scaledY);
                ctx.lineTo(scope.bitmapSize.width, scaledY);
                ctx.stroke();
            });
        }
    }

    class DrawingPaneView {
        _source;
        constructor(source) {
            this._source = source;
        }
    }
    class TwoPointDrawingPaneView extends DrawingPaneView {
        _p1 = { x: null, y: null };
        _p2 = { x: null, y: null };
        _source;
        constructor(source) {
            super(source);
            this._source = source;
        }
        update() {
            if (!this._source.p1 || !this._source.p2)
                return;
            const series = this._source.series;
            const y1 = series.priceToCoordinate(this._source.p1.price);
            const y2 = series.priceToCoordinate(this._source.p2.price);
            const x1 = this._getX(this._source.p1);
            const x2 = this._getX(this._source.p2);
            this._p1 = { x: x1, y: y1 };
            this._p2 = { x: x2, y: y2 };
            if (!x1 || !x2 || !y1 || !y2)
                return;
        }
        _getX(p) {
            const timeScale = this._source.chart.timeScale();
            return timeScale.logicalToCoordinate(p.logical);
        }
    }

    class HorizontalLinePaneView extends DrawingPaneView {
        _source;
        _point = { x: null, y: null };
        constructor(source) {
            super(source);
            this._source = source;
        }
        update() {
            const point = this._source._point;
            const timeScale = this._source.chart.timeScale();
            const series = this._source.series;
            if (this._source._type == "RayLine") {
                this._point.x = point.time ? timeScale.timeToCoordinate(point.time) : timeScale.logicalToCoordinate(point.logical);
            }
            this._point.y = series.priceToCoordinate(point.price);
        }
        renderer() {
            return new HorizontalLinePaneRenderer(this._point, this._source._options);
        }
    }

    class HorizontalLineAxisView {
        _source;
        _y = null;
        _price = null;
        constructor(source) {
            this._source = source;
        }
        update() {
            if (!this._source.series || !this._source._point)
                return;
            this._y = this._source.series.priceToCoordinate(this._source._point.price);
            const priceFormat = this._source.series.options().priceFormat;
            const precision = priceFormat.precision;
            this._price = this._source._point.price.toFixed(precision).toString();
        }
        visible() {
            return true;
        }
        tickVisible() {
            return true;
        }
        coordinate() {
            return this._y ?? 0;
        }
        text() {
            return this._source._options.text || this._price || '';
        }
        textColor() {
            return 'white';
        }
        backColor() {
            return this._source._options.lineColor;
        }
    }

    class HorizontalLine extends Drawing {
        _type = 'HorizontalLine';
        _paneViews;
        _point;
        _callbackName;
        _priceAxisViews;
        _startDragPoint = null;
        constructor(point, options, callbackName = null) {
            super(options);
            this._point = point;
            this._point.time = null; // time is null for horizontal lines
            this._paneViews = [new HorizontalLinePaneView(this)];
            this._priceAxisViews = [new HorizontalLineAxisView(this)];
            this._callbackName = callbackName;
        }
        get points() {
            return [this._point];
        }
        updatePoints(...points) {
            for (const p of points)
                if (p)
                    this._point.price = p.price;
            this.requestUpdate();
        }
        updateAllViews() {
            this._paneViews.forEach((pw) => pw.update());
            this._priceAxisViews.forEach((tw) => tw.update());
        }
        priceAxisViews() {
            return this._priceAxisViews;
        }
        _moveToState(state) {
            switch (state) {
                case InteractionState.NONE:
                    document.body.style.cursor = "default";
                    this._subscribe('dblclick', this._onDoubleClick);
                    this._unsubscribe("mousedown", this._handleMouseDownInteraction);
                    break;
                case InteractionState.HOVERING:
                    document.body.style.cursor = "pointer";
                    this._subscribe('dblclick', this._onDoubleClick);
                    this._unsubscribe("mouseup", this._childHandleMouseUpInteraction);
                    this._subscribe("mousedown", this._handleMouseDownInteraction);
                    this.chart.applyOptions({ handleScroll: true });
                    break;
                case InteractionState.DRAGGING:
                    document.body.style.cursor = "grabbing";
                    this._subscribe("mouseup", this._childHandleMouseUpInteraction);
                    this.chart.applyOptions({ handleScroll: false });
                    break;
            }
            this._state = state;
        }
        detach() {
            window.callbackFunction(`${this._callbackName}_~_delete;;;${this._point.price.toFixed(8)}`);
            this._moveToState = () => { };
            this._handleMouseDownInteraction = () => { };
            this._handleMouseUpInteraction = () => { };
            this._childHandleMouseUpInteraction = () => { };
            this._mouseIsOverDrawing = () => { };
            this._onMouseDown = () => { };
            this._onDoubleClick = () => { };
            super.detach();
        }
        _onDrag(diff) {
            this._addDiffToPoint(this._point, 0, diff.price);
            this.requestUpdate();
        }
        _mouseIsOverDrawing(param, tolerance = 4) {
            if (!param.point)
                return false;
            const y = this.series.priceToCoordinate(this._point.price);
            if (!y)
                return false;
            return (Math.abs(y - param.point.y) < tolerance);
        }
        _onMouseDown() {
            this._startDragPoint = null;
            const hoverPoint = this._latestHoverPoint;
            if (!hoverPoint)
                return;
            return this._moveToState(InteractionState.DRAGGING);
        }
        _childHandleMouseUpInteraction = () => {
            this._handleMouseUpInteraction();
            if (!this._callbackName)
                return;
            window.callbackFunction(`${this._callbackName}_~_${this._point.price.toFixed(8)}`);
        };
        _onDoubleClick = () => {
            const hoverPoint = this._latestHoverPoint;
            if (!hoverPoint)
                return;
            // const isCtrlPressed = event.ctrlKey;
            // const isAltPressed = event.altKey;
            // const isShiftPressed = event.shiftKey;
            // Example logic based on modifiers
            // console.log(
            //     "Double-click detected at:", hoverPoint,
            //     "Modifiers:", { isCtrlPressed, isAltPressed, isShiftPressed }
            // );
            if (this._callbackName) {
                window.callbackFunction(`${this._callbackName}_~_dblclick;;;${this._point.price.toFixed(8)}`);
            }
        };
    }

    class DrawingTool {
        _chart;
        _series;
        _finishDrawingCallback = null;
        _drawings = [];
        _activeDrawing = null;
        _isDrawing = false;
        _drawingType = null;
        constructor(chart, series, finishDrawingCallback = null) {
            this._chart = chart;
            this._series = series;
            this._finishDrawingCallback = finishDrawingCallback;
            this._chart.subscribeClick(this._clickHandler);
            this._chart.subscribeCrosshairMove(this._moveHandler);
        }
        _clickHandler = (param) => this._onClick(param);
        _moveHandler = (param) => this._onMouseMove(param);
        beginDrawing(DrawingType) {
            this._drawingType = DrawingType;
            this._isDrawing = true;
        }
        stopDrawing() {
            this._isDrawing = false;
            this._activeDrawing = null;
        }
        get drawings() {
            return this._drawings;
        }
        addNewDrawing(drawing) {
            this._series.attachPrimitive(drawing);
            this._drawings.push(drawing);
        }
        delete(d) {
            if (d == null)
                return;
            const idx = this._drawings.indexOf(d);
            if (idx !== -1) {
                this._drawings.splice(idx, 1);
            }
            else {
                console.log("Index of drawing not found. Expect trouble");
            }
            d.detach();
        }
        clearDrawings() {
            for (const d of this._drawings)
                d.detach();
            this._drawings = [];
        }
        repositionOnTime() {
            for (const drawing of this.drawings) {
                const newPoints = [];
                for (const point of drawing.points) {
                    if (!point) {
                        newPoints.push(point);
                        continue;
                    }
                    const logical = point.time ? this._chart.timeScale()
                        .coordinateToLogical(this._chart.timeScale().timeToCoordinate(point.time) || 0) : point.logical;
                    newPoints.push({
                        time: point.time,
                        logical: logical,
                        price: point.price,
                    });
                }
                drawing.updatePoints(...newPoints);
            }
        }
        _onClick(param) {
            if (!this._isDrawing)
                return;
            const point = Drawing._eventToPoint(param, this._series);
            if (!point)
                return;
            if (this._activeDrawing == null) {
                if (this._drawingType == null)
                    return;
                this._activeDrawing = new this._drawingType(point, point);
                this._series.attachPrimitive(this._activeDrawing);
                if (this._drawingType == HorizontalLine)
                    this._onClick(param);
            }
            else {
                this._drawings.push(this._activeDrawing);
                this.stopDrawing();
                if (!this._finishDrawingCallback)
                    return;
                this._finishDrawingCallback();
            }
        }
        _onMouseMove(param) {
            if (!param)
                return;
            for (const t of this._drawings)
                t._handleHoverInteraction(param);
            if (!this._isDrawing || !this._activeDrawing)
                return;
            const point = Drawing._eventToPoint(param, this._series);
            if (!point)
                return;
            this._activeDrawing.updatePoints(null, point);
            // this._activeDrawing.setSecondPoint(point);
        }
    }

    class TrendLinePaneRenderer extends TwoPointDrawingPaneRenderer {
        constructor(p1, p2, options, hovered) {
            super(p1, p2, options, hovered);
        }
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                if (this._p1.x === null ||
                    this._p1.y === null ||
                    this._p2.x === null ||
                    this._p2.y === null)
                    return;
                const ctx = scope.context;
                const scaled = this._getScaledCoordinates(scope);
                if (!scaled)
                    return;
                ctx.lineWidth = this._options.width;
                ctx.strokeStyle = this._options.lineColor;
                setLineStyle(ctx, this._options.lineStyle);
                ctx.beginPath();
                ctx.moveTo(scaled.x1, scaled.y1);
                ctx.lineTo(scaled.x2, scaled.y2);
                ctx.stroke();
                // this._drawTextLabel(scope, this._text1, x1Scaled, y1Scaled, true);
                // this._drawTextLabel(scope, this._text2, x2Scaled, y2Scaled, false);
                if (!this._hovered)
                    return;
                this._drawEndCircle(scope, scaled.x1, scaled.y1);
                this._drawEndCircle(scope, scaled.x2, scaled.y2);
            });
        }
    }

    class TrendLinePaneView extends TwoPointDrawingPaneView {
        constructor(source) {
            super(source);
        }
        renderer() {
            return new TrendLinePaneRenderer(this._p1, this._p2, this._source._options, this._source.hovered);
        }
    }

    class TwoPointDrawing extends Drawing {
        _paneViews = [];
        _hovered = false;
        constructor(p1, p2, options) {
            super();
            this.points.push(p1);
            this.points.push(p2);
            this._options = {
                ...defaultOptions$2,
                ...options,
            };
        }
        setFirstPoint(point) {
            this.updatePoints(point);
        }
        setSecondPoint(point) {
            this.updatePoints(null, point);
        }
        get p1() { return this.points[0]; }
        get p2() { return this.points[1]; }
        get hovered() { return this._hovered; }
    }

    class TrendLine extends TwoPointDrawing {
        _type = "TrendLine";
        constructor(p1, p2, options) {
            super(p1, p2, options);
            this._paneViews = [new TrendLinePaneView(this)];
        }
        _moveToState(state) {
            switch (state) {
                case InteractionState.NONE:
                    document.body.style.cursor = "default";
                    this._hovered = false;
                    this.requestUpdate();
                    this._unsubscribe("mousedown", this._handleMouseDownInteraction);
                    break;
                case InteractionState.HOVERING:
                    document.body.style.cursor = "pointer";
                    this._hovered = true;
                    this.requestUpdate();
                    this._subscribe("mousedown", this._handleMouseDownInteraction);
                    this._unsubscribe("mouseup", this._handleMouseDownInteraction);
                    this.chart.applyOptions({ handleScroll: true });
                    break;
                case InteractionState.DRAGGINGP1:
                case InteractionState.DRAGGINGP2:
                case InteractionState.DRAGGING:
                    document.body.style.cursor = "grabbing";
                    this._subscribe("mouseup", this._handleMouseUpInteraction);
                    this.chart.applyOptions({ handleScroll: false });
                    break;
            }
            this._state = state;
        }
        _onDrag(diff) {
            if (this._state == InteractionState.DRAGGING || this._state == InteractionState.DRAGGINGP1) {
                this._addDiffToPoint(this.p1, diff.logical, diff.price);
            }
            if (this._state == InteractionState.DRAGGING || this._state == InteractionState.DRAGGINGP2) {
                this._addDiffToPoint(this.p2, diff.logical, diff.price);
            }
        }
        _onMouseDown() {
            this._startDragPoint = null;
            const hoverPoint = this._latestHoverPoint;
            if (!hoverPoint)
                return;
            const p1 = this._paneViews[0]._p1;
            const p2 = this._paneViews[0]._p2;
            if (!p1.x || !p2.x || !p1.y || !p2.y)
                return this._moveToState(InteractionState.DRAGGING);
            const tolerance = 10;
            if (Math.abs(hoverPoint.x - p1.x) < tolerance && Math.abs(hoverPoint.y - p1.y) < tolerance) {
                this._moveToState(InteractionState.DRAGGINGP1);
            }
            else if (Math.abs(hoverPoint.x - p2.x) < tolerance && Math.abs(hoverPoint.y - p2.y) < tolerance) {
                this._moveToState(InteractionState.DRAGGINGP2);
            }
            else {
                this._moveToState(InteractionState.DRAGGING);
            }
        }
        _mouseIsOverDrawing(param, tolerance = 4) {
            if (!param.point)
                return false;
            const x1 = this._paneViews[0]._p1.x;
            const y1 = this._paneViews[0]._p1.y;
            const x2 = this._paneViews[0]._p2.x;
            const y2 = this._paneViews[0]._p2.y;
            if (!x1 || !x2 || !y1 || !y2)
                return false;
            const mouseX = param.point.x;
            const mouseY = param.point.y;
            if (mouseX <= Math.min(x1, x2) - tolerance ||
                mouseX >= Math.max(x1, x2) + tolerance) {
                return false;
            }
            const distance = Math.abs((y2 - y1) * mouseX - (x2 - x1) * mouseY + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
            return distance <= tolerance;
        }
    }

    class BoxPaneRenderer extends TwoPointDrawingPaneRenderer {
        constructor(p1, p2, options, showCircles) {
            super(p1, p2, options, showCircles);
        }
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                const ctx = scope.context;
                const scaled = this._getScaledCoordinates(scope);
                if (!scaled)
                    return;
                ctx.lineWidth = this._options.width;
                ctx.strokeStyle = this._options.lineColor;
                setLineStyle(ctx, this._options.lineStyle);
                ctx.fillStyle = this._options.fillColor;
                const mainX = Math.min(scaled.x1, scaled.x2);
                const mainY = Math.min(scaled.y1, scaled.y2);
                const width = Math.abs(scaled.x1 - scaled.x2);
                const height = Math.abs(scaled.y1 - scaled.y2);
                ctx.strokeRect(mainX, mainY, width, height);
                ctx.fillRect(mainX, mainY, width, height);
                if (!this._hovered)
                    return;
                this._drawEndCircle(scope, mainX, mainY);
                this._drawEndCircle(scope, mainX + width, mainY);
                this._drawEndCircle(scope, mainX + width, mainY + height);
                this._drawEndCircle(scope, mainX, mainY + height);
            });
        }
    }

    class BoxPaneView extends TwoPointDrawingPaneView {
        constructor(source) {
            super(source);
        }
        renderer() {
            return new BoxPaneRenderer(this._p1, this._p2, this._source._options, this._source.hovered);
        }
    }

    const defaultBoxOptions = {
        fillEnabled: true,
        fillColor: 'rgba(255, 255, 255, 0.2)',
        ...defaultOptions$2
    };
    class Box extends TwoPointDrawing {
        _type = "Box";
        constructor(p1, p2, options) {
            super(p1, p2, options);
            this._options = {
                ...defaultBoxOptions,
                ...options,
            };
            this._paneViews = [new BoxPaneView(this)];
        }
        // autoscaleInfo(startTimePoint: Logical, endTimePoint: Logical): AutoscaleInfo | null {
        // const p1Index = this._pointIndex(this._p1);
        // const p2Index = this._pointIndex(this._p2);
        // if (p1Index === null || p2Index === null) return null;
        // if (endTimePoint < p1Index || startTimePoint > p2Index) return null;
        // return {
        //  priceRange: {
        //      minValue: this._minPrice,
        //      maxValue: this._maxPrice,
        //  },
        // };
        // }
        _moveToState(state) {
            switch (state) {
                case InteractionState.NONE:
                    document.body.style.cursor = "default";
                    this._hovered = false;
                    this._unsubscribe("mousedown", this._handleMouseDownInteraction);
                    break;
                case InteractionState.HOVERING:
                    document.body.style.cursor = "pointer";
                    this._hovered = true;
                    this._unsubscribe("mouseup", this._handleMouseUpInteraction);
                    this._subscribe("mousedown", this._handleMouseDownInteraction);
                    this.chart.applyOptions({ handleScroll: true });
                    break;
                case InteractionState.DRAGGINGP1:
                case InteractionState.DRAGGINGP2:
                case InteractionState.DRAGGINGP3:
                case InteractionState.DRAGGINGP4:
                case InteractionState.DRAGGING:
                    document.body.style.cursor = "grabbing";
                    document.body.addEventListener("mouseup", this._handleMouseUpInteraction);
                    this._subscribe("mouseup", this._handleMouseUpInteraction);
                    this.chart.applyOptions({ handleScroll: false });
                    break;
            }
            this._state = state;
        }
        _onDrag(diff) {
            if (this._state == InteractionState.DRAGGING || this._state == InteractionState.DRAGGINGP1) {
                this._addDiffToPoint(this.p1, diff.logical, diff.price);
            }
            if (this._state == InteractionState.DRAGGING || this._state == InteractionState.DRAGGINGP2) {
                this._addDiffToPoint(this.p2, diff.logical, diff.price);
            }
            if (this._state != InteractionState.DRAGGING) {
                if (this._state == InteractionState.DRAGGINGP3) {
                    this._addDiffToPoint(this.p1, diff.logical, 0);
                    this._addDiffToPoint(this.p2, 0, diff.price);
                }
                if (this._state == InteractionState.DRAGGINGP4) {
                    this._addDiffToPoint(this.p1, 0, diff.price);
                    this._addDiffToPoint(this.p2, diff.logical, 0);
                }
            }
        }
        _onMouseDown() {
            this._startDragPoint = null;
            const hoverPoint = this._latestHoverPoint;
            const p1 = this._paneViews[0]._p1;
            const p2 = this._paneViews[0]._p2;
            if (!p1.x || !p2.x || !p1.y || !p2.y)
                return this._moveToState(InteractionState.DRAGGING);
            const tolerance = 10;
            if (Math.abs(hoverPoint.x - p1.x) < tolerance && Math.abs(hoverPoint.y - p1.y) < tolerance) {
                this._moveToState(InteractionState.DRAGGINGP1);
            }
            else if (Math.abs(hoverPoint.x - p2.x) < tolerance && Math.abs(hoverPoint.y - p2.y) < tolerance) {
                this._moveToState(InteractionState.DRAGGINGP2);
            }
            else if (Math.abs(hoverPoint.x - p1.x) < tolerance && Math.abs(hoverPoint.y - p2.y) < tolerance) {
                this._moveToState(InteractionState.DRAGGINGP3);
            }
            else if (Math.abs(hoverPoint.x - p2.x) < tolerance && Math.abs(hoverPoint.y - p1.y) < tolerance) {
                this._moveToState(InteractionState.DRAGGINGP4);
            }
            else {
                this._moveToState(InteractionState.DRAGGING);
            }
        }
        _mouseIsOverDrawing(param, tolerance = 4) {
            if (!param.point)
                return false;
            const x1 = this._paneViews[0]._p1.x;
            const y1 = this._paneViews[0]._p1.y;
            const x2 = this._paneViews[0]._p2.x;
            const y2 = this._paneViews[0]._p2.y;
            if (!x1 || !x2 || !y1 || !y2)
                return false;
            const mouseX = param.point.x;
            const mouseY = param.point.y;
            const mainX = Math.min(x1, x2);
            const mainY = Math.min(y1, y2);
            const width = Math.abs(x1 - x2);
            const height = Math.abs(y1 - y2);
            const halfTolerance = tolerance / 2;
            return mouseX > mainX - halfTolerance && mouseX < mainX + width + halfTolerance &&
                mouseY > mainY - halfTolerance && mouseY < mainY + height + halfTolerance;
        }
    }

    class ColorPicker {
        colorOption;
        static colors = [
            '#EBB0B0', '#E9CEA1', '#E5DF80', '#ADEB97', '#A3C3EA', '#D8BDED',
            '#E15F5D', '#E1B45F', '#E2D947', '#4BE940', '#639AE1', '#D7A0E8',
            '#E42C2A', '#E49D30', '#E7D827', '#3CFF0A', '#3275E4', '#B06CE3',
            '#F3000D', '#EE9A14', '#F1DA13', '#2DFC0F', '#1562EE', '#BB00EF',
            '#B50911', '#E3860E', '#D2BD11', '#48DE0E', '#1455B4', '#6E009F',
            '#7C1713', '#B76B12', '#8D7A13', '#479C12', '#165579', '#51007E',
        ];
        _div;
        saveDrawings;
        opacity = 0;
        _opacitySlider;
        _opacityLabel;
        rgba;
        constructor(saveDrawings, colorOption) {
            this.colorOption = colorOption;
            this.saveDrawings = saveDrawings;
            this._div = document.createElement('div');
            this._div.classList.add('color-picker');
            let colorPicker = document.createElement('div');
            colorPicker.style.margin = '10px';
            colorPicker.style.display = 'flex';
            colorPicker.style.flexWrap = 'wrap';
            ColorPicker.colors.forEach((color) => colorPicker.appendChild(this.makeColorBox(color)));
            let separator = document.createElement('div');
            separator.style.backgroundColor = window.pane.borderColor;
            separator.style.height = '1px';
            separator.style.width = '130px';
            let opacity = document.createElement('div');
            opacity.style.margin = '10px';
            let opacityText = document.createElement('div');
            opacityText.style.color = 'lightgray';
            opacityText.style.fontSize = '12px';
            opacityText.innerText = 'Opacity';
            this._opacityLabel = document.createElement('div');
            this._opacityLabel.style.color = 'lightgray';
            this._opacityLabel.style.fontSize = '12px';
            this._opacitySlider = document.createElement('input');
            this._opacitySlider.type = 'range';
            this._opacitySlider.value = (this.opacity * 100).toString();
            this._opacityLabel.innerText = this._opacitySlider.value + '%';
            this._opacitySlider.oninput = () => {
                this._opacityLabel.innerText = this._opacitySlider.value + '%';
                this.opacity = parseInt(this._opacitySlider.value) / 100;
                this.updateColor();
            };
            opacity.appendChild(opacityText);
            opacity.appendChild(this._opacitySlider);
            opacity.appendChild(this._opacityLabel);
            this._div.appendChild(colorPicker);
            this._div.appendChild(separator);
            this._div.appendChild(opacity);
            window.containerDiv.appendChild(this._div);
        }
        _updateOpacitySlider() {
            this._opacitySlider.value = (this.opacity * 100).toString();
            this._opacityLabel.innerText = this._opacitySlider.value + '%';
        }
        makeColorBox(color) {
            const box = document.createElement('div');
            box.style.width = '18px';
            box.style.height = '18px';
            box.style.borderRadius = '3px';
            box.style.margin = '3px';
            box.style.boxSizing = 'border-box';
            box.style.backgroundColor = color;
            box.addEventListener('mouseover', () => box.style.border = '2px solid lightgray');
            box.addEventListener('mouseout', () => box.style.border = 'none');
            const rgba = ColorPicker.extractRGBA(color);
            box.addEventListener('click', () => {
                this.rgba = rgba;
                this.updateColor();
            });
            return box;
        }
        static extractRGBA(anyColor) {
            const dummyElem = document.createElement('div');
            dummyElem.style.color = anyColor;
            document.body.appendChild(dummyElem);
            const computedColor = getComputedStyle(dummyElem).color;
            document.body.removeChild(dummyElem);
            const rgb = computedColor.match(/\d+/g)?.map(Number);
            if (!rgb)
                return [];
            let isRgba = computedColor.includes('rgba');
            let opacity = isRgba ? parseFloat(computedColor.split(',')[3]) : 1;
            return [rgb[0], rgb[1], rgb[2], opacity];
        }
        updateColor() {
            if (!Drawing.lastHoveredObject || !this.rgba)
                return;
            const oColor = `rgba(${this.rgba[0]}, ${this.rgba[1]}, ${this.rgba[2]}, ${this.opacity})`;
            Drawing.lastHoveredObject.applyOptions({ [this.colorOption]: oColor });
            this.saveDrawings();
        }
        openMenu(rect) {
            if (!Drawing.lastHoveredObject)
                return;
            this.rgba = ColorPicker.extractRGBA(Drawing.lastHoveredObject._options[this.colorOption]);
            this.opacity = this.rgba[3];
            this._updateOpacitySlider();
            this._div.style.top = (rect.top - 30) + 'px';
            this._div.style.left = rect.right + 'px';
            this._div.style.display = 'flex';
            setTimeout(() => document.addEventListener('mousedown', (event) => {
                if (!this._div.contains(event.target)) {
                    this.closeMenu();
                }
            }), 10);
        }
        closeMenu() {
            document.body.removeEventListener('click', this.closeMenu);
            this._div.style.display = 'none';
        }
    }

    class StylePicker {
        static _styles = [
            { name: 'Solid', var: lightweightCharts.LineStyle.Solid },
            { name: 'Dotted', var: lightweightCharts.LineStyle.Dotted },
            { name: 'Dashed', var: lightweightCharts.LineStyle.Dashed },
            { name: 'Large Dashed', var: lightweightCharts.LineStyle.LargeDashed },
            { name: 'Sparse Dotted', var: lightweightCharts.LineStyle.SparseDotted },
        ];
        _div;
        _saveDrawings;
        constructor(saveDrawings) {
            this._saveDrawings = saveDrawings;
            this._div = document.createElement('div');
            this._div.classList.add('context-menu');
            StylePicker._styles.forEach((style) => {
                this._div.appendChild(this._makeTextBox(style.name, style.var));
            });
            window.containerDiv.appendChild(this._div);
        }
        _makeTextBox(text, style) {
            const item = document.createElement('span');
            item.classList.add('context-menu-item');
            item.innerText = text;
            item.addEventListener('click', () => {
                Drawing.lastHoveredObject?.applyOptions({ lineStyle: style });
                this._saveDrawings();
            });
            return item;
        }
        openMenu(rect) {
            this._div.style.top = (rect.top - 30) + 'px';
            this._div.style.left = rect.right + 'px';
            this._div.style.display = 'block';
            setTimeout(() => document.addEventListener('mousedown', (event) => {
                if (!this._div.contains(event.target)) {
                    this.closeMenu();
                }
            }), 10);
        }
        closeMenu() {
            document.removeEventListener('click', this.closeMenu);
            this._div.style.display = 'none';
        }
    }

    function camelToTitle(inputString) {
        const result = [];
        for (const c of inputString) {
            if (result.length == 0) {
                result.push(c.toUpperCase());
            }
            else if (c == c.toUpperCase()) {
                result.push(' ' + c);
            }
            else
                result.push(c);
        }
        return result.join('');
    }
    class ContextMenu {
        saveDrawings;
        drawingTool;
        div;
        hoverItem;
        items = [];
        constructor(saveDrawings, drawingTool) {
            this.saveDrawings = saveDrawings;
            this.drawingTool = drawingTool;
            this._onRightClick = this._onRightClick.bind(this);
            this.div = document.createElement('div');
            this.div.classList.add('context-menu');
            document.body.appendChild(this.div);
            this.hoverItem = null;
            document.body.addEventListener('contextmenu', this._onRightClick);
        }
        _handleClick = (ev) => this._onClick(ev);
        _onClick(ev) {
            if (!ev.target)
                return;
            if (!this.div.contains(ev.target)) {
                this.div.style.display = 'none';
                document.body.removeEventListener('click', this._handleClick);
            }
        }
        _onRightClick(ev) {
            if (!Drawing.hoveredObject)
                return;
            for (const item of this.items) {
                this.div.removeChild(item);
            }
            this.items = [];
            for (const optionName of Object.keys(Drawing.hoveredObject._options)) {
                let subMenu;
                if (optionName.toLowerCase().includes('color')) {
                    subMenu = new ColorPicker(this.saveDrawings, optionName);
                }
                else if (optionName === 'lineStyle') {
                    subMenu = new StylePicker(this.saveDrawings);
                }
                else
                    continue;
                let onClick = (rect) => subMenu.openMenu(rect);
                this.menuItem(camelToTitle(optionName), onClick, () => {
                    document.removeEventListener('click', subMenu.closeMenu);
                    subMenu._div.style.display = 'none';
                });
            }
            let onClickDelete = () => {
                this.drawingTool.delete(Drawing.lastHoveredObject);
            };
            this.separator();
            this.menuItem('Delete Drawing', onClickDelete);
            // const colorPicker = new ColorPicker(this.saveDrawings)
            // const stylePicker = new StylePicker(this.saveDrawings)
            // let onClickDelete = () => this._drawingTool.delete(Drawing.lastHoveredObject);
            // let onClickColor = (rect: DOMRect) => colorPicker.openMenu(rect)
            // let onClickStyle = (rect: DOMRect) => stylePicker.openMenu(rect)
            // contextMenu.menuItem('Color Picker', onClickColor, () => {
            //     document.removeEventListener('click', colorPicker.closeMenu)
            //     colorPicker._div.style.display = 'none'
            // })
            // contextMenu.menuItem('Style', onClickStyle, () => {
            //     document.removeEventListener('click', stylePicker.closeMenu)
            //     stylePicker._div.style.display = 'none'
            // })
            // contextMenu.separator()
            // contextMenu.menuItem('Delete Drawing', onClickDelete)
            ev.preventDefault();
            this.div.style.left = ev.clientX + 'px';
            this.div.style.top = ev.clientY + 'px';
            this.div.style.display = 'block';
            document.body.addEventListener('click', this._handleClick);
        }
        menuItem(text, action, hover = null) {
            const item = document.createElement('span');
            item.classList.add('context-menu-item');
            this.div.appendChild(item);
            const elem = document.createElement('span');
            elem.innerText = text;
            elem.style.pointerEvents = 'none';
            item.appendChild(elem);
            if (hover) {
                let arrow = document.createElement('span');
                arrow.innerText = `►`;
                arrow.style.fontSize = '8px';
                arrow.style.pointerEvents = 'none';
                item.appendChild(arrow);
            }
            item.addEventListener('mouseover', () => {
                if (this.hoverItem && this.hoverItem.closeAction)
                    this.hoverItem.closeAction();
                this.hoverItem = { elem: elem, action: action, closeAction: hover };
            });
            if (!hover)
                item.addEventListener('click', (event) => { action(event); this.div.style.display = 'none'; });
            else {
                let timeout;
                item.addEventListener('mouseover', () => timeout = setTimeout(() => action(item.getBoundingClientRect()), 100));
                item.addEventListener('mouseout', () => clearTimeout(timeout));
            }
            this.items.push(item);
        }
        separator() {
            const separator = document.createElement('div');
            separator.style.width = '90%';
            separator.style.height = '1px';
            separator.style.margin = '3px 0px';
            separator.style.backgroundColor = window.pane.borderColor;
            this.div.appendChild(separator);
            this.items.push(separator);
        }
    }

    class RayLine extends HorizontalLine {
        _type = 'RayLine';
        constructor(point, options) {
            super({ ...point }, options);
            this._point.time = point.time;
        }
        updatePoints(...points) {
            for (const p of points)
                if (p)
                    this._point = p;
            this.requestUpdate();
        }
        _onDrag(diff) {
            this._addDiffToPoint(this._point, diff.logical, diff.price);
            this.requestUpdate();
        }
        _mouseIsOverDrawing(param, tolerance = 4) {
            if (!param.point)
                return false;
            const y = this.series.priceToCoordinate(this._point.price);
            const x = this._point.time ? this.chart.timeScale().timeToCoordinate(this._point.time) : null;
            if (!y || !x)
                return false;
            return (Math.abs(y - param.point.y) < tolerance && param.point.x > x - tolerance);
        }
    }

    class VerticalLinePaneRenderer extends DrawingPaneRenderer {
        _point = { x: null, y: null };
        constructor(point, options) {
            super(options);
            this._point = point;
        }
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                if (this._point.x == null)
                    return;
                const ctx = scope.context;
                const scaledX = this._point.x * scope.horizontalPixelRatio;
                ctx.lineWidth = this._options.width;
                ctx.strokeStyle = this._options.lineColor;
                setLineStyle(ctx, this._options.lineStyle);
                ctx.beginPath();
                ctx.moveTo(scaledX, 0);
                ctx.lineTo(scaledX, scope.bitmapSize.height);
                ctx.stroke();
            });
        }
    }

    class VerticalLinePaneView extends DrawingPaneView {
        _source;
        _point = { x: null, y: null };
        constructor(source) {
            super(source);
            this._source = source;
        }
        update() {
            const point = this._source._point;
            const timeScale = this._source.chart.timeScale();
            const series = this._source.series;
            this._point.x = point.time ? timeScale.timeToCoordinate(point.time) : timeScale.logicalToCoordinate(point.logical);
            this._point.y = series.priceToCoordinate(point.price);
        }
        renderer() {
            return new VerticalLinePaneRenderer(this._point, this._source._options);
        }
    }

    class VerticalLineTimeAxisView {
        _source;
        _x = null;
        constructor(source) {
            this._source = source;
        }
        update() {
            if (!this._source.chart || !this._source._point)
                return;
            const point = this._source._point;
            const timeScale = this._source.chart.timeScale();
            this._x = point.time ? timeScale.timeToCoordinate(point.time) : timeScale.logicalToCoordinate(point.logical);
        }
        visible() {
            return !!this._source._options.text;
        }
        tickVisible() {
            return true;
        }
        coordinate() {
            return this._x ?? 0;
        }
        text() {
            return this._source._options.text || '';
        }
        textColor() {
            return "white";
        }
        backColor() {
            return this._source._options.lineColor;
        }
    }

    class VerticalLine extends Drawing {
        _type = 'VerticalLine';
        _paneViews;
        _timeAxisViews;
        _point;
        _callbackName;
        _startDragPoint = null;
        constructor(point, options, callbackName = null) {
            super(options);
            this._point = point;
            this._paneViews = [new VerticalLinePaneView(this)];
            this._callbackName = callbackName;
            this._timeAxisViews = [new VerticalLineTimeAxisView(this)];
        }
        updateAllViews() {
            this._paneViews.forEach(pw => pw.update());
            this._timeAxisViews.forEach(tw => tw.update());
        }
        timeAxisViews() {
            return this._timeAxisViews;
        }
        updatePoints(...points) {
            for (const p of points) {
                if (!p)
                    continue;
                if (!p.time && p.logical) {
                    p.time = this.series.dataByIndex(p.logical)?.time || null;
                }
                this._point = p;
            }
            this.requestUpdate();
        }
        get points() {
            return [this._point];
        }
        _moveToState(state) {
            switch (state) {
                case InteractionState.NONE:
                    document.body.style.cursor = "default";
                    this._unsubscribe("mousedown", this._handleMouseDownInteraction);
                    break;
                case InteractionState.HOVERING:
                    document.body.style.cursor = "pointer";
                    this._unsubscribe("mouseup", this._childHandleMouseUpInteraction);
                    this._subscribe("mousedown", this._handleMouseDownInteraction);
                    this.chart.applyOptions({ handleScroll: true });
                    break;
                case InteractionState.DRAGGING:
                    document.body.style.cursor = "grabbing";
                    this._subscribe("mouseup", this._childHandleMouseUpInteraction);
                    this.chart.applyOptions({ handleScroll: false });
                    break;
            }
            this._state = state;
        }
        _onDrag(diff) {
            this._addDiffToPoint(this._point, diff.logical, 0);
            this.requestUpdate();
        }
        _mouseIsOverDrawing(param, tolerance = 4) {
            if (!param.point)
                return false;
            const timeScale = this.chart.timeScale();
            let x;
            if (this._point.time) {
                x = timeScale.timeToCoordinate(this._point.time);
            }
            else {
                x = timeScale.logicalToCoordinate(this._point.logical);
            }
            if (!x)
                return false;
            return (Math.abs(x - param.point.x) < tolerance);
        }
        _onMouseDown() {
            this._startDragPoint = null;
            const hoverPoint = this._latestHoverPoint;
            if (!hoverPoint)
                return;
            return this._moveToState(InteractionState.DRAGGING);
        }
        _childHandleMouseUpInteraction = () => {
            this._handleMouseUpInteraction();
            if (!this._callbackName)
                return;
            window.callbackFunction(`${this._callbackName}_~_${this._point.price.toFixed(8)}`);
        };
    }

    class ToolBox {
        static TREND_SVG = '<rect x="3.84" y="13.67" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -5.9847 14.4482)" width="21.21" height="1.56"/><path d="M23,3.17L20.17,6L23,8.83L25.83,6L23,3.17z M23,7.41L21.59,6L23,4.59L24.41,6L23,7.41z"/><path d="M6,20.17L3.17,23L6,25.83L8.83,23L6,20.17z M6,24.41L4.59,23L6,21.59L7.41,23L6,24.41z"/>';
        static HORZ_SVG = '<rect x="4" y="14" width="9" height="1"/><rect x="16" y="14" width="9" height="1"/><path d="M11.67,14.5l2.83,2.83l2.83-2.83l-2.83-2.83L11.67,14.5z M15.91,14.5l-1.41,1.41l-1.41-1.41l1.41-1.41L15.91,14.5z"/>';
        static RAY_SVG = '<rect x="8" y="14" width="17" height="1"/><path d="M3.67,14.5l2.83,2.83l2.83-2.83L6.5,11.67L3.67,14.5z M7.91,14.5L6.5,15.91L5.09,14.5l1.41-1.41L7.91,14.5z"/>';
        static BOX_SVG = '<rect x="8" y="6" width="12" height="1"/><rect x="9" y="22" width="11" height="1"/><path d="M3.67,6.5L6.5,9.33L9.33,6.5L6.5,3.67L3.67,6.5z M7.91,6.5L6.5,7.91L5.09,6.5L6.5,5.09L7.91,6.5z"/><path d="M19.67,6.5l2.83,2.83l2.83-2.83L22.5,3.67L19.67,6.5z M23.91,6.5L22.5,7.91L21.09,6.5l1.41-1.41L23.91,6.5z"/><path d="M19.67,22.5l2.83,2.83l2.83-2.83l-2.83-2.83L19.67,22.5z M23.91,22.5l-1.41,1.41l-1.41-1.41l1.41-1.41L23.91,22.5z"/><path d="M3.67,22.5l2.83,2.83l2.83-2.83L6.5,19.67L3.67,22.5z M7.91,22.5L6.5,23.91L5.09,22.5l1.41-1.41L7.91,22.5z"/><rect x="22" y="9" width="1" height="11"/><rect x="6" y="9" width="1" height="11"/>';
        static VERT_SVG = ToolBox.RAY_SVG;
        div;
        activeIcon = null;
        buttons = [];
        _commandFunctions;
        _handlerID;
        _drawingTool;
        constructor(handlerID, chart, series, commandFunctions) {
            this._handlerID = handlerID;
            this._commandFunctions = commandFunctions;
            this._drawingTool = new DrawingTool(chart, series, () => this.removeActiveAndSave());
            this.div = this._makeToolBox();
            new ContextMenu(this.saveDrawings, this._drawingTool);
            commandFunctions.push((event) => {
                if ((event.metaKey || event.ctrlKey) && event.code === 'KeyZ') {
                    const drawingToDelete = this._drawingTool.drawings.pop();
                    if (drawingToDelete)
                        this._drawingTool.delete(drawingToDelete);
                    return true;
                }
                return false;
            });
        }
        toJSON() {
            // Exclude the chart attribute from serialization
            const { ...serialized } = this;
            return serialized;
        }
        _makeToolBox() {
            let div = document.createElement('div');
            div.classList.add('toolbox');
            this.buttons.push(this._makeToolBoxElement(TrendLine, 'KeyT', ToolBox.TREND_SVG));
            this.buttons.push(this._makeToolBoxElement(HorizontalLine, 'KeyH', ToolBox.HORZ_SVG));
            this.buttons.push(this._makeToolBoxElement(RayLine, 'KeyR', ToolBox.RAY_SVG));
            this.buttons.push(this._makeToolBoxElement(Box, 'KeyB', ToolBox.BOX_SVG));
            this.buttons.push(this._makeToolBoxElement(VerticalLine, 'KeyV', ToolBox.VERT_SVG, true));
            for (const button of this.buttons) {
                div.appendChild(button);
            }
            return div;
        }
        _makeToolBoxElement(DrawingType, keyCmd, paths, rotate = false) {
            const elem = document.createElement('div');
            elem.classList.add("toolbox-button");
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "29");
            svg.setAttribute("height", "29");
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.innerHTML = paths;
            group.setAttribute("fill", window.pane.color);
            svg.appendChild(group);
            elem.appendChild(svg);
            const icon = { div: elem, group: group, type: DrawingType };
            elem.addEventListener('click', () => this._onIconClick(icon));
            this._commandFunctions.push((event) => {
                if (this._handlerID !== window.handlerInFocus)
                    return false;
                if (event.altKey && event.code === keyCmd) {
                    event.preventDefault();
                    this._onIconClick(icon);
                    return true;
                }
                return false;
            });
            if (rotate == true) {
                svg.style.transform = 'rotate(90deg)';
                svg.style.transformBox = 'fill-box';
                svg.style.transformOrigin = 'center';
            }
            return elem;
        }
        _onIconClick(icon) {
            if (this.activeIcon) {
                this.activeIcon.div.classList.remove('active-toolbox-button');
                window.setCursor('crosshair');
                this._drawingTool?.stopDrawing();
                if (this.activeIcon === icon) {
                    this.activeIcon = null;
                    return;
                }
            }
            this.activeIcon = icon;
            this.activeIcon.div.classList.add('active-toolbox-button');
            window.setCursor('crosshair');
            this._drawingTool?.beginDrawing(this.activeIcon.type);
        }
        removeActiveAndSave = () => {
            window.setCursor('default');
            if (this.activeIcon)
                this.activeIcon.div.classList.remove('active-toolbox-button');
            this.activeIcon = null;
            this.saveDrawings();
        };
        addNewDrawing(d) {
            this._drawingTool.addNewDrawing(d);
        }
        clearDrawings() {
            this._drawingTool.clearDrawings();
        }
        saveDrawings = () => {
            const drawingMeta = [];
            for (const d of this._drawingTool.drawings) {
                drawingMeta.push({
                    type: d._type,
                    points: d.points,
                    options: d._options
                });
            }
            const string = JSON.stringify(drawingMeta);
            window.callbackFunction(`save_drawings${this._handlerID}_~_${string}`);
        };
        loadDrawings(drawings) {
            drawings.forEach((d) => {
                switch (d.type) {
                    case "Box":
                        this._drawingTool.addNewDrawing(new Box(d.points[0], d.points[1], d.options));
                        break;
                    case "TrendLine":
                        this._drawingTool.addNewDrawing(new TrendLine(d.points[0], d.points[1], d.options));
                        break;
                    case "HorizontalLine":
                        this._drawingTool.addNewDrawing(new HorizontalLine(d.points[0], d.options));
                        break;
                    case "RayLine":
                        this._drawingTool.addNewDrawing(new RayLine(d.points[0], d.options));
                        break;
                    case "VerticalLine":
                        this._drawingTool.addNewDrawing(new VerticalLine(d.points[0], d.options));
                        break;
                }
            });
        }
    }

    class Menu {
        makeButton;
        callbackName;
        div;
        isOpen = false;
        widget;
        constructor(makeButton, callbackName, items, activeItem, separator, align) {
            this.makeButton = makeButton;
            this.callbackName = callbackName;
            this.div = document.createElement('div');
            this.div.classList.add('topbar-menu');
            this.widget = this.makeButton(activeItem + ' ↓', null, separator, true, align);
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
                let center = rect.x + (rect.width / 2);
                this.div.style.left = center - (this.div.clientWidth / 2) + 'px';
                this.div.style.top = rect.y + rect.height + 'px';
            });
            document.body.appendChild(this.div);
        }
        updateMenuItems(items) {
            this.div.innerHTML = '';
            items.forEach(text => {
                let button = this.makeButton(text, null, false, false);
                button.elem.addEventListener('click', () => {
                    this._clickHandler(button.elem.innerText);
                });
                button.elem.style.margin = '4px 4px';
                button.elem.style.padding = '2px 2px';
                this.div.appendChild(button.elem);
            });
            this.widget.elem.innerText = items[0] + ' ↓';
        }
        _clickHandler(name) {
            this.widget.elem.innerText = name + ' ↓';
            window.callbackFunction(`${this.callbackName}_~_${name}`);
            this.div.style.display = 'none';
            this.isOpen = false;
        }
    }

    class TopBar {
        _handler;
        _div;
        left;
        right;
        constructor(handler) {
            this._handler = handler;
            this._div = document.createElement('div');
            this._div.classList.add('topbar');
            const createTopBarContainer = (justification) => {
                const div = document.createElement('div');
                div.classList.add('topbar-container');
                div.style.justifyContent = justification;
                this._div.appendChild(div);
                return div;
            };
            this.left = createTopBarContainer('flex-start');
            this.right = createTopBarContainer('flex-end');
        }
        makeSwitcher(items, defaultItem, callbackName, align = 'left') {
            const switcherElement = document.createElement('div');
            switcherElement.style.margin = '4px 12px';
            let activeItemEl;
            const createAndReturnSwitcherButton = (itemName) => {
                const button = document.createElement('button');
                button.classList.add('topbar-button');
                button.classList.add('switcher-button');
                button.style.margin = '0px 2px';
                button.innerText = itemName;
                if (itemName == defaultItem) {
                    activeItemEl = button;
                    button.classList.add('active-switcher-button');
                }
                const buttonWidth = TopBar.getClientWidth(button);
                button.style.minWidth = buttonWidth + 1 + 'px';
                button.addEventListener('click', () => widget.onItemClicked(button));
                switcherElement.appendChild(button);
                return button;
            };
            const widget = {
                elem: switcherElement,
                callbackName: callbackName,
                intervalElements: items.map(createAndReturnSwitcherButton),
                onItemClicked: (item) => {
                    if (item == activeItemEl)
                        return;
                    activeItemEl.classList.remove('active-switcher-button');
                    item.classList.add('active-switcher-button');
                    activeItemEl = item;
                    window.callbackFunction(`${widget.callbackName}_~_${item.innerText}`);
                }
            };
            this.appendWidget(switcherElement, align, true);
            return widget;
        }
        makeTextBoxWidget(text, align = 'left', callbackName = null) {
            if (callbackName) {
                const textBox = document.createElement('input');
                textBox.classList.add('topbar-textbox-input');
                textBox.value = text;
                textBox.style.width = `${(textBox.value.length + 2)}ch`;
                textBox.addEventListener('focus', () => {
                    window.textBoxFocused = true;
                });
                textBox.addEventListener('input', (e) => {
                    e.preventDefault();
                    textBox.style.width = `${(textBox.value.length + 2)}ch`;
                });
                textBox.addEventListener('keydown', (e) => {
                    if (e.key == 'Enter') {
                        e.preventDefault();
                        textBox.blur();
                    }
                });
                textBox.addEventListener('blur', () => {
                    window.callbackFunction(`${callbackName}_~_${textBox.value}`);
                    window.textBoxFocused = false;
                });
                this.appendWidget(textBox, align, true);
                return textBox;
            }
            else {
                const textBox = document.createElement('div');
                textBox.classList.add('topbar-textbox');
                textBox.innerText = text;
                this.appendWidget(textBox, align, true);
                return textBox;
            }
        }
        makeMenu(items, activeItem, separator, callbackName, align) {
            return new Menu(this.makeButton.bind(this), callbackName, items, activeItem, separator, align);
        }
        makeButton(defaultText, callbackName, separator, append = true, align = 'left', toggle = false) {
            let button = document.createElement('button');
            button.classList.add('topbar-button');
            // button.style.color = window.pane.color
            button.innerText = defaultText;
            document.body.appendChild(button);
            button.style.minWidth = button.clientWidth + 1 + 'px';
            document.body.removeChild(button);
            let widget = {
                elem: button,
                callbackName: callbackName
            };
            if (callbackName) {
                let handler;
                if (toggle) {
                    let state = false;
                    handler = () => {
                        state = !state;
                        window.callbackFunction(`${widget.callbackName}_~_${state}`);
                        button.style.backgroundColor = state ? 'var(--active-bg-color)' : '';
                        button.style.color = state ? 'var(--active-color)' : '';
                    };
                }
                else {
                    handler = () => window.callbackFunction(`${widget.callbackName}_~_${button.innerText}`);
                }
                button.addEventListener('click', handler);
            }
            if (append)
                this.appendWidget(button, align, separator);
            return widget;
        }
        makeSeparator(align = 'left') {
            const separator = document.createElement('div');
            separator.classList.add('topbar-seperator');
            const div = align == 'left' ? this.left : this.right;
            div.appendChild(separator);
        }
        appendWidget(widget, align, separator) {
            const div = align == 'left' ? this.left : this.right;
            if (separator) {
                if (align == 'left')
                    div.appendChild(widget);
                this.makeSeparator(align);
                if (align == 'right')
                    div.appendChild(widget);
            }
            else
                div.appendChild(widget);
            this._handler.reSize();
        }
        static getClientWidth(element) {
            document.body.appendChild(element);
            const width = element.clientWidth;
            document.body.removeChild(element);
            return width;
        }
    }

    const buttonWidth = 21;
    const buttonHeight = 21;
    const labelHeight = 17;
    const iconPadding = 4;
    const iconPaddingAlertTop = 2;
    const clockIconViewBoxSize = 13; // Width
    const iconSize = 13;
    const showCentreLabelDistance = 50;
    const averageWidthPerCharacter = 5.81; // doesn't need to be exact, just roughly correct. 12px sans-serif
    const removeButtonWidth = 26;
    const centreLabelHeight = 20;
    const centreLabelInlinePadding = 9;
    const clockPlusIconPaths = [
        new Path2D('M5.34004 1.12254C4.7902 0.438104 3.94626 0 3 0C1.34315 0 0 1.34315 0 3C0 3.94626 0.438104 4.7902 1.12254 5.34004C1.04226 5.714 1 6.10206 1 6.5C1 9.36902 3.19675 11.725 6 11.9776V10.9725C3.75002 10.7238 2 8.81628 2 6.5C2 4.01472 4.01472 2 6.5 2C8.81628 2 10.7238 3.75002 10.9725 6H11.9776C11.9574 5.77589 11.9237 5.55565 11.8775 5.34011C12.562 4.79026 13.0001 3.9463 13.0001 3C13.0001 1.34315 11.6569 0 10.0001 0C9.05382 0 8.20988 0.438111 7.66004 1.12256C7.28606 1.04227 6.89797 1 6.5 1C6.10206 1 5.714 1.04226 5.34004 1.12254ZM4.28255 1.46531C3.93534 1.17484 3.48809 1 3 1C1.89543 1 1 1.89543 1 3C1 3.48809 1.17484 3.93534 1.46531 4.28255C2.0188 3.02768 3.02768 2.0188 4.28255 1.46531ZM8.71751 1.46534C9.97237 2.01885 10.9812 3.02774 11.5347 4.28262C11.8252 3.93541 12.0001 3.48812 12.0001 3C12.0001 1.89543 11.1047 1 10.0001 1C9.51199 1 9.06472 1.17485 8.71751 1.46534Z'),
        new Path2D('M7 7V4H8V8H5V7H7Z'),
        new Path2D('M10 8V10H8V11H10V13H11V11H13V10H11V8H10Z'),
    ];
    const clockIconPaths = [
        new Path2D('M5.11068 1.65894C3.38969 2.08227 1.98731 3.31569 1.33103 4.93171C0.938579 4.49019 0.700195 3.90868 0.700195 3.27148C0.700195 1.89077 1.81948 0.771484 3.2002 0.771484C3.9664 0.771484 4.65209 1.11617 5.11068 1.65894Z'),
        new Path2D('M12.5 3.37148C12.5 4.12192 12.1694 4.79514 11.6458 5.25338C11.0902 3.59304 9.76409 2.2857 8.09208 1.7559C8.55066 1.21488 9.23523 0.871484 10 0.871484C11.3807 0.871484 12.5 1.99077 12.5 3.37148Z'),
        new Path2D('M6.42896 11.4999C8.91424 11.4999 10.929 9.48522 10.929 6.99994C10.929 4.51466 8.91424 2.49994 6.42896 2.49994C3.94367 2.49994 1.92896 4.51466 1.92896 6.99994C1.92896 9.48522 3.94367 11.4999 6.42896 11.4999ZM6.00024 3.99994V6.99994H4.00024V7.99994H7.00024V3.99994H6.00024Z'),
        new Path2D('M4.08902 0.934101C4.4888 1.08621 4.83946 1.33793 5.11068 1.65894C5.06565 1.67001 5.02084 1.68164 4.97625 1.69382C4.65623 1.78123 4.34783 1.89682 4.0539 2.03776C3.16224 2.4653 2.40369 3.12609 1.8573 3.94108C1.64985 4.2505 1.47298 4.58216 1.33103 4.93171C1.05414 4.6202 0.853937 4.23899 0.760047 3.81771C0.720863 3.6419 0.700195 3.45911 0.700195 3.27148C0.700195 1.89077 1.81948 0.771484 3.2002 0.771484C3.51324 0.771484 3.81285 0.829023 4.08902 0.934101ZM12.3317 4.27515C12.4404 3.99488 12.5 3.69015 12.5 3.37148C12.5 1.99077 11.3807 0.871484 10 0.871484C9.66727 0.871484 9.34974 0.936485 9.05938 1.05448C8.68236 1.20769 8.35115 1.45027 8.09208 1.7559C8.43923 1.8659 8.77146 2.00942 9.08499 2.18265C9.96762 2.67034 10.702 3.39356 11.2032 4.26753C11.3815 4.57835 11.5303 4.90824 11.6458 5.25338C11.947 4.98973 12.1844 4.65488 12.3317 4.27515ZM9.18112 3.43939C8.42029 2.85044 7.46556 2.49994 6.42896 2.49994C3.94367 2.49994 1.92896 4.51466 1.92896 6.99994C1.92896 9.48522 3.94367 11.4999 6.42896 11.4999C8.91424 11.4999 10.929 9.48522 10.929 6.99994C10.929 5.55126 10.2444 4.26246 9.18112 3.43939ZM6.00024 3.99994H7.00024V7.99994H4.00024V6.99994H6.00024V3.99994Z'),
    ];
    const crossViewBoxSize = 10;
    const crossPath = new Path2D('M9.35359 1.35359C9.11789 1.11789 8.88219 0.882187 8.64648 0.646484L5.00004 4.29293L1.35359 0.646484C1.11791 0.882212 0.882212 1.11791 0.646484 1.35359L4.29293 5.00004L0.646484 8.64648C0.882336 8.88204 1.11804 9.11774 1.35359 9.35359L5.00004 5.70714L8.64648 9.35359C8.88217 9.11788 9.11788 8.88217 9.35359 8.64649L5.70714 5.00004L9.35359 1.35359Z');

    class Delegate {
        _listeners = [];
        subscribe(callback, linkedObject, singleshot) {
            const listener = {
                callback,
                linkedObject,
                singleshot: singleshot === true,
            };
            this._listeners.push(listener);
        }
        unsubscribe(callback) {
            const index = this._listeners.findIndex((listener) => callback === listener.callback);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        }
        unsubscribeAll(linkedObject) {
            this._listeners = this._listeners.filter((listener) => listener.linkedObject !== linkedObject);
        }
        fire(param1) {
            const listenersSnapshot = [...this._listeners];
            this._listeners = this._listeners.filter((listener) => !listener.singleshot);
            listenersSnapshot.forEach((listener) => listener.callback(param1));
        }
        hasListeners() {
            return this._listeners.length > 0;
        }
        destroy() {
            this._listeners = [];
        }
    }

    /**
     * We are using our own mouse listeners on the container because
     * we need to know the mouse position when over the price scale
     * (in addition to the chart pane)
     */
    class MouseHandlers {
        _chart = undefined;
        _series = undefined;
        _unSubscribers = [];
        _clicked = new Delegate();
        _mouseMoved = new Delegate();
        attached(chart, series) {
            this._chart = chart;
            this._series = series;
            const container = this._chart.chartElement();
            this._addMouseEventListener(container, 'mouseleave', this._mouseLeave);
            this._addMouseEventListener(container, 'mousemove', this._mouseMove);
            this._addMouseEventListener(container, 'click', this._mouseClick);
        }
        detached() {
            this._series = undefined;
            this._clicked.destroy();
            this._mouseMoved.destroy();
            this._unSubscribers.forEach(unSub => {
                unSub();
            });
            this._unSubscribers = [];
        }
        clicked() {
            return this._clicked;
        }
        mouseMoved() {
            return this._mouseMoved;
        }
        _addMouseEventListener(target, eventType, handler) {
            const boundMouseMoveHandler = handler.bind(this);
            target.addEventListener(eventType, boundMouseMoveHandler);
            const unSubscriber = () => {
                target.removeEventListener(eventType, boundMouseMoveHandler);
            };
            this._unSubscribers.push(unSubscriber);
        }
        _mouseLeave() {
            this._mouseMoved.fire(null);
        }
        _mouseMove(event) {
            // console.log(event);
            this._mouseMoved.fire(this._determineMousePosition(event));
        }
        _mouseClick(event) {
            // console.log(event);
            this._clicked.fire(this._determineMousePosition(event));
        }
        _determineMousePosition(event) {
            if (!this._chart || !this._series)
                return null;
            const element = this._chart.chartElement();
            const chartContainerBox = element.getBoundingClientRect();
            const priceScaleWidth = this._series.priceScale().width();
            const timeScaleHeight = this._chart.timeScale().height();
            const x = event.clientX - chartContainerBox.x;
            const y = event.clientY - chartContainerBox.y;
            const overTimeScale = y > element.clientHeight - timeScaleHeight;
            const xPositionRelativeToPriceScale = element.clientWidth - priceScaleWidth - x;
            const overPriceScale = xPositionRelativeToPriceScale < 0;
            return {
                x,
                y,
                xPositionRelativeToPriceScale,
                overPriceScale,
                overTimeScale,
            };
        }
    }

    class PaneRendererBase {
        _data = null;
        update(data) {
            this._data = data;
        }
    }

    function centreOffset(lineBitmapWidth) {
        return Math.floor(lineBitmapWidth * 0.5);
    }
    /**
     * Calculates the bitmap position for an item with a desired length (height or width), and centred according to
     * an position coordinate defined in media sizing.
     * @param positionMedia - position coordinate for the bar (in media coordinates)
     * @param pixelRatio - pixel ratio. Either horizontal for x positions, or vertical for y positions
     * @param desiredWidthMedia - desired width (in media coordinates)
     * @returns Position of of the start point and length dimension.
     */
    function positionsLine(positionMedia, pixelRatio, desiredWidthMedia = 1, widthIsBitmap) {
        const scaledPosition = Math.round(pixelRatio * positionMedia);
        const lineBitmapWidth = Math.round(desiredWidthMedia * pixelRatio);
        const offset = centreOffset(lineBitmapWidth);
        const position = scaledPosition - offset;
        return { position, length: lineBitmapWidth };
    }
    /**
     * Determines the bitmap position and length for a dimension of a shape to be drawn.
     * @param position1Media - media coordinate for the first point
     * @param position2Media - media coordinate for the second point
     * @param pixelRatio - pixel ratio for the corresponding axis (vertical or horizontal)
     * @returns Position of of the start point and length dimension.
     */
    function positionsBox(position1Media, position2Media, pixelRatio) {
        const scaledPosition1 = Math.round(pixelRatio * position1Media);
        const scaledPosition2 = Math.round(pixelRatio * position2Media);
        return {
            position: Math.min(scaledPosition1, scaledPosition2),
            length: Math.abs(scaledPosition2 - scaledPosition1) + 1,
        };
    }

    class PaneRenderer extends PaneRendererBase {
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                if (!this._data)
                    return;
                this._drawAlertLines(scope);
                this._drawAlertIcons(scope);
                const hasRemoveHover = this._data.alerts.some(alert => alert.showHover && alert.hoverRemove);
                if (!hasRemoveHover) {
                    this._drawCrosshairLine(scope);
                    this._drawCrosshairLabelButton(scope);
                }
                this._drawAlertLabel(scope);
            });
        }
        _drawHorizontalLine(scope, data) {
            const ctx = scope.context;
            try {
                const yPos = positionsLine(data.y, scope.verticalPixelRatio, data.lineWidth);
                const yCentre = yPos.position + yPos.length / 2;
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = data.lineWidth;
                ctx.strokeStyle = data.color;
                const dash = 4 * scope.horizontalPixelRatio;
                ctx.setLineDash([dash, dash]);
                ctx.moveTo(0, yCentre);
                ctx.lineTo((data.width - buttonWidth) * scope.horizontalPixelRatio, yCentre);
                ctx.stroke();
            }
            finally {
                ctx.restore();
            }
        }
        _drawAlertLines(scope) {
            if (!this._data?.alerts)
                return;
            const color = this._data.color;
            this._data.alerts.forEach(alertData => {
                this._drawHorizontalLine(scope, {
                    width: scope.mediaSize.width,
                    lineWidth: 1,
                    color,
                    y: alertData.y,
                });
            });
        }
        _drawAlertIcons(scope) {
            if (!this._data?.alerts)
                return;
            const color = this._data.color;
            const icon = this._data.alertIcon;
            this._data.alerts.forEach(alert => {
                this._drawLabel(scope, {
                    width: scope.mediaSize.width,
                    labelHeight,
                    y: alert.y,
                    roundedCorners: 2,
                    icon,
                    iconScaling: iconSize / clockIconViewBoxSize,
                    padding: {
                        left: iconPadding,
                        top: iconPaddingAlertTop,
                    },
                    color,
                });
            });
        }
        _calculateLabelWidth(textLength) {
            return (centreLabelInlinePadding * 2 +
                removeButtonWidth +
                textLength * averageWidthPerCharacter);
        }
        _drawAlertLabel(scope) {
            if (!this._data?.alerts)
                return;
            const ctx = scope.context;
            const activeLabel = this._data.alerts.find(alert => alert.showHover);
            if (!activeLabel || !activeLabel.showHover)
                return;
            const labelWidth = this._calculateLabelWidth(activeLabel.text.length);
            const labelXDimensions = positionsLine(scope.mediaSize.width / 2, scope.horizontalPixelRatio, labelWidth);
            const yDimensions = positionsLine(activeLabel.y, scope.verticalPixelRatio, centreLabelHeight);
            ctx.save();
            try {
                const radius = 4 * scope.horizontalPixelRatio;
                // draw main body background of label
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fill();
                }
                else {
                    ctx.fillRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length);
                }
                const removeButtonStartX = labelXDimensions.position +
                    labelXDimensions.length -
                    removeButtonWidth * scope.horizontalPixelRatio;
                // draw hover background for remove button
                ctx.beginPath();
                if (activeLabel.hoverRemove) {
                    if (ctx.roundRect) {
                        ctx.roundRect(removeButtonStartX, yDimensions.position, removeButtonWidth * scope.horizontalPixelRatio, yDimensions.length, [0, radius, radius, 0]);
                        ctx.fillStyle = '#F0F3FA';
                        ctx.fill();
                    }
                    else {
                        ctx.fillRect(removeButtonStartX, yDimensions.position, removeButtonWidth * scope.horizontalPixelRatio, yDimensions.length);
                    }
                }
                // draw button divider
                ctx.beginPath();
                const dividerDimensions = positionsLine(removeButtonStartX / scope.horizontalPixelRatio, scope.horizontalPixelRatio, 1);
                ctx.fillStyle = '#F1F3FB';
                ctx.fillRect(dividerDimensions.position, yDimensions.position, dividerDimensions.length, yDimensions.length);
                // draw stroke for main body
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
                    ctx.strokeStyle = '#131722';
                    ctx.lineWidth = 1 * scope.horizontalPixelRatio;
                }
                else {
                    ctx.fillRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length);
                }
                ctx.stroke();
                // write text
                ctx.beginPath();
                ctx.fillStyle = '#131722';
                ctx.textBaseline = 'middle';
                ctx.font = `${Math.round(12 * scope.verticalPixelRatio)}px sans-serif`;
                ctx.fillText(activeLabel.text, labelXDimensions.position +
                    centreLabelInlinePadding * scope.horizontalPixelRatio, activeLabel.y * scope.verticalPixelRatio);
                // draw button icon
                ctx.beginPath();
                const iconSize = 9;
                ctx.translate(removeButtonStartX +
                    (scope.horizontalPixelRatio * (removeButtonWidth - iconSize)) / 2, (activeLabel.y - 5) * scope.verticalPixelRatio);
                const scaling = (iconSize / crossViewBoxSize) * scope.horizontalPixelRatio;
                ctx.scale(scaling, scaling);
                ctx.fillStyle = '#131722';
                ctx.fill(crossPath, 'evenodd');
            }
            finally {
                ctx.restore();
            }
        }
        _drawCrosshairLine(scope) {
            if (!this._data?.crosshair)
                return;
            this._drawHorizontalLine(scope, {
                width: scope.mediaSize.width,
                lineWidth: 1,
                color: this._data.color,
                y: this._data.crosshair.y,
            });
        }
        _drawCrosshairLabelButton(scope) {
            if (!this._data?.button || !this._data?.crosshair)
                return;
            this._drawLabel(scope, {
                width: scope.mediaSize.width,
                labelHeight: buttonHeight,
                y: this._data.crosshair.y,
                roundedCorners: [2, 0, 0, 2],
                icon: this._data.button.crosshairLabelIcon,
                iconScaling: iconSize / clockIconViewBoxSize,
                padding: {
                    left: iconPadding,
                    top: iconPadding,
                },
                color: this._data.button.hovering
                    ? this._data.button.hoverColor
                    : this._data.color,
            });
        }
        _drawLabel(scope, data) {
            const ctx = scope.context;
            try {
                ctx.save();
                const yDimension = positionsLine(data.y, scope.verticalPixelRatio, data.labelHeight);
                const x = (data.width - (buttonWidth + 1)) * scope.horizontalPixelRatio;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, yDimension.position, buttonWidth * scope.horizontalPixelRatio, yDimension.length, adjustRadius(data.roundedCorners, scope.horizontalPixelRatio));
                    ctx.fillStyle = data.color;
                    ctx.fill();
                }
                else {
                    ctx.fillRect(x, yDimension.position, buttonWidth * scope.horizontalPixelRatio, yDimension.length);
                }
                ctx.beginPath();
                ctx.translate(x + data.padding.left * scope.horizontalPixelRatio, yDimension.position + data.padding.top * scope.verticalPixelRatio);
                ctx.scale(data.iconScaling * scope.horizontalPixelRatio, data.iconScaling * scope.verticalPixelRatio);
                ctx.fillStyle = '#FFFFFF';
                data.icon.forEach(path => {
                    ctx.beginPath();
                    ctx.fill(path, 'evenodd');
                });
            }
            finally {
                ctx.restore();
            }
        }
    }
    function adjustRadius(radius, pixelRatio) {
        if (typeof radius === 'number') {
            return (radius * pixelRatio);
        }
        return radius.map(i => i * pixelRatio);
    }

    class PriceScalePaneRenderer extends PaneRendererBase {
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                if (!this._data)
                    return;
                this._drawCrosshairLabel(scope);
            });
        }
        _drawCrosshairLabel(scope) {
            if (!this._data?.crosshair)
                return;
            const ctx = scope.context;
            try {
                const width = scope.bitmapSize.width;
                const labelWidth = width - 8 * scope.horizontalPixelRatio;
                ctx.save();
                const labelDimensions = positionsLine(this._data.crosshair.y, scope.verticalPixelRatio, buttonHeight);
                const radius = 2 * scope.horizontalPixelRatio;
                if (ctx.roundRect) {
                    ctx.beginPath();
                    ctx.fillStyle = this._data.color;
                    ctx.roundRect(0, labelDimensions.position, labelWidth, labelDimensions.length, [0, radius, radius, 0]);
                    ctx.fill();
                }
                else {
                    ctx.fillRect(0, labelDimensions.position, labelWidth, labelDimensions.length);
                }
                ctx.beginPath();
                ctx.fillStyle = '#FFFFFF';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'right';
                ctx.font = `${Math.round(12 * scope.verticalPixelRatio)}px sans-serif`;
                const textMeasurements = ctx.measureText(this._data.crosshair.text);
                ctx.fillText(this._data.crosshair.text, textMeasurements.width + 10 * scope.horizontalPixelRatio, this._data.crosshair.y * scope.verticalPixelRatio);
            }
            finally {
                ctx.restore();
            }
        }
    }

    class UserAlertPricePaneView {
        _renderer;
        constructor(isPriceScale) {
            this._renderer = isPriceScale
                ? new PriceScalePaneRenderer()
                : new PaneRenderer();
        }
        zOrder() {
            return 'top';
        }
        renderer() {
            return this._renderer;
        }
        update(data) {
            this._renderer.update(data);
        }
    }

    class UserAlertsState {
        _alertAdded = new Delegate();
        _alertRemoved = new Delegate();
        _alertChanged = new Delegate();
        _alertsChanged = new Delegate();
        _alerts;
        constructor() {
            this._alerts = new Map();
            this._alertsChanged.subscribe(() => {
                this._updateAlertsArray();
            }, this);
        }
        destroy() {
            // TODO: add more destroying 💥
            this._alertsChanged.unsubscribeAll(this);
        }
        alertAdded() {
            return this._alertAdded;
        }
        alertRemoved() {
            return this._alertRemoved;
        }
        alertChanged() {
            return this._alertChanged;
        }
        alertsChanged() {
            return this._alertsChanged;
        }
        addAlert(price) {
            const id = this._getNewId();
            const userAlert = {
                price,
                id,
            };
            this._alerts.set(id, userAlert);
            this._alertAdded.fire(userAlert);
            this._alertsChanged.fire();
            return id;
        }
        removeAlert(id) {
            if (!this._alerts.has(id))
                return;
            this._alerts.delete(id);
            this._alertRemoved.fire(id);
            this._alertsChanged.fire();
        }
        alerts() {
            return this._alertsArray;
        }
        _alertsArray = [];
        _updateAlertsArray() {
            this._alertsArray = Array.from(this._alerts.values()).sort((a, b) => {
                return b.price - a.price;
            });
        }
        _getNewId() {
            let id = Math.round(Math.random() * 1000000).toString(16);
            while (this._alerts.has(id)) {
                id = Math.round(Math.random() * 1000000).toString(16);
            }
            return id;
        }
    }

    class UserPriceAlerts extends UserAlertsState {
        _chart = undefined;
        _series = undefined;
        _mouseHandlers;
        _paneViews = [];
        _pricePaneViews = [];
        _lastMouseUpdate = null;
        _currentCursor = null;
        _symbolName = '';
        constructor() {
            super();
            this._mouseHandlers = new MouseHandlers();
        }
        attached({ chart, series, requestUpdate }) {
            this._chart = chart;
            this._series = series;
            this._paneViews = [new UserAlertPricePaneView(false)];
            this._pricePaneViews = [new UserAlertPricePaneView(true)];
            this._mouseHandlers.attached(chart, series);
            this._mouseHandlers.mouseMoved().subscribe(mouseUpdate => {
                this._lastMouseUpdate = mouseUpdate;
                requestUpdate();
            }, this);
            this._mouseHandlers.clicked().subscribe(mousePosition => {
                if (mousePosition && this._series) {
                    if (this._isHovering(mousePosition)) {
                        const price = this._series.coordinateToPrice(mousePosition.y);
                        if (price) {
                            this.addAlert(price);
                            requestUpdate();
                        }
                    }
                    if (this._hoveringID) {
                        this.removeAlert(this._hoveringID);
                        requestUpdate();
                    }
                }
            }, this);
        }
        detached() {
            this._mouseHandlers.mouseMoved().unsubscribeAll(this);
            this._mouseHandlers.clicked().unsubscribeAll(this);
            this._mouseHandlers.detached();
            this._series = undefined;
        }
        paneViews() {
            return this._paneViews;
        }
        priceAxisPaneViews() {
            return this._pricePaneViews;
        }
        updateAllViews() {
            const alerts = this.alerts();
            const rendererData = this._calculateRendererData(alerts, this._lastMouseUpdate);
            this._currentCursor = null;
            if (rendererData?.button?.hovering ||
                rendererData?.alerts.some(alert => alert.showHover && alert.hoverRemove)) {
                this._currentCursor = 'pointer';
            }
            this._paneViews.forEach(pv => pv.update(rendererData));
            this._pricePaneViews.forEach(pv => pv.update(rendererData));
        }
        hitTest() {
            if (!this._currentCursor)
                return null;
            return {
                cursorStyle: this._currentCursor,
                externalId: 'user-alerts-primitive',
                zOrder: 'top',
            };
        }
        setSymbolName(name) {
            this._symbolName = name;
        }
        _isHovering(mousePosition) {
            return Boolean(mousePosition &&
                mousePosition.xPositionRelativeToPriceScale >= 1 &&
                mousePosition.xPositionRelativeToPriceScale < buttonWidth);
        }
        _isHoveringRemoveButton(mousePosition, timescaleWidth, alertY, textLength) {
            if (!mousePosition || !timescaleWidth)
                return false;
            const distanceY = Math.abs(mousePosition.y - alertY);
            if (distanceY > centreLabelHeight / 2)
                return false;
            const labelWidth = centreLabelInlinePadding * 2 +
                removeButtonWidth +
                textLength * averageWidthPerCharacter;
            const buttonCentreX = (timescaleWidth + labelWidth - removeButtonWidth) * 0.5;
            const distanceX = Math.abs(mousePosition.x - buttonCentreX);
            return distanceX <= removeButtonWidth / 2;
        }
        _hoveringID = '';
        /**
         * We are calculating this here instead of within a view
         * because the data is identical for both Renderers so lets
         * rather calculate it once here.
         */
        _calculateRendererData(alertsInfo, mousePosition) {
            if (!this._series)
                return null;
            const priceFormatter = this._series.priceFormatter();
            const showCrosshair = mousePosition && !mousePosition.overTimeScale;
            const showButton = showCrosshair;
            const crosshairPrice = mousePosition && this._series.coordinateToPrice(mousePosition.y);
            const crosshairPriceText = priceFormatter.format(crosshairPrice ?? -100);
            let closestDistance = Infinity;
            let closestIndex = -1;
            const alerts = alertsInfo.map((alertInfo, index) => {
                const y = this._series.priceToCoordinate(alertInfo.price) ?? -100;
                if (mousePosition?.y && y >= 0) {
                    const distance = Math.abs(mousePosition.y - y);
                    if (distance < closestDistance) {
                        closestIndex = index;
                        closestDistance = distance;
                    }
                }
                return {
                    y,
                    showHover: false,
                    price: alertInfo.price,
                    id: alertInfo.id,
                };
            });
            this._hoveringID = '';
            if (closestIndex >= 0 && closestDistance < showCentreLabelDistance) {
                const timescaleWidth = this._chart?.timeScale().width() ?? 0;
                const a = alerts[closestIndex];
                const text = `${this._symbolName} crossing ${this._series
                .priceFormatter()
                .format(a.price)}`;
                const hoverRemove = this._isHoveringRemoveButton(mousePosition, timescaleWidth, a.y, text.length);
                alerts[closestIndex] = {
                    ...alerts[closestIndex],
                    showHover: true,
                    text,
                    hoverRemove,
                };
                if (hoverRemove)
                    this._hoveringID = a.id;
            }
            return {
                alertIcon: clockIconPaths,
                alerts,
                button: showButton
                    ? {
                        hovering: this._isHovering(mousePosition),
                        hoverColor: '#50535E',
                        crosshairLabelIcon: clockPlusIconPaths,
                    }
                    : null,
                color: '#131722',
                crosshair: showCrosshair
                    ? {
                        y: mousePosition.y,
                        text: crosshairPriceText,
                    }
                    : null,
            };
        }
    }

    class VolumeProfileRenderer {
        _data;
        constructor(data) {
            this._data = data;
        }
        draw(target) {
            target.useBitmapCoordinateSpace(scope => {
                if (this._data.x === null || this._data.top === null)
                    return;
                const ctx = scope.context;
                const horizontalPositions = positionsBox(this._data.x, this._data.x + this._data.width, scope.horizontalPixelRatio);
                const verticalPositions = positionsBox(this._data.top, this._data.top - this._data.columnHeight * this._data.items.length, scope.verticalPixelRatio);
                ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
                ctx.fillRect(horizontalPositions.position, verticalPositions.position, horizontalPositions.length, verticalPositions.length);
                ctx.fillStyle = 'rgba(80, 80, 255, 0.8)';
                this._data.items.forEach(row => {
                    if (row.y === null)
                        return;
                    const itemVerticalPos = positionsBox(row.y, row.y - this._data.columnHeight, scope.verticalPixelRatio);
                    const itemHorizontalPos = positionsBox(this._data.x, this._data.x + row.width, scope.horizontalPixelRatio);
                    ctx.fillRect(itemHorizontalPos.position, itemVerticalPos.position, itemHorizontalPos.length, itemVerticalPos.length - 2 // 1 to close gaps
                    );
                });
            });
        }
    }
    class VolumeProfilePaneView {
        _source;
        _x = null;
        _width = 6;
        _columnHeight = 0;
        _top = null;
        _items = [];
        constructor(source) {
            this._source = source;
        }
        update() {
            const data = this._source._vpData;
            const series = this._source._series;
            const timeScale = this._source._chart.timeScale();
            this._x = timeScale.timeToCoordinate(data.time);
            this._width = timeScale.options().barSpacing * data.width;
            const y1 = series.priceToCoordinate(data.profile[0].price) ?? 0;
            const y2 = series.priceToCoordinate(data.profile[1].price) ??
                timeScale.height();
            this._columnHeight = Math.max(1, y1 - y2);
            const maxVolume = data.profile.reduce((acc, item) => Math.max(acc, item.vol), 0);
            this._top = y1;
            this._items = data.profile.map(row => ({
                y: series.priceToCoordinate(row.price),
                width: (this._width * row.vol) / maxVolume,
            }));
        }
        renderer() {
            return new VolumeProfileRenderer({
                x: this._x,
                top: this._top,
                columnHeight: this._columnHeight,
                width: this._width,
                items: this._items,
            });
        }
    }
    class VolumeProfile {
        _chart;
        _series;
        _vpData;
        _minPrice;
        _maxPrice;
        _paneViews;
        _vpIndex = null;
        constructor(chart, series, vpData) {
            this._chart = chart;
            this._series = series;
            this._vpData = vpData;
            this._minPrice = Infinity;
            this._maxPrice = -Infinity;
            this._vpData.profile.forEach(vpData => {
                if (vpData.price < this._minPrice)
                    this._minPrice = vpData.price;
                if (vpData.price > this._maxPrice)
                    this._maxPrice = vpData.price;
            });
            this._paneViews = [new VolumeProfilePaneView(this)];
        }
        updateAllViews() {
            this._paneViews.forEach(pw => pw.update());
        }
        // Ensures that the VP is within autoScale
        autoscaleInfo(startTimePoint, endTimePoint) {
            // calculation of vpIndex could be remembered to reduce CPU usage
            // and only recheck if the data is changed ('full' update).
            const vpCoordinate = this._chart
                .timeScale()
                .timeToCoordinate(this._vpData.time);
            if (vpCoordinate === null)
                return null;
            const vpIndex = this._chart.timeScale().coordinateToLogical(vpCoordinate);
            if (vpIndex === null)
                return null;
            if (endTimePoint < vpIndex || startTimePoint > vpIndex + this._vpData.width)
                return null;
            return {
                priceRange: {
                    minValue: this._minPrice,
                    maxValue: this._maxPrice,
                },
            };
        }
        paneViews() {
            return this._paneViews;
        }
    }

    function convertTime(t) {
        if (lightweightCharts.isUTCTimestamp(t))
            return t * 1000;
        if (lightweightCharts.isBusinessDay(t))
            return new Date(t.year, t.month, t.day).valueOf();
        const [year, month, day] = t.split('-').map(parseInt);
        return new Date(year, month, day).valueOf();
    }
    function formattedDateAndTime(timestamp) {
        if (!timestamp)
            return ['', ''];
        const dateObj = new Date(timestamp);
        // Format date string
        const year = dateObj.getFullYear();
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const date = dateObj.getDate().toString().padStart(2, '0');
        const formattedDate = `${date} ${month} ${year}`;
        // Format time string
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        return [formattedDate, formattedTime];
    }

    class TooltipCrosshairLinePaneRenderer {
        _data;
        constructor(data) {
            this._data = data;
        }
        draw(target) {
            if (!this._data.length)
                return;
            target.useBitmapCoordinateSpace(scope => {
                const ctx = scope.context;
                this._data.forEach(data => {
                    const crosshairPos = positionsLine(data.x, scope.horizontalPixelRatio, 1);
                    ctx.fillStyle = data.color;
                    ctx.fillRect(crosshairPos.position, data.topMargin * scope.verticalPixelRatio, crosshairPos.length, scope.bitmapSize.height);
                    if (data.priceY) {
                        ctx.beginPath();
                        ctx.ellipse(data.x * scope.horizontalPixelRatio, data.priceY * scope.verticalPixelRatio, 6 * scope.horizontalPixelRatio, 6 * scope.verticalPixelRatio, 0, 0, Math.PI * 2);
                        ctx.fillStyle = data.markerBorderColor;
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(data.x * scope.horizontalPixelRatio, data.priceY * scope.verticalPixelRatio, 4 * scope.horizontalPixelRatio, 4 * scope.verticalPixelRatio, 0, 0, Math.PI * 2);
                        ctx.fillStyle = data.markerColor;
                        ctx.fill();
                    }
                });
            });
        }
    }
    class MultiTouchCrosshairPaneView {
        _data;
        constructor(data) {
            this._data = data;
        }
        update(data) {
            this._data = data;
        }
        renderer() {
            return new TooltipCrosshairLinePaneRenderer(this._data);
        }
        zOrder() {
            return 'top';
        }
    }

    const styles = {
        background: '#ffffff',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
        borderRadius: 5,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        itemBlockPadding: 5,
        itemInlinePadding: 10,
        tooltipLineFontWeights: [590, 400, 400],
        tooltipLineFontSizes: [14, 12, 12],
        tooltipLineLineHeights: [18, 16, 16],
        tooltipLineColors: ['#131722', '#787B86', '#787B86'],
        deltaFontWeights: [590, 400],
        deltaFontSizes: [14, 12],
        deltaLineHeights: [18, 16],
    };
    function determineSectionWidth(ctx, lines, fontSizes, fontWeights) {
        let maxTextWidth = 0;
        ctx.save();
        lines.forEach((line, index) => {
            ctx.font = `${fontWeights[index]} ${fontSizes[index]}px ${styles.fontFamily}`;
            const measurement = ctx.measureText(line);
            if (measurement.width > maxTextWidth)
                maxTextWidth = measurement.width;
        });
        ctx.restore();
        return maxTextWidth + styles.itemInlinePadding * 2;
    }
    function determineSectionHeight(lines, lineHeights) {
        let height = styles.itemBlockPadding * 1.5; // TODO: the height spacing is inconsistent across different devices...
        lines.forEach((_line, index) => {
            height += lineHeights[index];
        });
        return height;
    }
    function calculateVerticalDrawingPositions(data) {
        const mainY = data.topSpacing;
        const leftTooltipHeight = data.tooltips.length < 1
            ? 0
            : determineSectionHeight(data.tooltips[0].lineContent, styles.tooltipLineLineHeights);
        const rightTooltipHeight = data.tooltips.length < 2
            ? 0
            : determineSectionHeight(data.tooltips[1].lineContent, styles.tooltipLineLineHeights);
        const deltaHeight = determineSectionHeight([data.deltaTopLine, data.deltaBottomLine].filter(Boolean), styles.deltaLineHeights);
        const mainHeight = Math.max(leftTooltipHeight, rightTooltipHeight, deltaHeight);
        const leftTooltipTextY = Math.round(styles.itemBlockPadding + (mainHeight - leftTooltipHeight) / 2);
        const rightTooltipTextY = Math.round(styles.itemBlockPadding + (mainHeight - rightTooltipHeight) / 2);
        const deltaTextY = Math.round(styles.itemBlockPadding + (mainHeight - deltaHeight) / 2);
        return {
            mainY,
            mainHeight,
            leftTooltipTextY,
            rightTooltipTextY,
            deltaTextY,
        };
    }
    function calculateInitialTooltipPosition(data, index, ctx, mediaSize) {
        const lines = data.tooltips[index].lineContent;
        const tooltipWidth = determineSectionWidth(ctx, lines, styles.tooltipLineFontSizes, styles.tooltipLineFontWeights);
        const halfWidth = tooltipWidth / 2;
        const idealX = Math.min(Math.max(0, data.tooltips[index].x - halfWidth), mediaSize.width - tooltipWidth);
        const leftSpace = idealX;
        const rightSpace = mediaSize.width - tooltipWidth - leftSpace;
        return {
            x: idealX,
            leftSpace,
            rightSpace,
            width: tooltipWidth,
        };
    }
    function calculateDrawingHorizontalPositions(data, ctx, mediaSize) {
        const leftPosition = calculateInitialTooltipPosition(data, 0, ctx, mediaSize);
        if (data.tooltips.length < 2) {
            return {
                mainX: Math.round(leftPosition.x),
                mainWidth: Math.round(leftPosition.width),
                leftTooltipCentreX: Math.round(leftPosition.x + leftPosition.width / 2),
                rightTooltipCentreX: 0,
                deltaCentreX: 0,
                deltaWidth: 0,
            };
        }
        const rightPosition = calculateInitialTooltipPosition(data, 1, ctx, mediaSize);
        const minDeltaWidth = data.tooltips.length < 2
            ? 0
            : determineSectionWidth(ctx, [data.deltaTopLine, data.deltaBottomLine].filter(Boolean), styles.deltaFontSizes, styles.deltaFontWeights);
        const overlapWidth = minDeltaWidth + leftPosition.x + leftPosition.width - rightPosition.x;
        // if positive then we need to adjust positions
        if (overlapWidth > 0) {
            const halfOverlap = overlapWidth / 2;
            if (leftPosition.leftSpace >= halfOverlap &&
                rightPosition.rightSpace >= halfOverlap) {
                leftPosition.x -= halfOverlap;
                rightPosition.x += halfOverlap;
            }
            else {
                const leftSmaller = leftPosition.leftSpace < rightPosition.rightSpace;
                if (leftSmaller) {
                    const remainingOverlap = overlapWidth - leftPosition.leftSpace;
                    leftPosition.x -= leftPosition.leftSpace;
                    rightPosition.x += remainingOverlap;
                }
                else {
                    const remainingOverlap = overlapWidth - rightPosition.rightSpace;
                    leftPosition.x = Math.max(0, leftPosition.x - remainingOverlap);
                    rightPosition.x += rightPosition.rightSpace;
                }
            }
        }
        const deltaWidth = Math.round(rightPosition.x - leftPosition.x - leftPosition.width);
        const deltaCentreX = Math.round(rightPosition.x - deltaWidth / 2);
        return {
            mainX: Math.round(leftPosition.x),
            mainWidth: Math.round(leftPosition.width + deltaWidth + rightPosition.width),
            leftTooltipCentreX: Math.round(leftPosition.x + leftPosition.width / 2),
            rightTooltipCentreX: Math.round(rightPosition.x + rightPosition.width / 2),
            deltaCentreX,
            deltaWidth,
        };
    }
    function calculateDrawingPositions(data, ctx, mediaSize) {
        return {
            ...calculateVerticalDrawingPositions(data),
            ...calculateDrawingHorizontalPositions(data, ctx, mediaSize),
        };
    }
    class DeltaTooltipPaneRenderer {
        _data;
        constructor(data) {
            this._data = data;
        }
        draw(target) {
            if (this._data.tooltips.length < 1)
                return;
            target.useMediaCoordinateSpace(scope => {
                const ctx = scope.context;
                const drawingPositions = calculateDrawingPositions(this._data, ctx, scope.mediaSize);
                this._drawMainTooltip(ctx, drawingPositions);
                this._drawDeltaArea(ctx, drawingPositions);
                this._drawTooltipsText(ctx, drawingPositions);
                this._drawDeltaText(ctx, drawingPositions);
            });
        }
        _drawMainTooltip(ctx, positions) {
            ctx.save();
            ctx.fillStyle = styles.background;
            ctx.shadowBlur = styles.shadowBlur;
            ctx.shadowOffsetX = styles.shadowOffsetX;
            ctx.shadowOffsetY = styles.shadowOffsetY;
            ctx.shadowColor = styles.shadowColor;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(positions.mainX, positions.mainY, positions.mainWidth, positions.mainHeight, styles.borderRadius);
            }
            else {
                ctx.fillRect(positions.mainX, positions.mainY, positions.mainWidth, positions.mainHeight);
            }
            ctx.fill();
            ctx.restore();
        }
        _drawDeltaArea(ctx, positions) {
            ctx.save();
            ctx.fillStyle = this._data.deltaBackgroundColor;
            ctx.beginPath();
            const halfWidth = Math.round(positions.deltaWidth / 2);
            ctx.fillRect(positions.deltaCentreX - halfWidth, positions.mainY, positions.deltaWidth, positions.mainHeight);
            ctx.restore();
        }
        _drawTooltipsText(ctx, positions) {
            ctx.save();
            this._data.tooltips.forEach((tooltip, tooltipIndex) => {
                const x = tooltipIndex === 0
                    ? positions.leftTooltipCentreX
                    : positions.rightTooltipCentreX;
                let y = positions.mainY +
                    (tooltipIndex === 0
                        ? positions.leftTooltipTextY
                        : positions.rightTooltipTextY);
                tooltip.lineContent.forEach((line, lineIndex) => {
                    ctx.font = `${styles.tooltipLineFontWeights[lineIndex]} ${styles.tooltipLineFontSizes[lineIndex]}px ${styles.fontFamily}`;
                    ctx.fillStyle = styles.tooltipLineColors[lineIndex];
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(line, x, y);
                    y += styles.tooltipLineLineHeights[lineIndex];
                });
            });
            ctx.restore();
        }
        _drawDeltaText(ctx, positions) {
            ctx.save();
            const x = positions.deltaCentreX;
            let y = positions.mainY + positions.deltaTextY;
            const lines = [this._data.deltaTopLine, this._data.deltaBottomLine];
            lines.forEach((line, lineIndex) => {
                ctx.font = `${styles.deltaFontWeights[lineIndex]} ${styles.deltaFontSizes[lineIndex]}px ${styles.fontFamily}`;
                ctx.fillStyle = this._data.deltaTextColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(line, x, y);
                y += styles.deltaLineHeights[lineIndex];
            });
            ctx.restore();
        }
    }
    class DeltaTooltipPaneView {
        _data;
        constructor(data) {
            this._data = {
                ...defaultOptions$1,
                ...data,
            };
        }
        update(data) {
            this._data = {
                ...this._data,
                ...data,
            };
        }
        renderer() {
            return new DeltaTooltipPaneRenderer(this._data);
        }
        zOrder() {
            return 'top';
        }
    }
    const defaultOptions$1 = {
        deltaTopLine: '',
        deltaBottomLine: '',
        deltaBackgroundColor: '#ffffff',
        deltaTextColor: '#',
        topSpacing: 20,
        tooltips: [],
    };

    function determineChartX(chartElement, chart, mouseX) {
        const chartBox = chartElement.getBoundingClientRect();
        const x = mouseX - chartBox.left - chart.priceScale('left').width();
        if (x < 0 || x > chart.timeScale().width())
            return null;
        return x;
    }
    function determinePaneXLogical(chart, x) {
        if (x === null)
            return null;
        return chart.timeScale().coordinateToLogical(x);
    }
    function determineYPosition(chartElement, clientY) {
        const chartContainerBox = chartElement.getBoundingClientRect();
        return (clientY - chartContainerBox.y);
    }
    class MultiTouchChartEvents {
        _chartElement;
        _chart;
        _options;
        _mouseState = {
            drawing: false,
            startLogical: null,
            startCoordinate: null,
            startX: null,
        };
        _touchLeave = new Delegate();
        _touchInteraction = new Delegate();
        _unSubscribers = [];
        constructor(chart, options) {
            this._options = options;
            this._chart = chart;
            this._chartElement = chart.chartElement();
            this._addMouseEventListener(this._chartElement, 'mouseleave', this._mouseLeave);
            this._addMouseEventListener(this._chartElement, 'mousemove', this._mouseMove);
            this._addMouseEventListener(this._chartElement, 'mousedown', this._mouseDown);
            this._addMouseEventListener(this._chartElement, 'mouseup', this._mouseUp);
            this._addTouchEventListener(this._chartElement, 'touchstart', this._touchOther);
            this._addTouchEventListener(this._chartElement, 'touchmove', this._touchMove);
            this._addTouchEventListener(this._chartElement, 'touchcancel', this._touchFinish);
            this._addTouchEventListener(this._chartElement, 'touchend', this._touchFinish);
        }
        destroy() {
            this._touchLeave.destroy();
            this._touchInteraction.destroy();
            this._unSubscribers.forEach(unSub => {
                unSub();
            });
            this._unSubscribers = [];
        }
        leave() {
            return this._touchLeave;
        }
        move() {
            return this._touchInteraction;
        }
        _addMouseEventListener(target, eventType, handler) {
            const boundMouseMoveHandler = handler.bind(this);
            target.addEventListener(eventType, boundMouseMoveHandler);
            const unSubscriber = () => {
                target.removeEventListener(eventType, boundMouseMoveHandler);
            };
            this._unSubscribers.push(unSubscriber);
        }
        _addTouchEventListener(target, eventType, handler) {
            const boundMouseMoveHandler = handler.bind(this);
            target.addEventListener(eventType, boundMouseMoveHandler);
            const unSubscriber = () => {
                target.removeEventListener(eventType, boundMouseMoveHandler);
            };
            this._unSubscribers.push(unSubscriber);
        }
        _mouseLeave() {
            this._mouseState.drawing = false;
            this._touchLeave.fire();
        }
        _mouseMove(event) {
            const chartX = determineChartX(this._chartElement, this._chart, event.clientX);
            const logical = determinePaneXLogical(this._chart, chartX);
            const coordinate = determineYPosition(this._chartElement, event.clientY);
            const points = [];
            if (this._options.simulateMultiTouchUsingMouseDrag &&
                this._mouseState.drawing &&
                this._mouseState.startLogical !== null &&
                this._mouseState.startCoordinate !== null &&
                this._mouseState.startX !== null) {
                points.push({
                    x: this._mouseState.startX,
                    index: this._mouseState.startLogical,
                    y: this._mouseState.startCoordinate,
                });
            }
            if (logical !== null && coordinate !== null && chartX !== null) {
                points.push({
                    x: chartX,
                    index: logical,
                    y: coordinate,
                });
            }
            const interaction = {
                points,
            };
            this._touchInteraction.fire(interaction);
        }
        _mouseDown(event) {
            this._mouseState.startX = determineChartX(this._chartElement, this._chart, event.clientX);
            this._mouseState.startLogical = determinePaneXLogical(this._chart, this._mouseState.startX);
            this._mouseState.startCoordinate = determineYPosition(this._chartElement, event.clientY);
            this._mouseState.drawing =
                this._mouseState.startLogical !== null &&
                    this._mouseState.startCoordinate !== null;
        }
        _mouseUp() {
            this._mouseState.drawing = false;
        }
        _touchMove(event) {
            event.preventDefault();
            const points = [];
            for (let i = 0; i < event.targetTouches.length; i++) {
                const touch = event.targetTouches.item(i);
                if (touch !== null) {
                    const chartX = determineChartX(this._chartElement, this._chart, touch.clientX);
                    const logical = determinePaneXLogical(this._chart, chartX);
                    const y = determineYPosition(this._chartElement, touch.clientY);
                    if (chartX !== null && y !== null && logical !== null) {
                        points.push({
                            x: chartX,
                            index: logical,
                            y,
                        });
                    }
                }
            }
            const interaction = {
                points,
            };
            this._touchInteraction.fire(interaction);
        }
        _touchFinish(event) {
            event.preventDefault();
            // might be fired while some touch points are still active (eg. two fingers to one finger)
            if (event.targetTouches.length < 1) {
                this._touchLeave.fire();
                return;
            }
        }
        _touchOther(event) {
            event.preventDefault();
        }
    }

    const defaultOptions = {
        lineColor: 'rgba(0, 0, 0, 0.2)',
        priceExtractor: (data) => {
            if (data.value !== undefined) {
                return [data.value, data.value.toFixed(2)];
            }
            if (data.close !== undefined) {
                return [
                    data.close,
                    data.close.toFixed(2),
                ];
            }
            return [0, ''];
        },
        showTime: false,
        topOffset: 20,
    };
    class DeltaTooltipPrimitive {
        _options;
        _crosshairPaneView;
        _deltaTooltipPaneView;
        _paneViews;
        _crosshairData = [];
        _tooltipData;
        _attachedParams;
        _touchChartEvents = null;
        _activeRange = new Delegate();
        constructor(options) {
            this._options = {
                ...defaultOptions,
                ...options,
            };
            this._tooltipData = {
                topSpacing: this._options.topOffset,
            };
            this._crosshairPaneView = new MultiTouchCrosshairPaneView(this._crosshairData);
            this._deltaTooltipPaneView = new DeltaTooltipPaneView(this._tooltipData);
            this._paneViews = [this._crosshairPaneView, this._deltaTooltipPaneView];
        }
        attached(param) {
            this._attachedParams = param;
            this._setCrosshairMode();
            this._touchChartEvents = new MultiTouchChartEvents(param.chart, {
                simulateMultiTouchUsingMouseDrag: true,
            });
            this._touchChartEvents.leave().subscribe(() => {
                this._activeRange.fire(null);
                this._hideCrosshair();
            }, this);
            this._touchChartEvents
                .move()
                .subscribe((interactions) => {
                this._showTooltip(interactions);
            }, this);
        }
        detached() {
            if (this._touchChartEvents) {
                this._touchChartEvents.leave().unsubscribeAll(this);
                this._touchChartEvents.move().unsubscribeAll(this);
                this._touchChartEvents.destroy();
            }
            this._activeRange.destroy();
        }
        paneViews() {
            return this._paneViews;
        }
        updateAllViews() {
            this._crosshairPaneView.update(this._crosshairData);
            this._deltaTooltipPaneView.update(this._tooltipData);
        }
        setData(crosshairData, tooltipData) {
            this._crosshairData = crosshairData;
            this._tooltipData = tooltipData;
            this.updateAllViews();
            this._attachedParams?.requestUpdate();
        }
        currentColor() {
            return this._options.lineColor;
        }
        chart() {
            return this._attachedParams?.chart;
        }
        series() {
            return this._attachedParams?.series;
        }
        applyOptions(options) {
            this._options = {
                ...this._options,
                ...options,
            };
            this._tooltipData.topSpacing = this._options.topOffset;
        }
        activeRange() {
            return this._activeRange;
        }
        _setCrosshairMode() {
            const chart = this.chart();
            if (!chart) {
                throw new Error('Unable to change crosshair mode because the chart instance is undefined');
            }
            chart.applyOptions({
                crosshair: {
                    mode: lightweightCharts.CrosshairMode.Magnet,
                    vertLine: {
                        visible: false,
                        labelVisible: false,
                    },
                    horzLine: {
                        visible: false,
                        labelVisible: false,
                    },
                },
            });
            const series = this.series();
            if (series) {
                // We need to draw the crosshair markers ourselves since there can be multiple points now.
                series.applyOptions({ crosshairMarkerVisible: false });
            }
        }
        _hideTooltip() {
            this.setData([], {
                tooltips: [],
            });
        }
        _hideCrosshair() {
            this._hideTooltip();
        }
        _chartBackgroundColor() {
            const chart = this.chart();
            if (!chart) {
                return '#FFFFFF';
            }
            const backgroundOptions = chart.options().layout.background;
            if (backgroundOptions.type === lightweightCharts.ColorType.Solid) {
                return backgroundOptions.color;
            }
            return backgroundOptions.topColor;
        }
        _seriesLineColor() {
            const series = this.series();
            if (!series) {
                return '#888';
            }
            const seriesOptions = series.options();
            return (seriesOptions.color ||
                seriesOptions.lineColor ||
                '#888');
        }
        _showTooltip(interactions) {
            const series = this.series();
            if (interactions.points.length < 1 || !series) {
                this._hideCrosshair();
                return;
            }
            const topMargin = this._tooltipData.topSpacing ?? 20;
            const markerBorderColor = this._chartBackgroundColor();
            const markerColor = this._seriesLineColor();
            const tooltips = [];
            const crosshairData = [];
            const priceValues = [];
            let firstPointIndex = interactions.points[0].index;
            for (let i = 0; i < Math.min(2, interactions.points.length); i++) {
                const point = interactions.points[i];
                const data = series.dataByIndex(point.index);
                if (data) {
                    const [priceValue, priceString] = this._options.priceExtractor(data);
                    priceValues.push([priceValue, point.index]);
                    const priceY = series.priceToCoordinate(priceValue) ?? -1000;
                    const [date, time] = formattedDateAndTime(data.time ? convertTime(data.time) : undefined);
                    const state = {
                        x: point.x,
                        lineContent: [priceString, date],
                    };
                    if (this._options.showTime) {
                        state.lineContent.push(time);
                    }
                    if (point.index >= firstPointIndex) {
                        tooltips.push(state);
                    }
                    else {
                        tooltips.unshift(state); // place at front so order is correct.
                    }
                    crosshairData.push({
                        x: point.x,
                        priceY,
                        visible: true,
                        color: this.currentColor(),
                        topMargin,
                        markerColor,
                        markerBorderColor,
                    });
                }
            }
            const deltaContent = {
                tooltips,
            };
            if (priceValues.length > 1) {
                const correctOrder = priceValues[1][1] > priceValues[0][1];
                const firstPrice = correctOrder ? priceValues[0][0] : priceValues[1][0];
                const secondPrice = correctOrder ? priceValues[1][0] : priceValues[0][0];
                const priceChange = secondPrice - firstPrice;
                const pctChange = (100 * priceChange) / firstPrice;
                const positive = priceChange >= 0;
                deltaContent.deltaTopLine = (positive ? '+' : '') + priceChange.toFixed(2);
                deltaContent.deltaBottomLine = (positive ? '+' : '') + pctChange.toFixed(2) + '%';
                deltaContent.deltaBackgroundColor = positive ? 'rgb(4,153,129, 0.2)' : 'rgb(239,83,80, 0.2)';
                deltaContent.deltaTextColor = positive ? 'rgb(4,153,129)' : 'rgb(239,83,80)';
                this._activeRange.fire({
                    from: priceValues[correctOrder ? 0 : 1][1] + 1,
                    to: priceValues[correctOrder ? 1 : 0][1] + 1,
                    positive,
                });
            }
            else {
                deltaContent.deltaTopLine = '';
                deltaContent.deltaBottomLine = '';
                this._activeRange.fire(null);
            }
            this.setData(crosshairData, deltaContent);
        }
    }

    globalParamInit();
    class Handler {
        id;
        commandFunctions = [];
        wrapper;
        div;
        chart;
        scale;
        precision = 2;
        series;
        volumeSeries;
        legend;
        _topBar;
        toolBox;
        spinner;
        alerts = [];
        _seriesList = [];
        // TODO find a better solution rather than the 'position' parameter
        constructor(chartId, innerWidth, innerHeight, position, autoSize) {
            this.reSize = this.reSize.bind(this);
            this.id = chartId;
            this.scale = {
                width: innerWidth,
                height: innerHeight,
            };
            this.wrapper = document.createElement('div');
            this.wrapper.classList.add("handler");
            this.wrapper.style.float = position;
            this.div = document.createElement('div');
            this.div.style.position = 'relative';
            this.wrapper.appendChild(this.div);
            window.containerDiv.append(this.wrapper);
            this.chart = this._createChart();
            this.series = this.createCandlestickSeries();
            this.volumeSeries = this.createVolumeSeries();
            this.legend = new Legend(this);
            document.addEventListener('keydown', (event) => {
                for (let i = 0; i < this.commandFunctions.length; i++) {
                    if (this.commandFunctions[i](event))
                        break;
                }
            });
            window.handlerInFocus = this.id;
            this.wrapper.addEventListener('mouseover', () => window.handlerInFocus = this.id);
            this.reSize();
            if (!autoSize)
                return;
            window.addEventListener('resize', () => this.reSize());
        }
        reSize() {
            let topBarOffset = this.scale.height !== 0 ? this._topBar?._div.offsetHeight || 0 : 0;
            this.chart.resize(window.innerWidth * this.scale.width, (window.innerHeight * this.scale.height) - topBarOffset);
            this.wrapper.style.width = `${100 * this.scale.width}%`;
            this.wrapper.style.height = `${100 * this.scale.height}%`;
            // TODO definitely a better way to do this
            if (this.scale.height === 0 || this.scale.width === 0) {
                // if (this.legend.div.style.display == 'flex') this.legend.div.style.display = 'none'
                if (this.toolBox) {
                    this.toolBox.div.style.display = 'none';
                }
            }
            else {
                // this.legend.div.style.display = 'flex'
                if (this.toolBox) {
                    this.toolBox.div.style.display = 'flex';
                }
            }
        }
        _createChart() {
            return lightweightCharts.createChart(this.div, {
                width: window.innerWidth * this.scale.width,
                height: window.innerHeight * this.scale.height,
                layout: {
                    textColor: window.pane.color,
                    background: {
                        color: '#000000',
                        type: lightweightCharts.ColorType.Solid,
                    },
                    fontSize: 12
                },
                rightPriceScale: {
                    scaleMargins: { top: 0.3, bottom: 0.25 },
                },
                timeScale: { timeVisible: true, secondsVisible: false },
                crosshair: {
                    mode: lightweightCharts.CrosshairMode.Normal,
                    vertLine: {
                        labelBackgroundColor: 'rgb(46, 46, 46)'
                    },
                    horzLine: {
                        labelBackgroundColor: 'rgb(55, 55, 55)'
                    }
                },
                grid: {
                    vertLines: { color: 'rgba(29, 30, 38, 5)' },
                    horzLines: { color: 'rgba(29, 30, 58, 5)' },
                },
                handleScroll: { vertTouchDrag: true },
            });
        }
        createCandlestickSeries() {
            const up = 'rgba(39, 157, 130, 100)';
            const down = 'rgba(200, 97, 100, 100)';
            const candleSeries = this.chart.addCandlestickSeries({
                upColor: up, borderUpColor: up, wickUpColor: up,
                downColor: down, borderDownColor: down, wickDownColor: down
            });
            candleSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.2, bottom: 0.2 },
            });
            return candleSeries;
        }
        createVolumeSeries() {
            const volumeSeries = this.chart.addHistogramSeries({
                color: '#26a69a',
                priceFormat: { type: 'volume' },
                priceScaleId: 'volume_scale',
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.8, bottom: 0 },
            });
            return volumeSeries;
        }
        createLineSeries(name, options) {
            const line = this.chart.addLineSeries({ ...options });
            this._seriesList.push(line);
            this.legend.makeSeriesRow(name, line);
            return {
                name: name,
                series: line,
            };
        }
        createHistogramSeries(name, options) {
            const line = this.chart.addHistogramSeries({ ...options });
            this._seriesList.push(line);
            this.legend.makeSeriesRow(name, line);
            return {
                name: name,
                series: line,
            };
        }
        createToolBox() {
            this.toolBox = new ToolBox(this.id, this.chart, this.series, this.commandFunctions);
            this.div.appendChild(this.toolBox.div);
        }
        createTopBar() {
            this._topBar = new TopBar(this);
            this.wrapper.prepend(this._topBar._div);
            return this._topBar;
        }
        createVolumeProfile(data) {
            const options = { color: 'rgba(214, 237, 255, 0.6)',
                lineStye: 0,
                lineWidth: 2,
                lastValueVisible: true,
                priceLineVisible: true,
                crosshairMarkerVisible: true,
                priceScaleId: undefined };
            const line = this.createLineSeries("price", options);
            line.series.setData(data);
            console.log("Created line with data", data);
            const basePrice = data[data.length - 5].value;
            const priceStep = Math.round(basePrice * 0.1);
            const profile = [];
            for (let i = 0; i < 10; i++) {
                profile.push({
                    price: basePrice + i * priceStep,
                    vol: Math.round(Math.random() * 20),
                });
            }
            console.log("volume profile PROFILE", profile);
            const vpData = {
                time: data[0].time,
                profile,
                width: 10, // number of bars width
            };
            console.log("voluem profile VPDATA", vpData);
            const volumeProfile = new VolumeProfile(this.chart, line.series, vpData);
            line.series.attachPrimitive(volumeProfile);
        }
        createUserPriceAlert(symbol) {
            const alert = new UserPriceAlerts();
            alert.setSymbolName(symbol);
            this.series.attachPrimitive(alert);
            alert.alertAdded().subscribe((alertInfo) => {
                console.log(`➕ Alert added @ ${alertInfo.price} with the id: ${alertInfo.id}`);
            });
            alert.alertRemoved().subscribe((id) => {
                console.log(`❌ Alert removed with the id: ${id}`);
            });
            this.alerts.push(alert);
        }
        ;
        createDeltaToolTip() {
            const tooltip = new DeltaTooltipPrimitive({
                lineColor: 'rgba(150, 150, 150, 0.2)',
            });
            this.series.attachPrimitive(tooltip);
        }
        ;
        toJSON() {
            // Exclude the chart attribute from serialization
            const { chart, ...serialized } = this;
            return serialized;
        }
        static syncCharts(childChart, parentChart, crosshairOnly = false) {
            function crosshairHandler(chart, point) {
                if (!point) {
                    chart.chart.clearCrosshairPosition();
                    return;
                }
                // TODO fix any point ?
                chart.chart.setCrosshairPosition(point.value || point.close, point.time, chart.series);
                chart.legend.legendHandler(point, true);
            }
            function getPoint(series, param) {
                if (!param.time)
                    return null;
                return param.seriesData.get(series) || null;
            }
            const childTimeScale = childChart.chart.timeScale();
            const parentTimeScale = parentChart.chart.timeScale();
            const setChildRange = (timeRange) => {
                if (timeRange)
                    childTimeScale.setVisibleLogicalRange(timeRange);
            };
            const setParentRange = (timeRange) => {
                if (timeRange)
                    parentTimeScale.setVisibleLogicalRange(timeRange);
            };
            const setParentCrosshair = (param) => {
                crosshairHandler(parentChart, getPoint(childChart.series, param));
            };
            const setChildCrosshair = (param) => {
                crosshairHandler(childChart, getPoint(parentChart.series, param));
            };
            let selected = parentChart;
            function addMouseOverListener(thisChart, otherChart, thisCrosshair, otherCrosshair, thisRange, otherRange) {
                thisChart.wrapper.addEventListener('mouseover', () => {
                    if (selected === thisChart)
                        return;
                    selected = thisChart;
                    otherChart.chart.unsubscribeCrosshairMove(thisCrosshair);
                    thisChart.chart.subscribeCrosshairMove(otherCrosshair);
                    if (crosshairOnly)
                        return;
                    otherChart.chart.timeScale().unsubscribeVisibleLogicalRangeChange(thisRange);
                    thisChart.chart.timeScale().subscribeVisibleLogicalRangeChange(otherRange);
                });
            }
            addMouseOverListener(parentChart, childChart, setParentCrosshair, setChildCrosshair, setParentRange, setChildRange);
            addMouseOverListener(childChart, parentChart, setChildCrosshair, setParentCrosshair, setChildRange, setParentRange);
            parentChart.chart.subscribeCrosshairMove(setChildCrosshair);
            const parentRange = parentTimeScale.getVisibleLogicalRange();
            if (parentRange)
                childTimeScale.setVisibleLogicalRange(parentRange);
            if (crosshairOnly)
                return;
            parentChart.chart.timeScale().subscribeVisibleLogicalRangeChange(setChildRange);
        }
        static makeSearchBox(chart, items) {
            const searchWindow = document.createElement('div');
            searchWindow.classList.add('searchbox');
            searchWindow.style.display = 'none';
            // console.log("Got items", moreItems);
            // let items = ['AAPL', 'GOOGL', 'TSLA'];
            // // moreItems from function call
            // moreItems = moreItems.filter(item => ! items.includes(item));
            // items = [...items, ...moreItems];
            // console.log("Final items", items);
            items.sort();
            const magnifyingGlass = document.createElement('div');
            magnifyingGlass.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
<path style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke:lightgray;" 
d="M 15 15 L 21 21 M 10 17 C 6.132812 17 3 13.867188 3 10 C 3 6.132812 6.132812 3 10 3 C 13.867188 3 17 6.132812 17 10 C 17 13.867188 13.867188 17 10 17 Z M 10 17 "/>
</svg>`;
            const sBox = document.createElement('input');
            sBox.type = 'text';
            const resultsList = document.createElement('ul');
            resultsList.classList.add('search-results');
            resultsList.style.color = 'white';
            resultsList.style.display = 'none';
            searchWindow.appendChild(magnifyingGlass);
            searchWindow.appendChild(sBox);
            searchWindow.appendChild(resultsList);
            chart.div.appendChild(searchWindow);
            function fuzzySearch(query) {
                if (!query) {
                    resultsList.style.display = 'none';
                    return;
                }
                resultsList.style.display = 'block';
                const results = items.filter(item => item.toUpperCase().includes(query.toUpperCase()));
                resultsList.innerHTML = results.map(item => `<li>${item}</li>`).join('');
                resultsList.style.display = results.length ? 'block' : 'none';
            }
            sBox.addEventListener('input', () => {
                const query = sBox.value.trim();
                fuzzySearch(query);
            });
            resultsList.addEventListener('click', (event) => {
                const target = event.target;
                if (target && target.tagName === 'LI') {
                    sBox.value = target.textContent || '';
                    searchWindow.style.display = 'none';
                    resultsList.style.display = 'none';
                }
            });
            chart.commandFunctions.push((event) => {
                if (window.handlerInFocus !== chart.id || window.textBoxFocused)
                    return false;
                if (searchWindow.style.display === 'none') {
                    if (/^[a-zA-Z0-9]$/.test(event.key)) {
                        searchWindow.style.display = 'flex';
                        sBox.focus();
                        return true;
                    }
                    else
                        return false;
                }
                else if (event.key === 'Enter' || event.key === 'Escape') {
                    if (event.key === 'Enter') {
                        const result = `${sBox.value}\n${resultsList.innerText}`;
                        window.callbackFunction(`search${chart.id}_~_${result}`);
                        // console.log("RESULTS", resultsList.innerHTML.value);
                        // window.callbackFunction(`search${chart.id}_~_${sBox.value}`);
                    }
                    searchWindow.style.display = 'none';
                    sBox.value = '';
                    resultsList.style.display = 'none';
                    return true;
                }
                return false;
            });
            sBox.addEventListener('input', () => sBox.value = sBox.value.toUpperCase());
            return {
                window: searchWindow,
                box: sBox,
                results: resultsList,
            };
        }
        static makeSpinner(chart) {
            chart.spinner = document.createElement('div');
            chart.spinner.classList.add('spinner');
            chart.wrapper.appendChild(chart.spinner);
            // TODO below can be css (animate)
            let rotation = 0;
            const speed = 10;
            function animateSpinner() {
                if (!chart.spinner)
                    return;
                rotation += speed;
                chart.spinner.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                requestAnimationFrame(animateSpinner);
            }
            animateSpinner();
        }
        static _styleMap = {
            '--bg-color': 'backgroundColor',
            '--hover-bg-color': 'hoverBackgroundColor',
            '--click-bg-color': 'clickBackgroundColor',
            '--active-bg-color': 'activeBackgroundColor',
            '--muted-bg-color': 'mutedBackgroundColor',
            '--border-color': 'borderColor',
            '--color': 'color',
            '--active-color': 'activeColor',
        };
        static setRootStyles(styles) {
            const rootStyle = document.documentElement.style;
            for (const [property, valueKey] of Object.entries(this._styleMap)) {
                rootStyle.setProperty(property, styles[valueKey]);
            }
        }
    }

    class Table {
        _div;
        _root_id;
        callbackName;
        borderColor;
        borderWidth;
        table;
        rows = {};
        headings;
        widths;
        alignments;
        footer;
        header;
        constructor(width, height, headings, widths, alignments, position, draggable = false, tableBackgroundColor, borderColor, borderWidth, textColors, backgroundColors, id = null) {
            this._div = document.createElement('div');
            this._root_id = id;
            this.callbackName = null;
            this.borderColor = borderColor;
            this.borderWidth = borderWidth;
            if (draggable) {
                this._div.style.position = 'absolute';
                this._div.style.cursor = 'move';
            }
            else {
                this._div.style.position = 'relative';
                this._div.style.float = position;
            }
            this._div.style.zIndex = '2000';
            this.reSize(width, height);
            this._div.style.display = 'flex';
            this._div.style.flexDirection = 'column';
            // this._div.style.justifyContent = 'space-between'
            this._div.style.borderRadius = '5px';
            this._div.style.color = 'white';
            this._div.style.fontSize = '12px';
            this._div.style.fontVariantNumeric = 'tabular-nums';
            this.table = document.createElement('table');
            this.table.style.width = '100%';
            this.table.style.borderCollapse = 'collapse';
            this._div.style.overflow = 'hidden';
            this.headings = headings;
            this.widths = widths.map((width) => `${width * 100}%`);
            this.alignments = alignments;
            let head = this.table.createTHead();
            let row = head.insertRow();
            for (let i = 0; i < this.headings.length; i++) {
                let th = document.createElement('th');
                th.textContent = this.headings[i];
                th.style.width = this.widths[i];
                th.style.letterSpacing = '0.03rem';
                th.style.padding = '0.2rem 0px';
                th.style.fontWeight = '500';
                th.style.textAlign = 'center';
                if (i !== 0)
                    th.style.borderLeft = borderWidth + 'px solid ' + borderColor;
                th.style.position = 'sticky';
                th.style.top = '0';
                th.style.backgroundColor = backgroundColors.length > 0 ? backgroundColors[i] : tableBackgroundColor;
                th.style.color = textColors[i];
                th.addEventListener('click', () => window.callbackFunction(`${this._root_id}_~_heading;;;${this.headings[i]}`));
                console.log(this._div, this._root_id);
                row.appendChild(th);
            }
            let overflowWrapper = document.createElement('div');
            overflowWrapper.style.overflowY = 'auto';
            overflowWrapper.style.overflowX = 'hidden';
            overflowWrapper.style.backgroundColor = tableBackgroundColor;
            overflowWrapper.appendChild(this.table);
            this._div.appendChild(overflowWrapper);
            window.containerDiv.appendChild(this._div);
            if (!draggable)
                return;
            let offsetX, offsetY;
            let onMouseDown = (event) => {
                offsetX = event.clientX - this._div.offsetLeft;
                offsetY = event.clientY - this._div.offsetTop;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };
            let onMouseMove = (event) => {
                this._div.style.left = (event.clientX - offsetX) + 'px';
                this._div.style.top = (event.clientY - offsetY) + 'px';
            };
            let onMouseUp = () => {
                // Remove the event listeners for dragging
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            this._div.addEventListener('mousedown', onMouseDown);
        }
        divToButton(div, callbackString) {
            div.addEventListener('mouseover', () => div.style.backgroundColor = 'rgba(60, 60, 60, 0.6)');
            div.addEventListener('mouseout', () => div.style.backgroundColor = 'transparent');
            div.addEventListener('mousedown', () => div.style.backgroundColor = 'rgba(60, 60, 60)');
            div.addEventListener('click', () => window.callbackFunction(callbackString));
            div.addEventListener('mouseup', () => div.style.backgroundColor = 'rgba(60, 60, 60, 0.6)');
        }
        newRow(id, returnClickedCell = false) {
            let row = this.table.insertRow();
            row.style.cursor = 'default';
            for (let i = 0; i < this.headings.length; i++) {
                let cell = row.insertCell();
                cell.style.width = this.widths[i];
                cell.style.textAlign = this.alignments[i];
                cell.style.border = this.borderWidth + 'px solid ' + this.borderColor;
                if (returnClickedCell) {
                    this.divToButton(cell, `${this.callbackName}_~_${id};;;${this.headings[i]}`);
                }
            }
            if (!returnClickedCell) {
                this.divToButton(row, `${this.callbackName}_~_${id}`);
            }
            this.rows[id] = row;
        }
        deleteRow(id) {
            this.table.deleteRow(this.rows[id].rowIndex);
            delete this.rows[id];
        }
        clearRows() {
            let numRows = Object.keys(this.rows).length;
            for (let i = 0; i < numRows; i++)
                this.table.deleteRow(-1);
            this.rows = {};
        }
        _getCell(rowId, column) {
            return this.rows[rowId].cells[this.headings.indexOf(column)];
        }
        bulkUpdateColumns(rowIds, vals, columns, styles = Array()) {
            for (let i = 0; i < rowIds.length; i++) {
                const rowId = rowIds[i];
                for (let j = 0; j < columns.length; j++) {
                    const cell = this.rows[rowId].cells[this.headings.indexOf(columns[j])];
                    cell.textContent = vals[i][j];
                    if (styles.length > 0) {
                        const style = styles[i];
                        if (j in style) {
                            const styleAttribute = style[j]["style"];
                            const value = style[j]["value"];
                            const oldStyle = cell.style;
                            oldStyle[styleAttribute] = value;
                        }
                    }
                }
            }
        }
        bulkUpdateCells(rowIds, vals, styles = Array()) {
            for (let i = 0; i < rowIds.length; i++) {
                const rowId = rowIds[i];
                for (let j = 0; j < this.headings.length; j++) {
                    const cell = this.rows[rowId].cells[j];
                    cell.textContent = vals[i][j];
                    if (styles.length > 0) {
                        const style = styles[i];
                        if (j in style) {
                            const styleAttribute = styles[j]["style"];
                            const value = styles[j]["value"];
                            const oldStyle = cell.style;
                            oldStyle[styleAttribute] = value;
                        }
                    }
                }
            }
        }
        bulkUpdateStyles(rowIds, styles) {
            for (let i = 0; i < rowIds.length; i++) {
                const rowId = rowIds[i];
                for (let j = 0; j < this.headings.length; j++) {
                    if (j in styles[i]) {
                        const cell = this.rows[rowId].cells[j];
                        const styleAttribute = styles[i][j]["style"];
                        const value = styles[i][j]["value"];
                        const oldStyle = cell.style;
                        oldStyle[styleAttribute] = value;
                    }
                }
            }
        }
        updateRow(rowId, vals, styles = null) {
            for (let i = 0; i < this.headings.length; i++) {
                const cell = this.rows[rowId].cells[i];
                cell.textContent = vals[i];
                if (styles !== null) {
                    const styleAttribute = styles[i]["style"];
                    const value = styles[i]["value"];
                    const oldStyle = cell.style;
                    oldStyle[styleAttribute] = value;
                }
            }
        }
        updateCell(rowId, column, val, style = null) {
            this._getCell(rowId, column).textContent = val;
            if (style !== null) {
                const styleAttribute = style["style"];
                const value = style["value"];
                const oldStyle = this._getCell(rowId, column).style;
                oldStyle[styleAttribute] = value;
            }
        }
        styleCell(rowId, column, styleAttribute, value) {
            const style = this._getCell(rowId, column).style;
            style[styleAttribute] = value;
        }
        flashRow(rowId) {
            const row = this.rows[rowId];
            row.classList.add('flash');
            console.log(row.classList);
        }
        stopFlashRow(rowId) {
            const row = this.rows[rowId];
            row.classList.remove('flash');
        }
        makeSection(id, type, numBoxes, func = false) {
            let section = document.createElement('div');
            section.style.display = 'flex';
            section.style.width = '100%';
            section.style.padding = '3px 0px';
            section.style.backgroundColor = 'rgb(30, 30, 30)';
            type === 'footer' ? this._div.appendChild(section) : this._div.prepend(section);
            const textBoxes = [];
            for (let i = 0; i < numBoxes; i++) {
                let textBox = document.createElement('div');
                section.appendChild(textBox);
                textBox.style.flex = '1';
                textBox.style.textAlign = 'center';
                if (func) {
                    this.divToButton(textBox, `${id}_~_${i}`);
                    textBox.style.borderRadius = '2px';
                }
                textBoxes.push(textBox);
            }
            if (type === 'footer') {
                this.footer = textBoxes;
            }
            else {
                this.header = textBoxes;
            }
        }
        reSize(width, height) {
            this._div.style.width = width <= 1 ? width * 100 + '%' : width + 'px';
            // this._div.style.height = height <= 1 ? height * 100 + '%' : height + 'px'
            this._div.style.display = "flex";
            this._div.style.flexDirection = "column";
            this._div.style.height = `calc(100vh - 20px)`;
            this._div.style.overflow = "hidden";
        }
    }

    exports.Box = Box;
    exports.Handler = Handler;
    exports.HorizontalLine = HorizontalLine;
    exports.Legend = Legend;
    exports.RayLine = RayLine;
    exports.Table = Table;
    exports.ToolBox = ToolBox;
    exports.TopBar = TopBar;
    exports.TrendLine = TrendLine;
    exports.UserPriceAlerts = UserPriceAlerts;
    exports.VerticalLine = VerticalLine;
    exports.globalParamInit = globalParamInit;
    exports.paneStyleDefault = paneStyleDefault;
    exports.setCursor = setCursor;

    return exports;

})({}, LightweightCharts);
