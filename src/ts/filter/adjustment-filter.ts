import { AdjustmentFilter } from "@pixi/filter-adjustment";
import { LayerFilter } from "./layer-filter";

export class ColorFilter extends LayerFilter {
  public static readonly filterName: string = "color";
  public get filterName(): string { return ColorFilter.filterName; }
  public get filter(): PIXI.filters.ColorMatrixFilter { return this._filter as PIXI.filters.ColorMatrixFilter; }
  private static permitedList = ["gamma", "saturation", "contrast", "brightness", "red", "green", "blue"];

  public constructor(params: any) {
    super(params, ColorFilter.permitedList);
    const filter: any = this._filter = new AdjustmentFilter();
    params = this.params;

    ColorFilter.permitedList.forEach((paramName: string) => {
      if (params[paramName] != null) {
        let param: number = +params[paramName];
        if (param < 0) { param = 0; }
        filter[paramName] = param;
      }
    });
  }
}

export function createColorFilter(params: any): ColorFilter {
  if (params == null) {
    throw new Error("Cannot create GammaFilter, params is empty.");
  }
  return new ColorFilter(params);
}
