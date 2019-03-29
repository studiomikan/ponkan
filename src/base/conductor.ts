import { AsyncTask } from "./async-task";
import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { Resource } from "./resource";
import { Script } from "./script";
import { Tag } from "./tag";
import { Macro } from "./macro";
import { ReadUnread } from "./read-unread";
import { PonEventHandler } from "./pon-event-handler";

export interface IConductorEvent {
  onLabel(labelName: string, line: number, tick: number): "continue" | "break";
  onSaveMark(saveMarkName:string, comment: string, line: number, tick: number): "continue" | "break";
  onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break";
  onTag(tag: Tag, line: number, tick: number): "continue" | "break";
  onChangeStable(isStable: boolean): void;
  onError(e: any): void;
}

export enum ConductorState {
  Stop = 0,
  Run,
  Sleep,
}

export class Conductor {
  protected resource: Resource;
  public readonly name: string;
  protected eventCallbacks: IConductorEvent;
  public latestScriptFilePath: string = ""; // パースエラー時のメッセージ用
  protected _script: Script;
  public get script(): Script { return this._script; }
  protected _status: ConductorState = ConductorState.Stop;
  public get status(): ConductorState { return this._status; }

  protected sleepStartTick: number = -1;
  protected sleepTime: number = -1;
  public sleepSender: string = "";
  protected stableBuffer: boolean = false;

  protected eventHandlers: any = {};
  protected eventHandlersStack: Array<any> = [];

  public latestSaveMarkName: string = "";
  public readUnread: ReadUnread;

  public constructor(resource: Resource, name: string, eventCallbacks: IConductorEvent) {
    this.resource = resource;
    this.name = name;
    this.eventCallbacks = eventCallbacks;
    this._script = new Script(this.resource, "__dummy__", ";s");
    this.readUnread = new ReadUnread(this.resource);
  }

