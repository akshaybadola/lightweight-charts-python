import {
    ColorType,
    CrosshairMode,
    DeepPartial,
    HistogramStyleOptions,
    IChartApi,
    ISeriesApi,
    LineStyleOptions,
    LogicalRange,
    LogicalRangeChangeEventHandler,
    MouseEventHandler,
    MouseEventParams,
    SeriesOptionsCommon,
    SeriesType,
    Time,
    createChart
} from "lightweight-charts";

import { GlobalParams, globalParamInit } from "./global-params";
import { Legend } from "./legend";
import { ToolBox } from "./toolbox";
import { TopBar } from "./topbar";
import { UserPriceAlerts } from "../user-price-alerts/user-price-alerts";
import { UserAlertInfo } from "../user-price-alerts/state";
import { VolumeProfile } from "../volume-profile/volume-profile";
import { DeltaTooltipPrimitive } from '../delta-tooltip/delta-tooltip';


export interface Scale{
    width: number,
    height: number,
}


globalParamInit();
declare const window: GlobalParams;

export class Handler {
    public id: string;
    public commandFunctions: Function[] = [];

    public wrapper: HTMLDivElement;
    public div: HTMLDivElement;

    public chart: IChartApi;
    public scale: Scale;
    public precision: number = 2;

    public series: ISeriesApi<SeriesType>;
    public volumeSeries: ISeriesApi<SeriesType>;

    public legend: Legend;
    private _topBar: TopBar | undefined;
    public toolBox: ToolBox | undefined;
    public spinner: HTMLDivElement | undefined;

    public alerts: UserPriceAlerts[] = [];

    public _seriesList: ISeriesApi<SeriesType>[] = [];

    // TODO find a better solution rather than the 'position' parameter
    constructor(
        chartId: string,
        innerWidth: number,
        innerHeight: number,
        position: string,
        autoSize: boolean
    ) {
        this.reSize = this.reSize.bind(this)

        this.id = chartId
        this.scale = {
            width: innerWidth,
            height: innerHeight,
        }

        this.wrapper = document.createElement('div')
        this.wrapper.classList.add("handler");
        this.wrapper.style.float = position

        this.div = document.createElement('div')
        this.div.style.position = 'relative'

        this.wrapper.appendChild(this.div);
        window.containerDiv.append(this.wrapper)

        this.chart = this._createChart();
        this.series = this.createCandlestickSeries();
        this.volumeSeries = this.createVolumeSeries();

        this.legend = new Legend(this)

        document.addEventListener('keydown', (event) => {
            for (let i = 0; i < this.commandFunctions.length; i++) {
                if (this.commandFunctions[i](event)) break
            }
        })
        window.handlerInFocus = this.id;
        this.wrapper.addEventListener('mouseover', () => window.handlerInFocus = this.id)

        this.reSize()
        if (!autoSize) return
        window.addEventListener('resize', () => this.reSize())
    }

    reSize() {
        let topBarOffset = this.scale.height !== 0 ? this._topBar?._div.offsetHeight || 0 : 0
        this.chart.resize(window.innerWidth * this.scale.width, (window.innerHeight * this.scale.height) - topBarOffset)
        this.wrapper.style.width = `${100 * this.scale.width}%`
        this.wrapper.style.height = `${100 * this.scale.height}%`

        // TODO definitely a better way to do this
        if (this.scale.height === 0 || this.scale.width === 0) {
            // if (this.legend.div.style.display == 'flex') this.legend.div.style.display = 'none'
            if (this.toolBox) {
                this.toolBox.div.style.display = 'none'
            }
        }
        else {
            // this.legend.div.style.display = 'flex'
            if (this.toolBox) {
                this.toolBox.div.style.display = 'flex'
            }
        }
    }

