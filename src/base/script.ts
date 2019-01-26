import { Logger } from "./logger";
import { Resource } from "./resource";
import { AsyncCallbacks } from "./async-callbacks";
import { ScriptParser } from "./script-parser";
import { Tag } from "./tag";
import { applyJsEntity, castTagValues } from "../tag-action";

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
  protected latestTagBuffer: Tag | null = null;

  protected forLoopStack: IForLoopInfo[] = [];
  protected ifDepth: number = 0;

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

    return this.latestTagBuffer = tags[this.tagPoint++];
  }

  public getLatestTag(): Tag | null {
    return this.latestTagBuffer;
  }

  public ifJump(exp: string, tagActions: any): void {
    this.ifDepth++;
    if (!this.resource.evalJs(exp)) {
      this.goToElseFromIf(tagActions);
    }
  }

  protected goToElseFromIf(tagActions: any): void {
    let depth: number = 0;
    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag === null) {
        throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
        break;
      }
      if (tag.name === "if") {
        depth++;
      } else if (tag.name === "else") {
        if (depth === 0) {
          break;
        }
      } else if (tag.name === "endif") {
        if (depth === 0) {
          this.ifDepth--;
          if (this.ifDepth < 0) {
            throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
          }
          break;
        } else {
          depth--;
        }
      } else if (tag.name === "elsif") {
        if (depth === 0) {
          let tag2: Tag = tag.clone();
          applyJsEntity(this.resource, tag2.values);
          castTagValues(tag2, tagActions["elsif"]);
          if (this.resource.evalJs(tag2.values.exp)) {
            break;
          }
        }
      }
      if (depth < 0) {
        throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
      }
    }
  }

  public elsifJump() {
    // タグ動作としてelsifにきたときは、単に前のif/elsifブロックの終わりを示すため、
    // endifへジャンプしたのでよい。
    this.goToEndifFromElse();
  }

  public elseJump() {
    // タグ動作としてelseにきたときは、単に前のif/elsifブロックの終わりを示すため、
    // endifへジャンプしたのでよい。
    this.goToEndifFromElse();
  }

  protected goToEndifFromElse() {
    let depth: number = 0;
    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag === null) {
        throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
        break;
      }
      if (tag.name === "if") {
        depth++;
      } else if (tag.name === "endif") {
        if (depth === 0) {
          this.ifDepth--;
          if (this.ifDepth < 0) {
            throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
          }
          break;
        } else {
          depth--;
        }
      }
      if (depth < 0) {
        throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
      }
    }
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
