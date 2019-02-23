import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Ponkan3 } from "../ponkan3";

/**
 * トグルボタン機能
 */
export class ToggleButton extends BaseLayer {
  protected insideFlag : boolean = false;
  protected buttonStatus: "enabled" | "disabled" = "disabled";
  protected varName: string = "toggle-button-value";
  protected exp: string | null = null;

  public initToggleButton(varName: string, exp: string | null): void {
    this.insideFlag = false;
    this.varName = varName;
    this.exp = exp;
    this.setButtonStatus("disabled");
    this.setValue(this.getValue());
  }

  public resetToggleButton(): void {
    this.setButtonStatus("disabled");
    this.insideFlag = false;
    this.varName = "toggle-button-value";
    this.exp = null;
  }

  public setButtonStatus(status: "enabled" | "disabled"): void {
    this.buttonStatus = status;

    if (status === "enabled" && this.insideFlag) {
      this.resource.getForeCanvasElm().style.cursor = "pointer";
    } else {
      this.resource.getForeCanvasElm().style.cursor = "auto";
    }
  }

  public setValue(value: boolean): void {
    this.resource.tmpVar[this.varName] = value;
  }

  public getValue(): boolean {
    return this.resource.tmpVar[this.varName];
  }

  public onChangeStable(isStable: boolean): void {
    super.onChangeStable(isStable);
    if (isStable) {
      this.setButtonStatus("enabled");
    } else {
      this.setButtonStatus("disabled");
    }
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    if (!super.onMouseEnter(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.resource.getForeCanvasElm().style.cursor = "pointer";
    }
    this.insideFlag = true;
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.resource.getForeCanvasElm().style.cursor = "auto";
    }
    this.insideFlag = false;
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    if (!super.onMouseDown(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.resource.getForeCanvasElm().style.cursor = "pointer";
    }
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!super.onMouseUp(e)) { return false; }
    if (this.buttonStatus !== "disabled") {
      this.setValue(!this.getValue());
      if (this.exp !== null && this.exp !== "") {
        this.resource.evalJs(this.exp);
      }
      return false;
    } else {
      return true;
    }
  }

  protected static toggleButtonStoreParams: string[] = [
    "insideFlag",
    "buttonStatus",
    "varName",
    "exp",
  ];

  public store(tick: number): any {
    let data: any = super.store(tick);
    let me: any = this as any;
    ToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    this.resetToggleButton();
    super.restore(asyncTask, data, tick);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    let me: any = this as any;
    ToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    this.insideFlag = false;
    this.setButtonStatus(data["buttonStatus"]);
    this.setValue(this.getValue());
  }

  public copyTo(dest: ToggleButton): void {
    super.copyTo(dest);

    let me: any = this as any;
    let you: any = dest as any;
    ToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}
