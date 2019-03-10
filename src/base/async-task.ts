import { Logger } from "./logger";
import { AsyncCallbacks } from "./async-callbacks";

export class AsyncTask {
  private tasks: ((params: any, index: number) => AsyncCallbacks)[] = [];
  private completeCallbacks: AsyncCallbacks = new AsyncCallbacks();
  private completeCount: number = 0; 
  private _status: "new" | "run" | "abort" | "done" | "fail" = "new";

  public get status(): "new" | "run" | "abort" | "done" | "fail" { return this._status; }

  constructor() {
  }

  public get count(): number { return this.tasks.length; }

  public add(task: (params: any, index: number) => AsyncCallbacks): void {
    this.tasks.push(task);
  }

  public run(params: any = null): AsyncCallbacks {
    if (this._status !== "new") {
      Logger.error(this);
      throw new Error("タスクが重複して実行されました");
    }
    if (this.tasks.length == 0) {
      // 擬似的に非同期のタスクを用意して実行
      setTimeout(() => {
        this.onTaskDone(0);
      }, 0);
    } else {
      this._status = "run";
      this.tasks.forEach((task, index: number) => {
        task(index, params).done((data) => {
          this.onTaskDone(index);
        }).fail(() => {
          this.onTaskFailed(index);
        });
      });
    }
    return this.completeCallbacks;
  }

  public abort(): void {
    this._status = "abort";
    this.completeCallbacks.callFail(this);
  }

  private onTaskDone(index: number): void {
    this.completeCount++;
    if (this.completeCount >= this.tasks.length) {
      this._status = "done";
      this.completeCallbacks.callDone(this);
    }
  }

  private onTaskFailed(index: number): void {
    this._status = "fail";
    this.completeCallbacks.callFail(this);
  }

}
