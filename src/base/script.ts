import { Logger } from "./logger";
import { Resource } from "./resource";
import { AsyncCallbacks } from "./async-callbacks";
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

  public debugPrint(): void {
    Logger.debug("============================================");
    this.parser.debugPrint();
    Logger.debug("Script current point: ", this.tagPoint);
    Logger.debug("============================================");
  }

  public goToStart(): void {
    this.goTo(0);
  }

  public goTo(point: number): void {
    if (point < 0) { point = 0; }
    if (point >= this.parser.tags.length) { point = this.parser.tags.length - 1; }
    this.tagPoint = point;
  }

  /**
   * 指定のラベルの位置へ移動する。
   * ラベルの検索はファイルの先頭から実施するため、
   * ファイル内に同じラベルが2つ以上あった場合は、1番目の位置へ移動する。
   * ラベルが見つからなかった場合はエラーになる。
   * @param label 移動先ラベル
   */
  public goToLabel(label: string): void {
    this.goToStart();
    while (true) {
      let tag: Tag | null = this.getNextTag()
      if (tag == null) {
        throw new Error(`${this.filePath}内に、${label}が見つかりませんでした`);
      }
      if (tag.name === "__label__" && tag.values.__body__ === label) {
        break;
      }
    }
  }

  /**
   * 次のタグを取得する。
   * スクリプトファイル終端の場合はnullが返る
   * @return 次のタグ。終端の場合はnull
   */
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

    if (++loopInfo.count < loopInfo.loops) {
      this.resource.evalJs(`tv["${loopInfo.indexVarName}"] = ${loopInfo.count};`);
      this.goTo(loopInfo.startTagPoint);
    } else {
      this.forLoopStack.pop();
    }
  }

  /**
   * forLoopから抜け出す
   */
  public breakForLoop(): void {
    let depth: number = 1;
    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag === null) {
        throw new Error("breakforの動作エラー。forとendforの対応が取れていません");
        break;
      }
      if (tag.name === "for") {
        depth++;
      } else if (tag.name === "endfor") {
        depth--;
        if (depth === 0) {
          break;
        } else if (depth < 0) {
          throw new Error("breakforの動作エラー。forとendforの対応が取れていません");
        }
      }
    }
  }

}
