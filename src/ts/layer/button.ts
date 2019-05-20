import { AsyncTask } from "../base/async-task";
import { BaseLayer } from "../base/base-layer";
import { Logger } from "../base/logger";
import { PonEventHandler } from "../base/pon-event-handler";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Resource } from "../base/resource";
import { Ponkan3 } from "../ponkan3";

/**
 * TextButton、ImageButtonなどの基礎となるボタン機能
 */
export class Button extends BaseLayer {
  protected insideFlag: boolean = false;
  protected buttonStatus: "normal" | "over" | "on" | "disabled" = "disabled";
  protected jump: boolean = true;
  protected call: boolean = false;
  protected filePath: string | null = null;
  protected label: string | null = null;
  protected countPage: boolean = true;
  protected exp: string | null = null;
  protected isSystemButton: boolean = false;
  protected systemButtonLocked: boolean = false;

  public initButton(
    jump: boolean = true,
    call: boolean = false,
    filePath: string | null = null,
    label: string | null = null,
    countPage: boolean = true,
    isSystemButton: boolean = false,
    exp: string | null = null,
  ): void {
    this.insideFlag = false;
    this.jump = jump;
    this.call = call;
    this.filePath = filePath;
    this.label = label;
    this.countPage = countPage;
    this.isSystemButton = isSystemButton;
    this.exp = exp;
    this.visible = true;
  }

  public resetButton(): void {
    this.setButtonStatus("disabled");
    this.insideFlag = false;
    this.jump = true;
    this.call = false;
    this.filePath = null;
    this.label = null;
    this.exp = null;
  }

  public setButtonStatus(status: "normal" | "over" | "on" | "disabled"): void {
    const cursor: string = "auto";
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
    // if (!super.onMouseEnter(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("over");
    }
    this.insideFlag = true;
    return false;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    // if (!super.onMouseLeave(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("normal");
    }
    this.insideFlag = false;
    return false;
  }

  public onMouseMove(e: PonMouseEvent): boolean {
    // if (!super.onMouseLeave(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("over");
    }
    this.insideFlag = true;
    return false;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    // if (!super.onMouseDown(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("on");
    }
    return false;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!e.isLeft) { return true; }
    if (this.buttonStatus !== "disabled") {
      const p: Ponkan3 = this.owner as Ponkan3;
      if (this.exp !== null && this.exp !== "") {
        this.resource.evalJs(this.exp);
      }
      if (this.filePath != null || this.label != null) {
        if (this.jump) {
          p.conductor.stop();
          p.conductor.jump(this.filePath, this.label, this.countPage).done(() => {
            p.conductor.start();
          });
        } else if (this.call) {
          p.callSubroutine(this.filePath, this.label, this.countPage).done(() => {
            p.conductor.start();
          });
          p.conductor.stop();
        }
      }
      if (this.isSystemButton) {
        this.setButtonStatus("normal");
      } else {
        this.setButtonStatus("disabled");
      }
      return false;
    } else {
      return false;
    }
  }

  protected static buttonStoreParams: string[] = [
    "insideFlag",
    "buttonStatus",
    "jump",
    "call",
    "filePath",
    "label",
    "isSystemButton",
    "systemButtonLocked",
    "exp",
  ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    Button.buttonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    this.resetButton();
    super.restore(asyncTask, data, tick, clear);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    const me: any = this as any;
    Button.buttonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    this.insideFlag = false;
    this.setButtonStatus("normal");
  }

  public copyTo(dest: Button): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    Button.buttonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}
