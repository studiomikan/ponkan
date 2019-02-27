import { AsyncTask } from "./async-task";
import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { Resource } from "./resource";
import { Script } from "./script";
import { Tag } from "./tag";
import { Macro } from "./macro";

export interface IConductorEvent {
  onLabel(labelName: string, line: number, tick: number): "continue" | "break";
  onSaveMark(saveMarkName:string, comment: string, line: number, tick: number): "continue" | "break";
  onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break";
  onTag(tag: Tag, line: number, tick: number): "continue" | "break";
  onChangeStable(isStable: boolean): void;
  onReturnSubroutin(forceStart: boolean): void;
}

export interface ICallStackNode {
  script: Script;
  point: number;
  continueConduct: boolean
  returnOffset: number 
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

  /**
   * サブルーチンを呼び出す
   * @param file 移動先ファイル
   * @param label 移動先ラベル
   * @param statusAtReturn return時に状態を復元する場合は値を設定。未設定時はRunのまま
   */
  public callSubroutine(
    filePath: string | null,
    label: string | null = null,
    continueConduct: boolean = true,
    returnOffset: number = 0
  ): AsyncCallbacks {
    this.callStack.push({
      script: this.script,
      point: this.script.getPoint(),
      continueConduct: continueConduct,
      returnOffset: returnOffset
    });
    return this.jump(filePath, label);
  }

  /**
   * サブルーチンから戻る
   * @param forceStart 強制的にpb, lb, waitclickを終わらせるかどうか
   */
  public returnSubroutine(forceStart: boolean = false): "continue" | "break" {
    let stackData = this.callStack.pop();
    if (stackData === undefined) {
      throw new Error("returnで戻れませんでした。callとreturnの対応が取れていません");
    }
    this._script = stackData.script;
    this._script.goTo(stackData.point + stackData.returnOffset);
    if (stackData.continueConduct) {
      this.eventCallbacks.onReturnSubroutin(forceStart);
      return "continue";
    } else {
      this.stop();
      this.eventCallbacks.onReturnSubroutin(forceStart);
      return "break";
    }
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
    this.eventCallbacks.onChangeStable(this.isStable);
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

  public get isStable(): boolean {
    return this._status === ConductorState.Stop;
  }

  protected static conductorStoreParams = [
    "_status",
    "sleepStartTick",
    "sleepTime",
  ];

  public store(saveMarkName: string, tick: number): any {
    let data: any = {};
    let me: any = <any> this;

    Conductor.conductorStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });

    data.scriptFilePath = this.script.filePath;
    data.saveMarkName = saveMarkName;

    if (this.callStack.length !== 0) {
      throw new Error("サブルーチンの呼び出し中にセーブすることはできません");
    }
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
