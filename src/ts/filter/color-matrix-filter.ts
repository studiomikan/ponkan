import { AsyncTask } from "../base/async-task";
import { LayerFilter } from "./layer-filter";

export class ColorMatrixFilter extends LayerFilter {
  public static readonly filterName: string = "colormatrix";
  public get filterName(): string { return ColorMatrixFilter.filterName; }
  public get filter(): PIXI.filters.ColorMatrixFilter { return this._filter as PIXI.filters.ColorMatrixFilter; }

  public constructor(params: any) {
    super(params);
    const filter = this._filter = new PIXI.filters.ColorMatrixFilter();
    console.log("ColorMatrixFilter type:", params.type);
    switch (params.type.toLowerCase()) {
      case "negative":
        filter.negative(true);
        break;
      case "grayscale":
        filter.greyscale(params.scale || 1, true);
        break;
      case "brightness":
        filter.brightness(params.bright || 0.5, true);
        break;
      case "browni":
        filter.browni(true);
        break;
      case "contrast":
        filter.contrast(params.contrast || 0.5, true);
        break;
      case "desaturate":
        filter.desaturate();
        break;
      case "hue":
        filter.hue(params.rotation || 0, true);
        break;
      case "kodachrome":
        filter.kodachrome(true);
        break;
      case "lsd":
        filter.lsd(true);
        break;
      case "night":
        filter.night(params.intensity || 0, true);
        break;
      case "polaroid":
        filter.polaroid(true);
        break;
      case "predator":
        filter.predator(params.amount || 0, true);
        break;
      case "saturate":
        filter.saturate(params.amount || 0, true);
        break;
      case "sepia":
        filter.sepia(true);
        break;
      case "technicolor":
        filter.technicolor(true);
        break;
      case "toBGR":
        filter.toBGR(true);
        break;
      case "vintage":
        filter.vintage(true);
        break;
      case "colortone":
        filter.colorTone(params.desaturation, params.toned, params.lightColor, params.darkColor, true);
        break;
    }
  }

  // public store(): any {
  //   return super.store();
  // }
}

export function createColorMatrixFilter(params: any): ColorMatrixFilter {
  if (params == null) {
    throw new Error("Cannot create ColorMatrixFilter, params is empty.");
  }
  return new ColorMatrixFilter(params);
}
