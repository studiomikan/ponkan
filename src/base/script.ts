import { Logger } from "./logger";
import { Resource } from "./resource";
import { ScriptParser } from "./script-parser";
import { Tag } from "./tag";

export class Script {
  protected _filePath: string;
  protected parser: ScriptParser;
  protected tagPoint: number = 0;

  public get filePath(): string { return this._filePath; }

  public constructor(filePath: string, scriptText: string) {
    this._filePath = filePath;
    this.parser = new ScriptParser(scriptText);
  }

  public debugPrint() {
    Logger.debug("============================================");
    this.parser.debugPrint();
    Logger.debug("Script current point: ", this.tagPoint);
    Logger.debug("============================================");
  }

  public goToStart() {
    this.goTo(0);
  }

  public goTo(point: number) {
    if (point < 0) { point = 0; }
    if (point >= this.parser.tags.length) { point = this.parser.tags.length - 1; }
    this.tagPoint = point;
  }

  public getNextTag(): Tag | null {
    const tags = this.parser.tags;
    if (tags.length <= this.tagPoint) { return null; }

    const tag = tags[this.tagPoint++];
    return tag;
  }

  // TODO ifなどの処理
}
