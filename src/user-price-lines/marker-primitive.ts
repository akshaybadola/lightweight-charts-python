import {
	ISeriesPrimitivePaneView,
	ISeriesPrimitivePaneRenderer,
	Time,
	AutoscaleInfo,
} from 'lightweight-charts';
import { PluginBase } from '../plugin-base';
import { ExpiringMarkers } from './markers';
import { upArrowIcon, tickIcon, cancelIcon, downArrowIcon } from './icons';
import { MovableMarkerPaneRenderer,
         MarkerDataItem } from './marker-renderer';

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

	update() {
		const data: MarkerDataItem[] = [];
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
					text: alert.parameters.title,
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

	constructor(source: ExpiringMarkers) {
		super();
		this._source = source;
		this._views = [new MarkersPaneView(this._source)];
	}

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
