import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { Ponkan3 } from "../ponkan3";
import { MovableLayer } from "./movable-layer";

import { BlurFilter, createBlurFilter } from "../filter/blur-filter";
import { ColorMatrixFilter, createColorMatrixFilter } from "../filter/color-matrix-filter";
import { LayerFilter } from "../filter/layer-filter";


// BlurFilter
// ColorMatrixFilter
// DisplacementFilter
// FXAAFilter
// NoiseFilter

export class FilteredLayer extends MovableLayer {

  public get pixiFilters(): Array<PIXI.Filter<any>> {
    return this.container.filters == null ? [] : this.container.filters;
  }

  protected _filters: LayerFilter[] = [];
  public get filters(): LayerFilter[] { return this._filters; }

  protected static filterClassList: any = null;

  public constructor(name: string, resource: Resource, owner: Ponkan3) {
    super(name, resource, owner);
    this._filters = [];

    if (FilteredLayer.filterClassList == null) {
      FilteredLayer.filterClassList = {};
      FilteredLayer.registerFilter(BlurFilter.filterName, createBlurFilter);
      FilteredLayer.registerFilter(ColorMatrixFilter.filterName, createColorMatrixFilter);
    }
  }

  public static registerFilter(filterName: string, createFunction: any) {
    // console.log("@@ register ", filterName, createFunction);
    FilteredLayer.filterClassList[filterName] = createFunction;
  }

  public addFilter(filterName: string, params: any): void {
    // console.log("@@", filterName, params);
    // console.log("@@", FilteredLayer.filterClassList);
    const createFunction: any = FilteredLayer.filterClassList[filterName];
    // console.log("@@ createFunction", createFunction);
    const filter = createFunction(params);
    this.addLayerFilter(filter);
  }

  protected addLayerFilter(filter: LayerFilter): void {
    this.filters.push(filter);
    const buf: Array<PIXI.Filter<any>> = [];
    this.filters.forEach((f) => {
      buf.push(f.pixiFilter);
    });
    this.container.filters = buf;
  }

  public clearFilters(): void {
    this._filters = [];
    this.container.filters = [];
  }

  // protected static filteredLayerStoreParams: string[] = [
  // ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    // FilteredLayer.filteredLayerStoreParams.forEach((p) => data[p] = me[p]);

    data.filters = [];
    this.filters.forEach((filter, index) => {
      data.filters.push({
        filterName: filter.filterName,
        data: filter.store(),
      });
    });

    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    super.restore(asyncTask, data, tick, clear);
    const me: any = this as any;
    // FilteredLayer.filteredLayerStoreParams.forEach((p) => me[p] = data[p]);

    this.clearFilters();
    if (data.filters != null) {
      data.filters.forEach((filterData: any) => {
        this.addFilter(filterData.filterName, filterData.data);
      });
    }
  }

  public copyTo(dest: FilteredLayer): void {
    super.copyTo(dest);
    const me: any = this as any;
    const you: any = dest as any;
    // FilteredLayer.filteredLayerStoreParams.forEach((p) => you[p] = me[p]);
    dest.clearFilters();
    this.filters.forEach((filter: LayerFilter) => {
      dest.addFilter(filter.filterName, filter.store());
    });
  }
}
