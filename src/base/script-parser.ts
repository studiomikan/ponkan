import { Logger } from './logger';
import { Resource } from './resource'

export class Command {
  protected _name: string;
  protected _values: object;

  public get name(): string { return this._name; }
  public get values(): object { return this._values; }

  public constructor(name: string, values: object) {
    this._name = name;
    this._values = values;
  }
}

export class ScriptParser {
  private scriptText: string;

  public constructor(scriptText: string) {
    this.scriptText = scriptText;
    this.parse(scriptText);
  }

  private parse(scriptText: string) {
    let lines: string[] = scriptText.split(/\n/g);
    lines.forEach((line) => {
      this.parseLine(line);
    });
  }

  private parseLine(line: string) {
    if (line == "") return;

    let ch0 = line.charAt(0);

    switch (ch0) {
      case '#':
        // コメント
        break;
      case ';':
        // コマンド
        break;
      case ':':
        // ラベル
        break;
      case '-':
        // JavaScript
        break;
      case '=':
        // JavaScript出力
        break;
    }

  }

}

