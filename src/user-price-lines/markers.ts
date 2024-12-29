import {
	DataChangedScope,
	IChartApi,
	ISeriesApi,
  LineData,
  OhlcData,
	MismatchDirection,
	SeriesOptionsMap,
	UTCTimestamp,
	WhitespaceData,
  MouseEventParams,
} from 'lightweight-charts';

import {
	MarkersAlert,
	IMarkers,
	MarkersParameters,
	MarkersOptions,
	defaultOptions,
} from './options';
import { MarkersPrimitive } from './marker-primitive';

/**
 * This Plugin will work best with a chart which has a linear time scale.
 */

function hasValue(data: LineData | WhitespaceData): data is LineData {
	return (data as LineData).value !== undefined;
}

function hasClose(data: OhlcData): data is OhlcData {
	return (data as OhlcData).close !== undefined;
}

export class ExpiringMarkers implements IMarkers {
	_options: MarkersOptions;
	_chart: IChartApi;
	_series: ISeriesApi<keyof SeriesOptionsMap>;
	_primitive: MarkersPrimitive;
	_whitespaceSeriesStart: number | null = null;
	_whitespaceSeriesEnd: number | null = null;
	_whitespaceSeries: ISeriesApi<'Line'>;

	_alerts: Map<string, MarkersAlert> = new Map();
	_dataChangedHandler: (scope: DataChangedScope) => void;

	constructor(
		series: ISeriesApi<keyof SeriesOptionsMap>,
		options: Partial<MarkersOptions>
	) {
		this._series = series;
		this._options = {
			...defaultOptions,
			...options,
		};
		this._primitive = new MarkersPrimitive(this);
		this._series.attachPrimitive(this._primitive);
		this._dataChangedHandler = this._dataChanged.bind(this);
		this._series.subscribeDataChanged(this._dataChangedHandler);

		const currentLastPoint = this._series.dataByIndex(
			10000,
			MismatchDirection.NearestLeft
		);

		this._chart = this._primitive.chart;
		this._whitespaceSeries = this._chart.addLineSeries();
    // document.addEventListener('mousedown', this._onMouseDown.bind(this));
    // document.addEventListener('mousemove', this._onMouseMove.bind(this));
    // document.addEventListener('mouseup', this._onMouseUp.bind(this));
    this._chart.subscribeClick(this._clickHandler);
    this._chart.subscribeCrosshairMove(this._moveHandler);

		if (currentLastPoint) this.checkedCrossed(currentLastPoint);
	}

  private _clickHandler = (param: MouseEventParams) => this._onClick(param);
  private _moveHandler = (param: MouseEventParams) => this._onMouseMove(param);

	destroy() {
		this._series.unsubscribeDataChanged(this._dataChangedHandler);
		this._series.detachPrimitive(this._primitive);
    this._chart.unsubscribeCrosshairMove(this._moveHandler);
	}

	alerts() {
		return this._alerts;
	}
	chart() {
		return this._chart;
	}
	series() {
		return this._series;
	}

	addMarker(
		price: number,
		startDate: number,
		endDate: number,
		parameters: MarkersParameters,
	): string {
		let id = (Math.random() * 100000).toFixed();
		while (this._alerts.has(id)) {
			id = (Math.random() * 100000).toFixed();
		}
		this._alerts.set(id, {
			price,
			start: startDate,
			end: endDate,
			parameters,
      moving: false,
			crossed: false,
			expired: false,
		});
		this._update();
    console.log("Created alert", this._alerts);
		return id;
	}

	removeExpiringMarker(id: string) {
		this._alerts.delete(id);
		this._update();
    console.log("Marker expired", this._alerts);
	}

	toggleCrossed(id: string) {
		const alert = this._alerts.get(id);
		if (!alert) return;
		alert.crossed = true;
		setTimeout(() => {
			this.removeExpiringMarker(id);
		}, this._options.clearTimeout);
		this._update();
    console.log("Marker crossed", this._alerts);
	}

	checkExpired(time: number) {
		for (const [id, data] of this._alerts.entries()) {
			if (data.end <= time) {
				data.expired = true;
				setTimeout(() => {
					this.removeExpiringMarker(id);
				}, this._options.clearTimeout);
			}
		}
		this._update();
	}

	_lastValue: number | undefined = undefined;

	checkedCrossedValue(point: LineData | WhitespaceData) {
    if (!hasValue(point)) return;
		if (this._lastValue !== undefined) {
			for (const [id, data] of this._alerts.entries()) {
				let crossed = false;
          console.log("Check crossed", data, point)
				if (data.parameters.crossingDirection === 'up') {
					if (this._lastValue <= data.price && point.value > data.price) {
						crossed = true;
					}
				} else if (data.parameters.crossingDirection === 'down') {
					if (this._lastValue >= data.price && point.value < data.price) {
						crossed = true;
					}
				}
				if (crossed) {
					this.toggleCrossed(id);
				}
			}
		}
		this._lastValue = point.value;
	}

