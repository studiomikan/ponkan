import { Logger } from './logger';

export class Tag {
  public readonly name: string;
  public readonly values: any;
  public readonly line: number;

  public constructor(name: string, values: any, line: number) {
    this.name = name;
    this.values = values;
    this.line = line;
  }

  public debugPrint(): void {
    Logger.debug('TAG: ', this.name, this.values);
  }

  public clone(): Tag {
    const values2: any = {};
    for (const key in this.values) {
      if (Object.prototype.hasOwnProperty.call(this.values, key)) {
        values2[key] = this.values[key];
      }
    }
    return new Tag(this.name, values2, this.line);
  }
}
