import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { PonEventHandler } from "../base/pon-event-handler";
import { Ponkan3 } from "../ponkan3";

/**
 * TextButton、ImageButtonなどの基礎となるボタン機能
 */
export class Button extends BaseLayer {
  protected insideFlag : boolean = false;
  protected buttonStatus: "normal" | "over" | "on" | "disabled" = "disabled";
  protected jumpFilePath: string | null = null;
  protected callFilePath: string | null = null;
  protected jumpLabel: string | null = null;
  protected callLabel: string | null = null;
  protected countPage: boolean = true;
  protected exp: string | null = null;
  protected isSystemButton: boolean = false;
  protected systemButtonLocked: boolean = false;

  public initButton(
    jumpFilePath: string | null = null,
    callFilePath: string | null = null,
    jumpLabel: string | null = null,
    callLabel: string | null = null,
    countPage: boolean = true,
    isSystemButton: boolean = false,
    exp: string | null = null,
  ): void {
    this.insideFlag = false;
    this.jumpFilePath = jumpFilePath;
    this.callFilePath = callFilePath;
    this.jumpLabel = jumpLabel;
    this.callLabel = callLabel;
    this.countPage = countPage;
    this.isSystemButton = isSystemButton;
    this.exp = exp;
    this.visible = true;
  }

  public resetButton(): void {
    this.setButtonStatus("disabled");
    this.insideFlag = false;
    this.jumpFilePath = null;
    this.callFilePath = null;
    this.jumpLabel = null;
    this.callLabel = null;
    this.exp = null;
  }

  public setButtonStatus(status: "normal" | "over" | "on" | "disabled"): void {
    let cursor: string = "auto";
    if (this.isSystemButton && this.systemButtonLocked) {
      this.buttonStatus = "disabled";
    } else {
      this.buttonStatus = status;
    }
    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor[status];
  }

  public lockSystemButton(): void {
    if (this.isSystemButton) {
      this.systemButtonLocked = true;
      this.setButtonStatus("disabled");
    }
  }

  public unlockSystemButton(): void {
    if (this.isSystemButton) {
      this.systemButtonLocked = false;
      this.setButtonStatus("normal");
    }
  }

  public onChangeStable(isStable: boolean): void {
    super.onChangeStable(isStable);
    if (!this.isSystemButton) { return; }
    if (this.systemButtonLocked) { return; }
    if (isStable) {
      if (this.insideFlag) {
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
    this.insideFlag = true;
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("normal");
    }
    this.insideFlag = false;
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
      // TODO ボタン動作時、スキップとオートを止める
      if (this.exp !== null && this.exp !== "") {
        this.resource.evalJs(this.exp);
      }
      if (this.jumpFilePath != null || this.jumpLabel != null) {
        p.conductor.stop();
        p.conductor.jump(this.jumpFilePath, this.jumpLabel, this.countPage).done(() => {
          p.conductor.start();
        });
      } else if (this.callFilePath != null || this.callLabel != null) {
        // ボタンによるcall時はイベントハンドラもスタックしておく
        p.conductor.pushEventHandlers();
        p.conductor.addEventHandler(
          new PonEventHandler("return_subroutin", () => {
            p.conductor.popEventHandlers();
          }, "button_call"));
        // callする
        p.conductor.stop();
        p.conductor.callSubroutine(this.callFilePath, this.callLabel, this.countPage, false, 0).done(() => {
          p.conductor.start();
        });
      }
      if (!this.isSystemButton) {
        this.setButtonStatus("disabled");
      }
      return false;
    } else {
      return true;
    }
  }

  protected static buttonStoreParams: string[] = [
    "insideFlag",
    "buttonStatus",
    "jumpFilePath",
    "callFilePath",
    "jumpLabel",
    "callLabel",
    "isSystemButton",
    "systemButtonLocked",
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

    this.insideFlag = false;
    this.setButtonStatus("normal");
  }

  public copyTo(dest: Button): void {
    super.copyTo(dest);

    let me: any = this as any;
    let you: any = dest as any;
    Button.buttonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}
