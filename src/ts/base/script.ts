import { applyJsEntity, castTagValues } from "../tag-action";
import { Logger } from "./logger";
import { Macro } from "./macro";
import { Resource } from "./resource";
import { ScriptParser } from "./script-parser";
import { Tag } from "./tag";
import * as Util from "./util";

export interface ForLoopInfo {
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

  protected forLoopStack: ForLoopInfo[] = [];
  protected ifDepth: number = 0;

  protected macroStack: Macro[] = [];

  public constructor(resource: Resource, filePath: string, scriptText: string | null) {
    this.resource = resource;
    this._filePath = filePath;
    if (scriptText != null) {
      this.parser = new ScriptParser(this.resource, scriptText);
    } else {
      this.parser = new ScriptParser(this.resource, "");
    }
  }

  public debugPrint(): void {
    Logger.debug("============================================");
    this.parser.debugPrint();
    Logger.debug("Script current point: ", this.tagPoint);
    Logger.debug("============================================");
  }

  public clone(): Script {
    const script: Script = new Script(this.resource, this.filePath, null);
    script.parser = this.parser;
    return script;
  }

  public goToStart(): void {
    this.goTo(0);
  }

  public goTo(point: number): void {
    if (point < 0) { point = 0; }
    if (point >= this.parser.tags.length) { point = this.parser.tags.length - 1; }
    this.tagPoint = point;
  }

