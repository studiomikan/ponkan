import { Logger } from './logger';

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
}

