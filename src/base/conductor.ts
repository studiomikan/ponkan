import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { Resource } from "./resource";
import { Script } from "./script";
import { Tag } from "./tag";
import { Macro } from "./macro";

export interface IConductorEvent {
  onLabel(labelName: string, line: number, tick: number): "continue" | "break";
  onSaveMark(saveComment: string, line: number, tick: number): "continue" | "break";
  onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break";
  onTag(tag: Tag, line: number, tick: number): "continue" | "break";
}

export interface ICallStackNode {
  script: Script;
}

export interface IMacroStackNode {
  macro: Macro;
  args: any;
}

export enum ConductorState {
  Stop = 0,
  Run,
  Sleep,
}

export class Conductor {
  protected resource: Resource;
  protected eventCallbacks: IConductorEvent;
  protected _script: Script;
  public get script(): Script { return this._script; }
  protected _status: ConductorState = ConductorState.Stop;
  public get status(): ConductorState { return this._status; }

  protected sleepStartTick: number = -1;
  protected sleepTime: number = -1;

  protected callStack: ICallStackNode[] = [];
  protected macroStack: IMacroStackNode[] = [];

  public constructor(resource: Resource, eventCallbacks: IConductorEvent) {
    this.resource = resource;
    this.eventCallbacks = eventCallbacks;
    this._script = new Script(this.resource, "dummy", ";s");
  }

  public loadScript(filePath: string): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    this.resource.loadScript(filePath).done((script: Script) => {
      this._script = script;
      cb.callDone(filePath);
    }).fail(() => {
      cb.callFail(filePath);
    });
    return cb;
  }

  /**
   * 指定のファイル・ラベルの位置へ移動する。
   * ラベルが省略されたときは、ファイルの先頭となる。
   * ファイルが省略されたときは、現在のファイル内でラベル移動のみ行う。
   * @param file 移動先ファイル
   * @param label 移動先ラベル
   */
  public jump(filePath: string | null, label: string | null = null): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    if (filePath != null) {
      this.loadScript(filePath).done(() => {
        if (label != null) {
          this.script.goToLabel(label);
        }
        cb.callDone({filePath: filePath, label: label});
      }).fail(() => {
        cb.callFail({filePath: filePath, label: label});
      });
    } else if (label != null) {
      window.setTimeout(() => {
        this.script.goToLabel(label);
        cb.callDone({filePath: filePath, label: label});
      }, 0);
    }
    return cb;
  }

  /**
   * サブルーチンを呼び出す
   * @param file 移動先ファイル
   * @param label 移動先ラベル
   */
  public callSubroutine(filePath: string | null, label: string | null = null): AsyncCallbacks {
    this.callStack.push({ script: this.script });
    return this.jump(filePath, label);
  }

  /**
   * サブルーチンから戻る
   */
  public returnSubroutine() {
    let stackData = this.callStack.pop();
    if (stackData === undefined) {
      throw new Error("returnで戻れませんでした。callとreturnの対応が取れていません");
    }
    this._script = stackData.script;
  }

  public conduct(tick: number): void {
    if (this.status === ConductorState.Stop) { return; }

    // スリープ処理
    // スリープ中ならretur、終了していたときは後続処理へ進む
    if (this.status === ConductorState.Sleep) {
      const elapsed: number = tick - this.sleepStartTick;
      if (elapsed < this.sleepTime) {
        return;
      } else {
        this.start();
      }
    }

    while (true) {
      let tag: Tag | null = this.getNextTag();
      if (tag == null) {
        this.stop();
        return;
      } else {
        tag = tag.clone();
      }

      let tagReturnValue: "continue" | "break";
      switch (tag.name) {
        case "__label__":
          tagReturnValue = this.eventCallbacks.onLabel(tag.values.__body__, tag.line, tick);
          break;
        case "__save_mark__":
          tagReturnValue = this.eventCallbacks.onSaveMark(tag.values.__body__, tag.line, tick);
          break;
        case "__js__":
          tagReturnValue = this.eventCallbacks.onJs(tag.values.__body__, tag.values.print, tag.line, tick);
          break;
        default:
          if (this.resource.hasMacro(tag.name)) {
            // マクロ呼び出し
            tagReturnValue = "continue";
            let macro: Macro = this.resource.getMacro(tag.name).clone();
            macro.resetTagPoint();
            this.resource.setMacroParams(tag.values);
            this.macroStack.push({
              macro: macro,
              args: tag.values
            });
          } else {
            tagReturnValue = this.eventCallbacks.onTag(tag, tag.line, tick);
          }
          break;
      }

      if (tagReturnValue === "break") { break; }
    }
  }

  private applyJsEntity(values: any): void {
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        const value: string = "" + values[key] as string;
        if (value.indexOf("&") === 0 && value.length >= 2) {
          const js: string = value.substring(1);
          values[key] = this.resource.evalJs(js);
        }
      }
    }
  }

  public getNextTag(): Tag | null {
    if (this.macroStack.length == 0) {
      this.resource.resetMacroParams();
      return this.script.getNextTag();
    } else {
      let info: IMacroStackNode = this.macroStack[this.macroStack.length - 1];
      let tag: Tag | null = info.macro.getNextTag();
      if (tag != null) {
        return tag;
      } else {
        this.macroStack.pop();
        return this.getNextTag();
      }
    }
  }

  public start(): "continue" | "break" {
    this._status = ConductorState.Run;
    this.sleepTime = -1;
    this.sleepStartTick = -1;
    Logger.debug("Conductor start.");
    return "continue"
  }

  public stop(): "continue" | "break" {
    this._status = ConductorState.Stop;
    Logger.debug("Conductor stop.");
    return "break"
  }

  public sleep(tick: number, sleepTime: number): "continue" | "break"  {
    this._status = ConductorState.Sleep;
    this.sleepStartTick = tick;
    this.sleepTime = sleepTime;
    Logger.debug("Conductor sleep.", sleepTime);
    return "break"
  }

}
