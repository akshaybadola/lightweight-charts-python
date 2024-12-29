import { IChartApi, ISeriesApi, SeriesOptionsMap } from 'lightweight-charts';

export interface MarkersOptions {
	/** Interval between bars (in seconds) */
	interval: number;
	/** Delay when removing an alert */
	clearTimeout: number;
}

export const defaultOptions: MarkersOptions = {
	interval: 60 * 60 * 24,
	clearTimeout: 3000,
};

export interface MarkersParameters {
	// color: string;
	title: string;
	crossingDirection: 'up' | 'down';
}

export interface MarkersPosition {
	x: number;
	y: number;
}

export interface MarkersAlert {
	price: number;
	start: number;
	end: number;
  parameters: MarkersParameters;
  moving: boolean;
	crossed: boolean;
	expired: boolean;
}

export interface IMarkers {
	alerts(): Map<string, MarkersAlert>;
	chart(): IChartApi | null;
	series(): ISeriesApi<keyof SeriesOptionsMap>;
}