    private _createChart() {
        return createChart(this.div, {
            width: window.innerWidth * this.scale.width,
            height: window.innerHeight * this.scale.height,
            layout:{
                textColor: window.pane.color,
                background: {
                    color: '#000000',
                    type: ColorType.Solid,
                },
                fontSize: 12
            },
            rightPriceScale: {
                scaleMargins: {top: 0.3, bottom: 0.25},
            },
            timeScale: {timeVisible: true, secondsVisible: false},
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    labelBackgroundColor: 'rgb(46, 46, 46)'
                },
                horzLine: {
                    labelBackgroundColor: 'rgb(55, 55, 55)'
                }
            },
            grid: {
                vertLines: {color: 'rgba(29, 30, 38, 5)'},
                horzLines: {color: 'rgba(29, 30, 58, 5)'},
            },
            handleScroll: {vertTouchDrag: true},
        })
    }

    createCandlestickSeries() {
        const up = 'rgba(39, 157, 130, 100)'
        const down = 'rgba(200, 97, 100, 100)'
        const candleSeries = this.chart.addCandlestickSeries({
            upColor: up, borderUpColor: up, wickUpColor: up,
            downColor: down, borderDownColor: down, wickDownColor: down
        });
        candleSeries.priceScale().applyOptions({
            scaleMargins: {top: 0.2, bottom: 0.2},
        });
        return candleSeries;
    }

    createVolumeSeries() {
        const volumeSeries = this.chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {type: 'volume'},
            priceScaleId: 'volume_scale',
        })
        volumeSeries.priceScale().applyOptions({
            scaleMargins: {top: 0.8, bottom: 0},
        });
        return volumeSeries;
    }

    createLineSeries(name: string, options: DeepPartial<LineStyleOptions & SeriesOptionsCommon>) {
        const line = this.chart.addLineSeries({...options});
        this._seriesList.push(line);
        this.legend.makeSeriesRow(name, line)
        return {
            name: name,
            series: line,
        }
    }

    createHistogramSeries(name: string, options: DeepPartial<HistogramStyleOptions & SeriesOptionsCommon>) {
        const line = this.chart.addHistogramSeries({...options});
        this._seriesList.push(line);
        this.legend.makeSeriesRow(name, line)
        return {
            name: name,
            series: line,
        }
    }

    createToolBox() {
        this.toolBox = new ToolBox(this.id, this.chart, this.series, this.commandFunctions);
        this.div.appendChild(this.toolBox.div);
    }

    createTopBar() {
        this._topBar = new TopBar(this);
        this.wrapper.prepend(this._topBar._div)
        return this._topBar;
    }

    createVolumeProfile(data: Object[]){
        const options = {color: 'rgba(214, 237, 255, 0.6)',
                         lineStye: 0,
                         lineWidth: 2,
                         lastValueVisible: true,
                         priceLineVisible: true,
                         crosshairMarkerVisible: true,
                         priceScaleId: undefined};
        const line = this.createLineSeries("price", options);
        line.series.setData(data);
        console.log("Created line with data", data);
        const basePrice = data[data.length - 5].value;
        const priceStep = Math.round(basePrice * 0.1);
        const profile = []
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

    createUserPriceAlert (symbol: string) {
        const alert = new UserPriceAlerts();
        alert.setSymbolName(symbol);
        this.series.attachPrimitive(alert);
        alert.alertAdded().subscribe((alertInfo: UserAlertInfo) => {
            console.log(
                `➕ Alert added @ ${alertInfo.price} with the id: ${alertInfo.id}`
            );
        });
        alert.alertRemoved().subscribe((id: string) => {
            console.log(`❌ Alert removed with the id: ${id}`);
        });
        this.alerts.push(alert);
    };

    createDeltaToolTip () {
        const tooltip = new DeltaTooltipPrimitive({
	          lineColor: 'rgba(150, 150, 150, 0.2)',
        });
        this.series.attachPrimitive(tooltip);
    };


    toJSON() {
        // Exclude the chart attribute from serialization
        const {chart, ...serialized} = this;
        return serialized;
    }

    public static syncCharts(childChart:Handler, parentChart: Handler, crosshairOnly = false) {
        function crosshairHandler(chart: Handler, point: any) {//point: BarData | LineData) {
            if (!point) {
                chart.chart.clearCrosshairPosition()
                return
            }
            // TODO fix any point ?
            chart.chart.setCrosshairPosition(point.value || point!.close, point.time, chart.series);
            chart.legend.legendHandler(point, true)
        }

        function getPoint(series: ISeriesApi<SeriesType>, param: MouseEventParams) {
            if (!param.time) return null;
            return param.seriesData.get(series) || null;
        }

        const childTimeScale = childChart.chart.timeScale();
        const parentTimeScale = parentChart.chart.timeScale();

        const setChildRange = (timeRange: LogicalRange | null) => {
            if(timeRange) childTimeScale.setVisibleLogicalRange(timeRange);
        }
        const setParentRange = (timeRange: LogicalRange | null) => {
            if(timeRange) parentTimeScale.setVisibleLogicalRange(timeRange);
        }

        const setParentCrosshair = (param: MouseEventParams) => {
            crosshairHandler(parentChart, getPoint(childChart.series, param))
        }
        const setChildCrosshair = (param: MouseEventParams) => {
            crosshairHandler(childChart, getPoint(parentChart.series, param))
        }

        let selected = parentChart
        function addMouseOverListener(
            thisChart: Handler,
            otherChart: Handler,
            thisCrosshair: MouseEventHandler<Time>,
            otherCrosshair: MouseEventHandler<Time>,
            thisRange: LogicalRangeChangeEventHandler,
            otherRange: LogicalRangeChangeEventHandler)
        {
            thisChart.wrapper.addEventListener('mouseover', () => {
                if (selected === thisChart) return
                selected = thisChart
                otherChart.chart.unsubscribeCrosshairMove(thisCrosshair)
                thisChart.chart.subscribeCrosshairMove(otherCrosshair)
                if (crosshairOnly) return;
                otherChart.chart.timeScale().unsubscribeVisibleLogicalRangeChange(thisRange)
                thisChart.chart.timeScale().subscribeVisibleLogicalRangeChange(otherRange)
            })
        }
        addMouseOverListener(
            parentChart,
            childChart,
            setParentCrosshair,
            setChildCrosshair,
            setParentRange,
            setChildRange
        )
        addMouseOverListener(
            childChart,
            parentChart,
            setChildCrosshair,
            setParentCrosshair,
            setChildRange,
            setParentRange
        )

        parentChart.chart.subscribeCrosshairMove(setChildCrosshair)

        const parentRange = parentTimeScale.getVisibleLogicalRange()
        if (parentRange) childTimeScale.setVisibleLogicalRange(parentRange)

        if (crosshairOnly) return;
        parentChart.chart.timeScale().subscribeVisibleLogicalRangeChange(setChildRange)
    }

    public static makeSearchBox(chart: Handler, items: []) {
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

        function fuzzySearch(query: string) {
            if (!query) {
                resultsList.style.display = 'none';
                return;
            }
            resultsList.style.display = 'block';
            const results = items.filter(item =>
                item.toUpperCase().includes(query.toUpperCase()));
            resultsList.innerHTML = results.map(item => `<li>${item}</li>`).join('');
            resultsList.style.display = results.length ? 'block' : 'none';
        }

        sBox.addEventListener('input', () => {
            const query = sBox.value.trim();
            fuzzySearch(query);
        });

        resultsList.addEventListener('click', (event: MouseEvent) => {
            const target = event.target as HTMLLIElement;
            if (target && target.tagName === 'LI') {
                sBox.value = target.textContent || '';
                searchWindow.style.display = 'none';
                resultsList.style.display = 'none';
            }
        });

        chart.commandFunctions.push((event: KeyboardEvent) => {
            if (window.handlerInFocus !== chart.id || window.textBoxFocused) return false;
            if (searchWindow.style.display === 'none') {
                if (/^[a-zA-Z0-9]$/.test(event.key)) {
                    searchWindow.style.display = 'flex';
                    sBox.focus();
                    return true;
                } else return false;
            } else if (event.key === 'Enter' || event.key === 'Escape') {
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

    public static makeSpinner(chart: Handler) {
        chart.spinner = document.createElement('div');
        chart.spinner.classList.add('spinner');
        chart.wrapper.appendChild(chart.spinner)

        // TODO below can be css (animate)
        let rotation = 0;
        const speed = 10;
        function animateSpinner() {
            if (!chart.spinner) return;
            rotation += speed
            chart.spinner.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`
            requestAnimationFrame(animateSpinner)
        }
        animateSpinner();
    }

    private static readonly _styleMap = {
        '--bg-color': 'backgroundColor',
        '--hover-bg-color': 'hoverBackgroundColor',
        '--click-bg-color': 'clickBackgroundColor',
        '--active-bg-color': 'activeBackgroundColor',
        '--muted-bg-color': 'mutedBackgroundColor',
        '--border-color': 'borderColor',
        '--color': 'color',
        '--active-color': 'activeColor',
    }
    public static setRootStyles(styles: any) {
        const rootStyle = document.documentElement.style;
        for (const [property, valueKey] of Object.entries(this._styleMap)) {
            rootStyle.setProperty(property, styles[valueKey]);
        }
    }
}
