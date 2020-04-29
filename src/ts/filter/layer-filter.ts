export class LayerFilter {
  public static readonly filterName: string = "LayerFilter(base class)";
  public get filterName(): string {
    return LayerFilter.filterName;
  }
  public get pixiFilter(): PIXI.Filter {
    return this._filter;
  }
  protected _filter: PIXI.Filter;
  protected params: any = {};

  public constructor(params: any, permitedList: string[] = []) {
    this._filter = new PIXI.filters.AlphaFilter(1);
    if (permitedList.length > 0) {
      params = this.permitParams(params, permitedList);
    }
    this.params = params;
  }

  protected permitParams(params: any, list: string[]): any {
    const newParams: any = {};
    list.forEach((key) => {
      if (params[key] != null) {
        newParams[key] = params[key];
      }
    });
    return newParams;
  }

  public store(): any {
    return this.params;
  }
}
