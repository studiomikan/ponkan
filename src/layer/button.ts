import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Ponkan3 } from "../ponkan3";

/**
 * TextButton、ImageButtonなどの基礎となるボタン機能
 */
export class Button extends BaseLayer {
  protected insideFlg : boolean = false;
  protected buttonStatus: "normal" | "over" | "on" | "disabled" = "disabled";
  protected jumpFilePath: string | null = null;
  protected callFilePath: string | null = null;
  protected jumpLabel: string | null = null;
  protected callLabel: string | null = null;
  protected exp: string | null = null;

  public initButton(
    jumpFilePath: string | null = null,
    callFilePath: string | null = null,
    jumpLabel: string | null = null,
    callLabel: string | null = null,
    exp: string | null = null,
  ): void {
    this.insideFlg = false;
    this.jumpFilePath = jumpFilePath;
    this.callFilePath = callFilePath;
    this.jumpLabel = jumpLabel;
    this.callLabel = callLabel;
    this.exp = exp;
  }

  public resetButton(): void {
    this.setButtonStatus("disabled");
    this.insideFlg = false;
    this.jumpFilePath = null;
    this.callFilePath = null;
    this.jumpLabel = null;
    this.callLabel = null;
    this.exp = null;
  }

  public setButtonStatus(status: "normal" | "over" | "on" | "disabled"): void {
    this.buttonStatus = status;
    let cursor: string = "auto";
    switch (status) {
      case "normal": case "disabled":
        cursor = "auto";
        break;
      case "over":
        cursor = "pointer";
        break;
      case "on":
        cursor = "pointer";
        break;
    }
    this.resource.getCanvasElm().style.cursor = cursor;
  }

  public onChangeStable(isStable: boolean): void {
    super.onChangeStable(isStable);
    if (isStable) {
      if (this.insideFlg) {
        this.setButtonStatus("over");
      } else {
        this.setButtonStatus("normal");
      }
    } else {
      this.setButtonStatus("disabled");
    }
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    if (!super.onMouseEnter(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("over");
    }
    this.insideFlg = true;
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("normal");
    }
    this.insideFlg = false;
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    if (!super.onMouseDown(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("on");
    }
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!super.onMouseUp(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      let p: Ponkan3 = this.owner as Ponkan3;
      if (this.exp != null && this.exp != "") {
        this.resource.evalJs(this.exp);
      }
      if (this.jumpFilePath != null || this.jumpLabel != null) {
        p.conductor.stop();
        p.conductor.jump(this.jumpFilePath, this.jumpLabel).done(() => {
          p.conductor.start();
        });
      } else if (this.callFilePath != null || this.callLabel) {
        p.conductor.stop();
        p.conductor.callSubroutine(this.callFilePath, this.callLabel, false, -1).done(() => {
          p.conductor.start();
        });
      }
      return false;
    } else {
      return true;
    }
  }

  protected static buttonStoreParams: string[] = [
    "insideFlg",
    "buttonStatus",
    "jumpFilePath",
    "callFilePath",
    "jumpLabel",
    "callLabel",
    "exp"
  ];

  public store(tick: number): any {
    let data: any = super.store(tick);
    let me: any = this as any;
    Button.buttonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    this.resetButton();
    super.restore(asyncTask, data, tick);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    let me: any = this as any;
    Button.buttonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    
    this.insideFlg = false;
    this.setButtonStatus("normal");
  }
}

