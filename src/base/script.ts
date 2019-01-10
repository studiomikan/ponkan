import { Logger } from "./logger";
import { Resource } from "./resource";
import { ScriptParser } from "./script-parser";
import { Tag } from "./tag";

export class Script {
  protected parser: ScriptParser;
  protected tagPoint: number = 0;

  public constructor(scriptText: string) {
    this.parser = new ScriptParser(scriptText);
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
