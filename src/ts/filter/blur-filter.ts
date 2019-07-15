import { AsyncTask } from "../base/async-task";
import { LayerFilter } from "./layer-filter";

export class BlurFilter extends LayerFilter {
  public static readonly filterName: string = "blur";
  public get filterName(): string { return BlurFilter.filterName; }
  public get filter(): PIXI.filters.BlurFilter { return this._filter as PIXI.filters.BlurFilter; }

  public constructor(params: any) {
    super(params);
    const filter = this._filter = new PIXI.filters.BlurFilter();
    filter.blurX = params.blurX || 4;
    filter.blurY = params.blurY || 4;
    filter.quality = params.quality || 4;
  }

  // public store(): any {
  //   return super.store();
  // }
}

export function createBlurFilter(params: any): BlurFilter {
  if (params == null) {
    throw new Error("Cannot create BlurFilter, data is empty.");
  }
  return new BlurFilter(params);
}
