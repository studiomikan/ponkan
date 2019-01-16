import { Logger } from "./logger";

export class Tag {
  protected _name: string;
  protected _values: any;

  public get name(): string { return this._name; }
  public get values(): any { return this._values; }

  public constructor(name: string, values: any) {
    this._name = name;
    this._values = values;
  }

  public debugPrint(): void {
    Logger.debug("TAG: ", this.name, this.values);
  }

  public clone(): Tag {
    const values2: any = {};
    for (const key in this.values) {
      if (this.values.hasOwnProperty(key)) {
        values2[key] = this.values[key];
      }
    }
    return new Tag(this.name, values2);
  }
}