  public getPoint(): number {
    return this.tagPoint;
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
      const tag: Tag | null = this.getNextTag();
      if (tag == null) {
        throw new Error(`${this.filePath}内に、ラベル ${label} が見つかりませんでした`);
      }
      if (tag.name === "__label__" && tag.values.__body__ === label) {
        break;
      }
    }
  }

  /**
   * 指定のセーブマーク位置まで移動する
   * 検索はファイルの先頭から実施するため、
   * ファイル内に同じセーブマークが2つ以上あった場合は、1番目の位置へ移動する。
   * ラベルが見つからなかった場合はエラーになる。
   * @param saveMarkName セーブマーク名
   */
  public goToSaveMark(saveMarkName: string): void {
    this.goToStart();
    while (true) {
      const tag: Tag | null = this.getNextTag();
      if (tag == null) {
        throw new Error(`${this.filePath}内に、セーブマーク ${saveMarkName} が見つかりませんでした`);
      }
      if (tag.name === "__save_mark__" && tag.values.name === saveMarkName) {
        break;
      }
    }
  }

  /**
   * 現在実行中のタグを取得する。
   * @return 実行中のタグ。終端の場合はnull
   */
  public getCurrentTag(): Tag | null {
    if (this.macroStack.length === 0) {
      const tags = this.parser.tags;
      if (tags.length <= this.tagPoint) {
        return null;
      } else {
        return tags[this.tagPoint];
      }
    } else {
      const macro: Macro = this.macroStack[this.macroStack.length - 1];
      return macro.getCurrentTag();
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
        const tag: Tag = this.latestTagBuffer = tags[this.tagPoint++];
        if (this.resource.hasMacro(tag.name)) {
          this.callMacro(tag);
          return this.getNextTag();
        } else {
          return tag;
        }
      }
    } else {
      const macro: Macro = this.macroStack[this.macroStack.length - 1];
      const tag: Tag | null = this.latestTagBuffer = macro.getNextTag();
      this.resource.setMacroParams(macro.params);
      if (tag != null) {
        if (this.resource.hasMacro(tag.name)) {
          this.callMacro(tag);
          return this.getNextTag();
        } else {
          return tag;
        }
      } else {
        this.macroStack.pop();
        this.resource.clearMacroParams();
        return this.getNextTag();
      }
    }
  }

  protected callMacro(tag: Tag): void {
    const macro: Macro = this.resource.getMacro(tag.name).clone();
    macro.clearTagPoint();
    applyJsEntity(this.resource, tag.values);
    macro.params = Util.objClone(tag.values);
    this.macroStack.push(macro);
  }

  public isInsideOfMacro(): boolean {
    return this.macroStack.length !== 0;
  }

  public callCommandShortcut(orgTag: Tag, commandName: string): Tag {
    const tag: Tag = new Tag(commandName, {}, orgTag.line);
    if (this.resource.hasMacro(tag.name)) {
      this.callMacro(tag);
      const nextTag: Tag | null = this.getNextTag();
      if (nextTag == null) {
        throw new Error("コマンドショートカットの呼び出しに失敗しました");
      }
      return nextTag;
    } else {
      return tag;
    }
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
    const tags: Tag[] = [];
    while (true) {
      const tag: Tag | null = this.getNextTagForDefineMacro();
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
   * 次のタグを取得する。マクロの呼び出しを行わない。
   */
  protected getNextTagForDefineMacro(): Tag | null {
    const tags = this.parser.tags;
    if (tags.length <= this.tagPoint) {
      return null;
    } else {
      return tags[this.tagPoint++];
    }
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
    let depth = 0;
    while (true) {
      const tag: Tag | null = this.getNextTag();
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
          const tag2: Tag = tag.clone();
          applyJsEntity(this.resource, tag2.values);
          castTagValues(tag2, tagActions.elsif);
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
  public elsifJump(): void {
    // タグ動作としてelsifにきたときは、単に前のif/elsifブロックの終わりを示すため、
    // endifへジャンプしたのでよい。
    this.goToEndifFromElse();
  }

  /**
   * elseタグの動作
   */
  public elseJump(): void {
    // タグ動作としてelseにきたときは、単に前のif/elsifブロックの終わりを示すため、
    // endifへジャンプしたのでよい。
    this.goToEndifFromElse();
  }

  /**
   * endifまでジャンプする。
   */
  protected goToEndifFromElse(): void {
    let depth = 0;
    while (true) {
      const tag: Tag | null = this.getNextTag();
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

  public isInsideOfIf(): boolean {
    return this.ifDepth !== 0;
  }

  /**
   * forループを開始
   * @param loops 繰り返し回数
   * @param indexVarName indexを格納する一時変数の名前。
   */
  public startForLoop(loops: number, indexVarName = "__index__"): void {
    const loopInfo: ForLoopInfo = {
      startTagPoint: this.tagPoint,
      indexVarName,
      loops,
      count: 0,
    };
    this.forLoopStack.push(loopInfo);
    this.resource.evalJs(`tv["${loopInfo.indexVarName}"] = ${loopInfo.count};`);
  }

  /**
   * forLoopの終わり
   */
  public endForLoop(): void {
    const loopInfo = this.forLoopStack[this.forLoopStack.length - 1];
    if (loopInfo == null) {
      throw new Error("予期しないendforです。forとendforの対応が取れていません");
    }

    if (++loopInfo.count < loopInfo.loops) {
      this.resource.tmpVar[loopInfo.indexVarName] = loopInfo.count;
      this.goTo(loopInfo.startTagPoint);
    } else {
      this.forLoopStack.pop();
    }
  }

  /**
   * forLoopから抜け出す
   */
  public breakForLoop(): void {
    let depth = 0;
    while (true) {
      const tag: Tag | null = this.getNextTag();
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

  public isInsideOfForLoop(): boolean {
    return this.forLoopStack.length !== 0;
  }

  // public store(tick: number): any {
  //   let data: any = {};
  //   let me: any = <any> this;
  //
  //   [
  //     "filePath",
  //     "tagPoint",
  //   ].forEach((param: string) => {
  //     data[param] = me[param];
  //   });
  //
  //   return data;
  // }
  //
  // public static createFromStoredData(resource: Resource, data: any): AsyncCallbacks {
  //   let cb = resource.loadScript(data.filePath);
  //   cb.done((script: Script) => {
  //     script.goTo(data.tagPoint);
  //   });
  //   return cb;
  // }
}
