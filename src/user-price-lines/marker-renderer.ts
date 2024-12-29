import { CanvasRenderingTarget2D } from "fancy-canvas";
import { ISeriesPrimitivePaneRenderer } from 'lightweight-charts';
import { positionsLine } from "../helpers/dimensions/positions";
import { iconDimensions, cancelIcon } from "./icons";

export interface IMarkerDataItem {
  priceY: number;
  startX: number;
  endX: number;
  color: string;
  icon: Path2D;
  text: string;
  fade: boolean;
}

export class MovableMarkerPaneRenderer implements ISeriesPrimitivePaneRenderer {
  private _data: IMarkerDataItem[] = [];
  // Store icon positions
  public iconBounds: { x: number; y: number; width: number; height: number }[] = [];
  public markerBounds: { x: number; y: number; width: number; height: number }[] = [];

  data(){
    return this._data;
  }

  update(data: IMarkerDataItem[]) {
    this._data = data;
    this.iconBounds = [];
    this.markerBounds = [];
  }

  draw(target: CanvasRenderingTarget2D): void {
    let pixelRatio = 1;
    target.useBitmapCoordinateSpace(scope => {
      pixelRatio = scope.verticalPixelRatio
    });

    target.useMediaCoordinateSpace(scope => {
      if (!this._data.length) {
        return;
      }

      const ctx = scope.context;

      this._data.forEach(d => {
        const priceLineY = positionsLine(d.priceY, pixelRatio, ctx.lineWidth);
        const priceY = (priceLineY.position + priceLineY.length / 2) / pixelRatio;
        const color = d.color;

        // Coordinates for the marker
        const markerWidth = 100 * pixelRatio;
        const markerHeight = 20 * pixelRatio;
        const markerX = scope.mediaSize.width - markerWidth - 20 * pixelRatio; // Align near the right axis
        const markerY = priceY - markerHeight / 2;
        const startX = markerX + markerWidth / 2

        ctx.fillStyle = d.color;
        ctx.strokeStyle = d.color;
        ctx.lineDashOffset = 0;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(startX + 4, priceY);
        ctx.lineTo(markerX, priceY);
        ctx.stroke();

        // dotted lines
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        ctx.lineCap = 'round';
        ctx.moveTo(startX, priceY);
        ctx.lineTo(scope.mediaSize.width, priceY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw the marker rectangle
        ctx.fillStyle = color;
        if (ctx.roundRect) {
          ctx.roundRect(markerX, markerY, markerWidth, markerHeight, markerHeight / 2);
          ctx.fill();
        } else {
          ctx.fillRect(markerX, markerY, markerWidth, markerHeight);
        }

        // Draw the price text inside the marker
        ctx.font = `${12 * pixelRatio}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF'; // White text
        ctx.fillText(`${d.text}`, markerX + markerWidth / 2, markerY + markerHeight / 2);

        // Draw the cancel icon
        ctx.save(); // Save the canvas state
        const iconX = markerX + markerWidth - 100 * pixelRatio; // Position the icon relative to the marker
        const iconY = markerY + markerHeight / 2 - 6 * pixelRatio; // Center the icon vertically
        ctx.translate(iconX, iconY);
        const scale = 12 / iconDimensions * pixelRatio; // Adjust scale for pixel ratio
        ctx.scale(scale, scale);
        ctx.fillStyle = '#FFFFFF'; // Icon color
        ctx.fill(cancelIcon, 'evenodd'); // Draw the icon
        ctx.restore(); // Restore the canvas state

        this.markerBounds.push({
          x: markerX,
          y: markerY,
          width: markerWidth,
          height: markerHeight
        });

        this.iconBounds.push({
          x: iconX,
          y: iconY,
          width: iconDimensions * pixelRatio,
          height: iconDimensions * pixelRatio,
        });

        // ctx.translate(d.startX - 100 - 14, priceY - 6);
        // const scale = 12 / iconDimensions;
        // ctx.scale(scale, scale);
        // ctx.fill(cancelIcon, 'evenodd');
      });

    });
  }

  drawBackground(): void {
    // No background drawing required
  }

  height(): number {
    return 0; // No effect on chart height
  }
}
