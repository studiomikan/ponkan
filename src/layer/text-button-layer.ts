import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { FrameAnimLayer } from "./frame-anim-layer";
import { Ponkan3 } from "../ponkan3";
import { ConductorState } from "../base/conductor";

export class TextButtonLayer extends FrameAnimLayer {

  protected isTextButton: boolean = false;
  protected txtBtnInsideFlg : boolean = false;
  protected txtBtnStatus: "normal" | "over" | "on" | "disabled" = "disabled";
  protected txtBtnText: string = "";
  protected txtBtnWidth: number = 32;
  protected txtBtnHeight: number = 32;
  protected txtBtnNormalBackgroundColor: number = 0x000000;
  protected txtBtnOverBackgroundColor: number = 0x000000;
  protected txtBtnOnBackgroundColor: number = 0x000000;
  protected txtBtnNormalBackgroundAlpha: number = 1.0;
  protected txtBtnOverBackgroundAlpha: number = 1.0;
  protected txtBtnOnBackgroundAlpha: number = 1.0;
  protected txtBtnJumpFilePath: string | null = null;
  protected txtBtnCallFilePath: string | null = null;
  protected txtBtnJumpLabel: string | null = null;
  protected txtBtnCallLabel: string | null = null;
  protected txtBtnExp: string | null = null;

  public initTextButton(
    text: string,
    width: number,
    height: number,
    normalBackgroundColor: number,
    overBackgroundColor: number,
    onBackgroundColor: number,
    normalBackgroundAlpha: number,
    overBackgroundAlpha: number,
    onBackgroundAlpha: number,
    jump: string | null = null,
    call: string | null = null,
    jumpLabel: string | null = null,
    callLabel: string | null = null,
    exp: string | null = null,
  ): void {
    this.freeImage();
    this.resetTextButton();
    this.isTextButton = true;
    this.txtBtnInsideFlg = false;

    this.txtBtnText = text;
    this.txtBtnWidth = width;
    this.txtBtnHeight = height;
    this.txtBtnNormalBackgroundColor = normalBackgroundColor;
    this.txtBtnOverBackgroundColor = overBackgroundColor;
    this.txtBtnOnBackgroundColor = onBackgroundColor;
    this.txtBtnNormalBackgroundAlpha = normalBackgroundAlpha;
    this.txtBtnOverBackgroundAlpha = overBackgroundAlpha;
    this.txtBtnOnBackgroundAlpha = onBackgroundAlpha;
    this.txtBtnJumpFilePath = jump;
    this.txtBtnCallFilePath = call;
    this.txtBtnJumpLabel = jumpLabel;
    this.txtBtnCallLabel = callLabel;
    this.txtBtnExp = exp;

    this.width = width;
    this.height = height;
    this.setBackgroundColor(normalBackgroundColor, normalBackgroundAlpha);

    this.clearText();
    this.addText(text);
  }

  public resetTextButton(): void {
    if (this.isTextButton) {
      this.setTxtBtnStatus("disabled");
    }
    this.isTextButton = false;
    this.txtBtnInsideFlg = false;
    this.txtBtnStatus = "disabled";
    this.isTextButton= false;
    this.txtBtnInsideFlg = false;
    this.txtBtnStatus = "disabled";
    this.txtBtnText = "";
    this.txtBtnWidth = 32;
    this.txtBtnHeight = 32;
    this.txtBtnNormalBackgroundColor = 0x000000;
    this.txtBtnOverBackgroundColor = 0x000000;
    this.txtBtnOnBackgroundColor = 0x000000;
    this.txtBtnNormalBackgroundAlpha = 1.0;
    this.txtBtnOverBackgroundAlpha = 1.0;
    this.txtBtnOnBackgroundAlpha = 1.0;
    this.txtBtnJumpFilePath = null;
    this.txtBtnCallFilePath = null;
    this.txtBtnJumpLabel = null;
    this.txtBtnCallLabel = null;
    this.txtBtnExp = null;
  }

