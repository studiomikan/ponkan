export class LayerFilter {
  public static readonly filterName: string = "LayerFilter(base class)";
  public get filterName(): string { return LayerFilter.filterName; }
  public get pixiFilter(): PIXI.Filter<any> { return this._filter; }
  protected _filter: PIXI.Filter<any>;
  protected params: any = {};

  public constructor(params: any) {
    this._filter = new PIXI.filters.AlphaFilter(1);
    this.params = params;
  }

  public store(): any {
    return this.params;
  }
}