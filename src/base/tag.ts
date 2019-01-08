import { Logger } from './logger';

export class Tag {
  protected _name: string;
  protected _values: object;

  public get name(): string { return this._name; }
  public get values(): object { return this._values; }

  public constructor(name: string, values: object) {
    this._name = name;
    this._values = values; 
  }

  public debugPrint(): void {
    Logger.debug("TAG: ", this.name, this.values);
  }
}