  public setTxtBtnStatus(status: "normal" | "over" | "on" | "disabled"): void {
    if (this.txtBtnStatus === status) { return; }

    this.txtBtnStatus = status;
    let color: number | null = null;
    let alpha: number | null = null;
    let cursor: string = "auto";
    switch (status) {
      case "normal":
      case "disabled":
        color = this.txtBtnNormalBackgroundColor;
        alpha = this.txtBtnNormalBackgroundAlpha;
        cursor = "auto";
        break;
      case "over":
        color = this.txtBtnOverBackgroundColor;
        alpha = this.txtBtnOverBackgroundAlpha;
        cursor = "pointer";
        break;
      case "on":
        color = this.txtBtnOnBackgroundColor;
        alpha = this.txtBtnOnBackgroundAlpha;
        cursor = "pointer";
        break;
    }
    if (color == null) { color = this.txtBtnNormalBackgroundColor; }
    if (alpha == null) { alpha = this.txtBtnNormalBackgroundAlpha; }
    this.setBackgroundColor(color, alpha);
    this.resource.getCanvasElm().style.cursor = cursor;
  }

  public onChangeStable(isStable: boolean): void {
    super.onChangeStable(isStable);

    if (this.isTextButton) {
      if (isStable) {
        if (this.txtBtnInsideFlg) {
          this.setTxtBtnStatus("over");
        } else {
          this.setTxtBtnStatus("normal");
        }
      } else {
        this.setTxtBtnStatus("disabled");
      }
    }
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    if (!super.onMouseEnter(e)) { return false; }

    if (this.isTextButton) {
      if (this.txtBtnStatus !== "disabled") {
        this.setTxtBtnStatus("over");
      }
      this.txtBtnInsideFlg = true;
    }
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }

    if (this.isTextButton) {
      if (this.txtBtnStatus !== "disabled") {
        this.setTxtBtnStatus("normal");
      }
      this.txtBtnInsideFlg = false;
    }
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    if (!super.onMouseDown(e)) { return false; }

    if (this.isTextButton) {
      if (this.txtBtnStatus !== "disabled") {
        this.setTxtBtnStatus("on");
      }
    }
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!super.onMouseUp(e)) { return false; }

    if (this.isTextButton && this.txtBtnStatus !== "disabled") {
      let p: Ponkan3 = this.owner as Ponkan3;
      if (this.txtBtnExp != null && this.txtBtnExp != "") {
        this.resource.evalJs(this.txtBtnExp);
      }
      if (this.txtBtnJumpFilePath != null || this.txtBtnJumpLabel != null) {
        p.conductor.stop();
        p.conductor.jump(this.txtBtnJumpFilePath, this.txtBtnJumpLabel).done(() => {
          p.conductor.start();
        });
      } else if (this.txtBtnCallFilePath != null || this.txtBtnCallLabel) {
        p.conductor.stop();
        p.conductor.callSubroutine(
          this.txtBtnCallFilePath,
          this.txtBtnCallLabel,
          false,
          -1
        ).done(() => {
          p.conductor.start();
        });
      }
      return false;
    } else {
      return true;
    }
  }

  protected static textButtonLayerStoreParams: string[] = [
    "isTextButton",
    "txtBtnInsideFlg",
    "txtBtnStatus",
    "txtBtnText",
    "txtBtnWidth",
    "txtBtnHeight",
    "txtBtnNormalBackgroundColor",
    "txtBtnOverBackgroundColor",
    "txtBtnOnBackgroundColor",
    "txtBtnNormalBackgroundAlpha",
    "txtBtnOverBackgroundAlpha",
    "txtBtnOnBackgroundAlpha",
    "txtBtnJumpFilePath",
    "txtBtnCallFilePath",
    "txtBtnJumpLabel",
    "txtBtnCallLabel",
    "txtBtnExp",
  ];

  public store(tick: number): any {
    let data: any = super.store(tick);
    let me: any = this as any;
    TextButtonLayer.textButtonLayerStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    this.resetTextButton();
    super.restore(asyncTask, data, tick);
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    let me: any = this as any;
    TextButtonLayer.textButtonLayerStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    if (data.isTextButton) {
      this.setTxtBtnStatus("normal");
      this.txtBtnInsideFlg = false;
    }
  }

}