  public loadScript(filePath: string): AsyncCallbacks {
    this.latestScriptFilePath = filePath;
    const cb = new AsyncCallbacks();
    this.resource.loadScript(filePath).done((script: Script) => {
      this._script = script;
      cb.callDone(filePath);
    }).fail((e: any) => {
      this.eventCallbacks.onError(e);
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
   * @param countPage 既読処理をするかどうか
   */
  public jump(filePath: string | null, label: string | null = null, countPage: boolean = true): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    if (countPage) {
      this.passLatestSaveMark();
      this.latestSaveMarkName = "";
    }
    if (filePath != null && filePath != "") {
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

  public isPassed(labelName: string): boolean {
    return this.readUnread.isPassed(this.script, labelName);
  }

  public isPassedLatestSaveMark(): boolean {
    return this.isPassed(this.latestSaveMarkName);
  }

  public passSaveMark(saveMarkName: string): void {
    this.readUnread.pass(this.script, saveMarkName);
  }

  public passLatestSaveMark(): void {
    this.passSaveMark(this.latestSaveMarkName);
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

    this.callOnChangeStable();
    while (true) {
      let tag: Tag | null = this.script.getNextTag();
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
          this.passLatestSaveMark();
          this.latestSaveMarkName = tag.values.name;
          tagReturnValue = this.eventCallbacks.onSaveMark(
            tag.values.name, tag.values.comment, tag.line, tick);
          break;
        case "__js__":
          tagReturnValue = this.eventCallbacks.onJs(tag.values.__body__, tag.values.print, tag.line, tick);
          break;
        default:
          tagReturnValue = this.eventCallbacks.onTag(tag, tag.line, tick);
          break;
      }

      if (tagReturnValue === "break") { break; }
      if (this.status !== ConductorState.Run) { break; }
    }
    this.callOnChangeStable();
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

  private callOnChangeStable(): void {
    if (this.stableBuffer !== this.isStable) {
      this.eventCallbacks.onChangeStable(this.isStable);
    }
    this.stableBuffer = this.isStable;
  }

  public start(): "continue" | "break" {
    this._status = ConductorState.Run;
    this.sleepTime = -1;
    this.sleepStartTick = -1;
    this.sleepSender = "";
    Logger.debug(`Conductor start. (${this.name})`);
    return "continue"
  }

  public stop(): "continue" | "break" {
    this._status = ConductorState.Stop;
    Logger.debug(`Conductor stop. (${this.name})`);
    return "break"
  }

  public sleep(tick: number, sleepTime: number, sender: string): "continue" | "break"  {
    this._status = ConductorState.Sleep;
    this.sleepStartTick = tick;
    this.sleepTime = sleepTime;
    this.sleepSender = sender;
    Logger.debug(`Conductor sleep. (${this.name})`, sleepTime, sender);
    return "break"
  }

  public get isStable(): boolean {
    return this._status === ConductorState.Stop &&
           !this.hasEventHandler("move") &&
           !this.hasEventHandler("trans") &&
           !this.hasEventHandler("frameanim") &&
           !this.hasEventHandler("soundstop") &&
           !this.hasEventHandler("soundfade");
  }

  public addEventHandler(handler: PonEventHandler): void {
    let eventName: string = handler.eventName;
    if (this.eventHandlers[eventName] == null) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
  }

  public hasEventHandler(eventName: string): boolean {
    return this.eventHandlers[eventName] != null;
  }

  /**
   * イベントハンドラの引き金を引く
   * @param eventName イベント名
   * @return イベントハンドラが1つ以上実行されればtrue
   */
  public trigger(eventName: string): boolean {
    let handlers: PonEventHandler[] = this.eventHandlers[eventName];
    if (handlers == null) { return false; }
    this.clearEventHandlerByName(eventName);
    handlers.forEach((h) => {
      Logger.debug("FIRE! ", eventName, h);
      h.fire();
    });
    return true;
  }

  public clearAllEventHandler(): void {
    this.eventHandlers = {};
  }

  public clearEventHandler(eventHandler: PonEventHandler): void {
    Object.keys(this.eventHandlers).forEach((eventName) => {
      this.eventHandlers[eventName].forEach((eventHandler: PonEventHandler, index: number) => {
        if (eventHandler === eventHandler) {
          this.eventHandlers[eventName].splice(index, 1);
          return;
        }
      });
    });
  }

  public clearEventHandlerByName(eventName: string): void {
    delete this.eventHandlers[eventName];
  }

  // public pushEventHandlers(): void {
  //   this.eventHandlersStack.push(this.eventHandlers);
  //   this.eventHandlers = {};
  // }
  //
  // public popEventHandlers(): void {
  //   if (this.eventHandlersStack.length === 0) {
  //     throw new Error("Engine Error. eventHandlerStackの不正操作");
  //   }
  //   this.eventHandlers = this.eventHandlersStack.pop();
  // }

  protected static conductorStoreParams = [
    "_status",
    "sleepStartTick",
    "sleepTime",
    "sleepSender",
  ];

  public store(saveMarkName: string, tick: number): any {
    let data: any = {};
    let me: any = <any> this;

    Conductor.conductorStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });

    data.scriptFilePath = this.script.filePath;
    data.saveMarkName = saveMarkName;

    // if (this.callStack.length !== 0) {
    //   throw new Error("サブルーチンの呼び出し中にセーブすることはできません");
    // }
    if (this.script.isInsideOfMacro()) {
      throw new Error("マクロの中でセーブすることはできません");
    }
    if (this.script.isInsideOfForLoop()) {
      throw new Error("for〜endforの中でセーブすることはできません");
    }
    if (this.script.isInsideOfIf()) {
      throw new Error("if〜endifの中でセーブすることはできません");
    }

    return data;
  }

  /**
   * 復元。ステータスの値は復元されるが、再スタートなどはしないので注意。
   */
  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    let me: any = this as any;
    Conductor.conductorStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    // script
    asyncTask.add((params: any, index: number): AsyncCallbacks => {
      let cb = this.loadScript(data.scriptFilePath);
      cb.done(() => {
        this.script.goToSaveMark(data.saveMarkName);
      });
      return cb;
    });
  }

}
