import { Logger } from "./logger";
import { Resource } from "./resource";
import { AsyncCallbacks } from "./async-callbacks";
import { ScriptParser } from "./script-parser";
import { Tag } from "./tag";
import { Macro } from "./macro";
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

  protected macroStack: Macro[] = [];

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
    if (this.macroStack.length === 0) {
      const tags = this.parser.tags;
      if (tags.length <= this.tagPoint) {
        return null;
      } else {
        let tag: Tag = this.latestTagBuffer = tags[this.tagPoint++];
        if (this.resource.hasMacro(tag.name)) {
          this.callMacro(tag);
          return this.getNextTag();
        } else {
          return tag;
        }
      }
    } else {
      let macro: Macro = this.macroStack[this.macroStack.length - 1];
      let tag: Tag | null = macro.getNextTag();
      if (tag != null) {
        if (this.resource.hasMacro(tag.name)) {
          this.callMacro(tag);
          return this.getNextTag();
        } else {
          return tag;
        }
      } else {
        this.macroStack.pop();
        return this.getNextTag();
      }
    }
  }

  protected callMacro(tag: Tag): void {
    let macro: Macro = this.resource.getMacro(tag.name).clone();
    macro.resetTagPoint();
    this.resource.setMacroParams(tag.values);
    this.macroStack.push(macro);
  }

  /**
   * 最後に取得されたタグを返す。
   */
  public getLatestTag(): Tag | null {
    return this.latestTagBuffer;
  }

  /**
   * マクロ定義を開始する
   */
  public defineMacro(name: string): Macro {
    let tags: Tag[] = [];
    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag === null) {
        throw new Error("マクロ定義エラー。macroとendmacroの対応が取れていません");
      } else if (tag.name === "__label__") {
        throw new Error("マクロ定義エラー。マクロの中でラベルは使用できません");
      } else if (tag.name === "__save_mark__") {
        throw new Error("マクロ定義エラー。マクロの中でセーブマークは使用できません");
      } else if (tag.name === "endmacro") {
        break;
      } else {
        tags.push(tag.clone());
      }
    }
    if (tags.length === 0) {
      throw new Error(`マクロ定義の中身が空です`);
    }
    return new Macro(name, tags);
  }

  /**
   * 条件分岐を開始
   * @param tagAction タグ動作定義マップ
   */
  public ifJump(exp: string, tagActions: any): void {
    this.ifDepth++;
    if (!this.resource.evalJs(exp)) {
      this.goToElseFromIf(tagActions);
    }
  }

  /**
   * elseかelsifかendifまでジャンプする。
   * elsifの場合は条件式の評価も行って判定する。
   * @param tagAction タグ動作定義マップ
   */
  protected goToElseFromIf(tagActions: any): void {
    let depth: number = 0;
    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag === null) {
        throw new Error("条件分岐エラー。if/else/elsif/endifの対応が取れていません");
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

  /**
   * elsifタグの動作
   */
  public elsifJump() {
    // タグ動作としてelsifにきたときは、単に前のif/elsifブロックの終わりを示すため、
    // endifへジャンプしたのでよい。
    this.goToEndifFromElse();
  }

  /**
   * elseタグの動作
   */
  public elseJump() {
    // タグ動作としてelseにきたときは、単に前のif/elsifブロックの終わりを示すため、
    // endifへジャンプしたのでよい。
    this.goToEndifFromElse();
  }

  /**
   * endifまでジャンプする。
   */
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
    let depth: number = 0;
    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag === null) {
        throw new Error("breakforの動作エラー。forとendforの対応が取れていません");
        break;
      }
      if (tag.name === "for") {
        depth++;
      } else if (tag.name === "endfor") {
        if (depth === 0) {
          break;
        } else  {
          depth--;
        }
      }
      if (depth < 0) {
        throw new Error("breakforの動作エラー。forとendforの対応が取れていません");
      }
    }
  }

}