	checkedCrossed(point: OhlcData) {
    if (!hasClose(point)) return;
		if (this._lastValue !== undefined) {
			for (const [id, data] of this._alerts.entries()) {
				let crossed = false;
				if (data.parameters.crossingDirection === 'up') {
					if (this._lastValue <= data.price && point.close > data.price) {
						crossed = true;
					}
				} else if (data.parameters.crossingDirection === 'down') {
					if (this._lastValue >= data.price && point.close < data.price) {
						crossed = true;
					}
				}
				if (crossed) {
					this.toggleCrossed(id);
				}
			}
		}
		this._lastValue = point.close;
	}

	_update() {
		let start: number | null = Infinity;
		let end: number | null = 0;
		const hasAlerts = this._alerts.size > 0;
		for (const [_id, data] of this._alerts.entries()) {
			if (data.end > end) end = data.end;
			if (data.start < start) start = data.start;
		}
		if (!hasAlerts) {
			start = null;
			end = null;
		}
		if (start) {
			const lastPlotDate =
				(this._series.dataByIndex(1000000, MismatchDirection.NearestLeft)
					?.time as number | undefined) ?? start;
			if (lastPlotDate < start) start = lastPlotDate;
		}
		if (
			this._whitespaceSeriesStart !== start ||
			this._whitespaceSeriesEnd !== end
		) {
			this._whitespaceSeriesStart = start;
			this._whitespaceSeriesEnd = end;
			if (!this._whitespaceSeriesStart || !this._whitespaceSeriesEnd) {
				this._whitespaceSeries.setData([]);
			} else {
				this._whitespaceSeries.setData(
					this._buildWhitespace(
						this._whitespaceSeriesStart,
						this._whitespaceSeriesEnd
					)
				);
			}
		}

		this._primitive.requestUpdate();
	}

	_buildWhitespace(start: number, end: number): WhitespaceData[] {
		const data: WhitespaceData[] = [];
		for (let time = start; time <= end; time += this._options.interval) {
			data.push({ time: time as UTCTimestamp });
		}
		return data;
	}

  private _checkXButtonClick(param: MouseEventParams): boolean {
    if (!param.point || !param.point.x || !this._series) return false;

    const x = param.point.x;
    const y = param.point.y;

    let id = null;
    if (x && y) {
      for (const view of this._primitive._views) {
        id = view.xyinButton(x, y);
        if (id) {
          this._alerts.delete(id);
		      this._update();
          return true;
        }
      }
    }
    return false;
  }

  private _onClick(param: MouseEventParams) {
		if (!param.point || !param.point.x || !this._series) return;

    const deleted = this._checkXButtonClick(param);
    if (deleted){
      return;
    }


    for (const [id, alert] of this._alerts.entries()){
      if (alert.moving){
        const price = this._getMousePrice(param);
        if (!price) return;
        this._alerts.set(id, {
          price,
          start: alert.start,
          end: alert.end,
          parameters: alert.parameters,
          moving: false,
          crossed: false,
          expired: false,
        });
		    this._update();
        return;
      }
    }

		if (!param.point.x || !param.point.y) return;

    const x = param.point.x;
    const y = param.point.y;

    if (x && y){
      for (const view of this._primitive._views) {
        view.xyinBounds(x, y);
      }
    }
  }

	private _onMouseMove(param: MouseEventParams) {
		if (!param.point || !param.point.x || !this._series) return;

    let id: string | null = null;
    let price: number | null = null;
    let alert: MarkersAlert | null = null;

    for (const [_id, _alert] of this._alerts.entries()){
      if (_alert.moving) {
        price = this._getMousePrice(param);
        id = _id;
        alert = _alert;
        break;
      }
    }
    if (!id || !price || !alert) return;
    this._alerts.set(id, {
      price,
      start: alert.start,
      end: alert.end,
      parameters: alert.parameters,
      moving: true,
      crossed: false,
      expired: false,
    })
	}

	private _getMousePrice(param: MouseEventParams) {
		if (!param.point || !this._series) return null;
		const price = this._series.coordinateToPrice(param.point.y);
		return price;
	}

	_dataChanged() {
		const lastPoint = this._series.dataByIndex(
			100000,
			MismatchDirection.NearestLeft
		);
		if (!lastPoint) return;
		this.checkedCrossed(lastPoint);
		this.checkExpired(lastPoint.time as number);
	}
}
