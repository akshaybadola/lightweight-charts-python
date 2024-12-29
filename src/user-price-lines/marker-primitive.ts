import {
	ISeriesPrimitivePaneView,
	ISeriesPrimitivePaneRenderer,
	AutoscaleInfo,
  Time
} from 'lightweight-charts';
import { PluginBase } from '../plugin-base';
import { ExpiringMarkers } from './markers';
import { upArrowIcon, tickIcon, cancelIcon, downArrowIcon } from './icons';
import { MarkersAlert } from './options';
import { MovableMarkerPaneRenderer,
         IMarkerDataItem } from './marker-renderer';

class MarkersPaneView implements ISeriesPrimitivePaneView {
	_source: ExpiringMarkers;
  _renderer: MovableMarkerPaneRenderer;

	constructor(source: ExpiringMarkers) {
		this._source = source;
	  this._renderer = new MovableMarkerPaneRenderer();
	}

	renderer(): ISeriesPrimitivePaneRenderer {
		return this._renderer;
	}

	xyinButton(x: number, y: number) : string | null {
		let i = 0;
		for (const id of this._source._alerts.keys()) {
			const bounds = this._renderer.iconBounds[i];
			if (! bounds) continue;
			if (x && (x > bounds.x && x < bounds.x + bounds.width) &&
				y && (y > bounds.y && y < bounds.y + bounds.height)){
				return id;
      }
			i++;
		}
		return null;
	}

	xyinBounds(x: number, y: number){
		let i = 0;
		for (const alert of this._source._alerts.values()){
			const bounds = this._renderer.markerBounds[i];
			if (! bounds) continue;
			if (x && x > bounds.x && x < bounds.x + bounds.width &&
				y && y > bounds.y && y < bounds.y + bounds.height){
				alert.moving = true;
				console.log("Set alert moving", alert);
				break;
      }
			i++;
		}
	}

	update() {
		const data: IMarkerDataItem[] = [];
		const ts = this._source._chart?.timeScale();
		if (ts) {
			for (const alert of this._source._alerts.values()) {
				const priceY = this._source._series.priceToCoordinate(alert.price);
				if (priceY === null) continue;
				let startX: number | null = ts.timeToCoordinate(alert.start as Time) as
					| number
					| null;
				let endX: number | null = ts.timeToCoordinate(alert.end as Time) as
					| number
					| null;
				if (startX === null && endX === null) continue;
				if (!startX) startX = 0;
				if (!endX) endX = ts.width();
				let color = '#000000';
				let icon = upArrowIcon;
				if (alert.parameters.crossingDirection === 'up') {
					color = alert.crossed
						? '#386D2E'
						: alert.expired
						? '#30472C'
						: '#64C750';
					icon = alert.crossed
						? tickIcon
						: alert.expired
						? cancelIcon
						: upArrowIcon;
				} else if (alert.parameters.crossingDirection === 'down') {
					color = alert.crossed
						? '#7C1F3E'
						: alert.expired
						? '#4A2D37'
						: '#C83264';
					icon = alert.crossed
						? tickIcon
						: alert.expired
						? cancelIcon
						: downArrowIcon;
				}
				data.push({
					priceY,
					startX,
					endX,
					color,
					icon,
					text: `${alert.price.toFixed(2)} x 100`,
					fade: alert.expired,
				});
			}
		}
		this._renderer.update(data);
	}
}

export class MarkersPrimitive extends PluginBase {
	_source: ExpiringMarkers;
	_views: MarkersPaneView[];
	_states: boolean[];

  // private _clickHandler = (param: MouseEventParams) => this._onClick(param);
  // private _moveHandler = (param: MouseEventParams) => this._onMouseMove(param);

	constructor(source: ExpiringMarkers) {
		super();
		this._source = source;
		this._views = [new MarkersPaneView(this._source)];
		this._states = [];
	}

	// private _onClick(param: MouseEventParams) {
	// 	const price = this._getMousePrice(param);
	// 	const xDistance = this._distanceFromRightScale(param);
	// 	console.log("price line on click", price, xDistance);
	// 	if (
	// 		price === null ||
	// 		xDistance === null ||
	// 		xDistance > LABEL_HEIGHT ||
	// 		!this._series
	// 	)
	// 		return;
	// 	const data = this._series.data();
	// 	this.markers.addMarker(
	// 		price,
	// 		data[data.length - 1].time as number,
	// 		data[data.length - 1].time as number + 19800 * 100,
	// 		{
	// 			crossingDirection: 'down',
	// 			title: '$19.50'
	// 		}
	// 	);
	// }

	// private _onMouseMove(param: MouseEventParams) {
	// 	const price = this._getMousePrice(param);
	// 	const xDistance = this._distanceFromRightScale(param);
	// 	if (price === null || xDistance === null || xDistance > LABEL_HEIGHT * 2) {
	// 		this._labelButtonPrimitive.hideAddLabel();
	// 		return;
	// 	}
	// 	this._labelButtonPrimitive.showAddLabel(price, xDistance < LABEL_HEIGHT);
	// }

	// private _getMousePrice(param: MouseEventParams) {
	// 	if (!param.point || !this._series) return null;
	// 	const price = this._series.coordinateToPrice(param.point.y);
	// 	return price;
	// }

	// private _distanceFromRightScale(param: MouseEventParams) {
	// 	if (!param.point || !this._chart) return null;
	// 	const timeScaleWidth = this._chart.timeScale().width();
	// 	return Math.abs(timeScaleWidth - param.point.x);
	// }

	// remove() {
	// 	if (this._chart) {
	// 		this._chart.unsubscribeClick(this._clickHandler);
	// 		this._chart.unsubscribeCrosshairMove(this._moveHandler);
	// 	}
	// 	if (this._series && this._labelButtonPrimitive) {
	// 		this._series.detachPrimitive(this._labelButtonPrimitive);
	// 	}
	// 	this._chart = undefined;
	// 	this._series = undefined;
	// }

	requestUpdate() {
		super.requestUpdate();
	}

	updateAllViews() {
		this._views.forEach(view => view.update());
	}

	paneViews(): readonly ISeriesPrimitivePaneView[] {
		return this._views;
	}

	autoscaleInfo(): AutoscaleInfo | null {
		let smallest = Infinity;
		let largest = -Infinity;
		for (const alert of this._source._alerts.values()) {
			if (alert.price < smallest) smallest = alert.price;
			if (alert.price > largest) largest = alert.price;
		}
		if (smallest > largest) return null;
		return {
			priceRange: {
				maxValue: largest,
				minValue: smallest,
			},
		};
	}
}
