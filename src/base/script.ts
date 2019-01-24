import { Logger } from "./logger";
import { Resource } from "./resource";
import { ScriptParser } from "./script-parser";
import { Tag } from "./tag";

export interface IForLoopInfo {
  startTagPoint: number;
  indexVarName: string;
  loops: number;
  count: number;
}

export class Script {
  protected resource: Resource;
  protected _filePath: string;
  public get filePath(): string { return this._filePath; }

  protected parser: ScriptParser;
  protected tagPoint: number = 0;

  protected forLoopStack: IForLoopInfo[] = [];

  public constructor(resource: Resource, filePath: string, scriptText: string) {
    this.resource = resource;
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

    return tags[this.tagPoint++];
  }

  /**
   * forループを開始
   * @param loops 繰り返し回数
   * @param indexVarName indexを格納する一時変数の名前。
   */
  public startForLoop(loops: number, indexVarName: string = "__index__"): void {
    let loopInfo: IForLoopInfo = {
      startTagPoint: this.tagPoint,
      indexVarName: indexVarName,
      loops: loops,
      count: 0
    };
    this.forLoopStack.push(loopInfo);
    this.resource.evalJs(`tv["${loopInfo.indexVarName}"] = ${loopInfo.count};`);
  }

  /**
   * forLoopの終わり
   */
  public endForLoop(): void {
    let loopInfo = this.forLoopStack[this.forLoopStack.length - 1];
    if (loopInfo == null) {
      throw new Error("予期しないendforです。forとendforの対応が取れていません");
    }

    console.log("for", loopInfo);
    if (++loopInfo.count < loopInfo.loops) {
      this.resource.evalJs(`tv["${loopInfo.indexVarName}"] = ${loopInfo.count};`);
      this.goTo(loopInfo.startTagPoint);
    } else {
      this.forLoopStack.pop();
    }
  }

  // TODO breakforの動作

}
