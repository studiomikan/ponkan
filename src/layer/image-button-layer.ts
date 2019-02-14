import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { AsyncCallbacks } from "../base/async-callbacks";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { TextButtonLayer } from "./text-button-layer";
import { Ponkan3 } from "../ponkan3";
import { ConductorState } from "../base/conductor";

export class ImageButtonLayer extends TextButtonLayer {

  protected isImageButton: boolean = false;
  protected imgBtnInsideFlg: boolean = false;
  protected imgBtnStatus: "normal" | "over" | "on" | "disabled" = "disabled";

  protected imgBtnDirection: "horizontal" | "vertical" = "horizontal";
  protected imgBtnJumpFilePath: string | null = null;
  protected imgBtnCallFilePath: string | null = null;
  protected imgBtnJumpLabel: string | null = null;
  protected imgBtnCallLabel: string | null = null;
  protected imgBtnExp: string | null = null;


  public initImageButton(
    file: string,
    direction: "horizontal" | "vertical",
    jumpfile: string,
    callfile: string,
    jumplabel: string,
    calllabel: string,
    exp: string,
  ): AsyncCallbacks {
    let cb = new AsyncCallbacks();

    this.freeImage();
    this.resetImageButton();

    this.isImageButton = true;
    this.imgBtnDirection = direction;
    this.imgBtnJumpFilePath = jumpfile;
    this.imgBtnCallFilePath = callfile;
    this.imgBtnJumpLabel = jumplabel;
    this.imgBtnCallLabel = calllabel;
    this.imgBtnExp = exp;

    this.loadImage(file).done(() => {
      if (this.imgBtnDirection === "vertical") {
        this.height = Math.floor(this.imageHeight / 3);
      } else {
        this.width = Math.floor(this.imageWidth / 3);
      }
      this.setImageButtonStatus("normal");
      cb.callDone();
    }).fail(() => {
      cb.callFail();
      throw new Error("画像の読み込みに失敗しました。");
    });


    return cb;
  }

  public resetImageButton() {
    if (this.isImageButton) {
      this.setImageButtonStatus("disabled");
    }
    this.isImageButton = false;
    this.imgBtnInsideFlg = false;
    this.imgBtnStatus = "disabled";
    this.imgBtnDirection = "horizontal";
    this.imgBtnJumpFilePath = null;
    this.imgBtnCallFilePath = null;
    this.imgBtnJumpLabel = null;
    this.imgBtnCallLabel = null;
    this.imgBtnExp = null;
  }

  public setImageButtonStatus(status: "normal" | "over" | "on" | "disabled") {
    if (this.imgBtnStatus === status) { return; }

    this.imgBtnStatus = status;
    let cursor: string = "auto";
    if (this.imgBtnDirection === "vertical") {
      switch (status) {
        case "normal":
        case "disabled":
          this.imageY = 0;
          cursor = "auto";
          break;
        case "over":
          this.imageY = -Math.floor(this.imageHeight / 3);
          cursor = "pointer";
          break;
        case "on":
          this.imageY = -Math.floor(this.imageHeight / 3 * 2);
          cursor = "pointer";
          break;
      }
    } else {
      switch (status) {
        case "normal":
        case "disabled":
          this.imageX = 0;
          cursor = "auto";
          break;
        case "over":
          this.imageX = -Math.floor(this.imageWidth / 3);
          cursor = "pointer";
          break;
        case "on":
          this.imageX = -Math.floor(this.imageWidth / 3 * 2);
          cursor = "pointer";
          break;
      }
    }
    this.resource.getCanvasElm().style.cursor = cursor;
  }

  public onChangeStable(isStable: boolean): void {
    super.onChangeStable(isStable);

    if (this.isImageButton) {
      if (isStable) {
        if (this.imgBtnInsideFlg) {
          this.setImageButtonStatus("over");
        } else {
          this.setImageButtonStatus("normal");
        }
      } else {
        this.setImageButtonStatus("disabled");
      }
    }
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    if (!super.onMouseEnter(e)) { return false; }

    if (this.isImageButton) {
      if (this.imgBtnStatus !== "disabled") {
        this.setImageButtonStatus("over");
      }
      this.imgBtnInsideFlg = true;
    }
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }

    if (this.isImageButton) {
      if (this.imgBtnStatus !== "disabled") {
        this.setImageButtonStatus("normal");
      }
      this.imgBtnInsideFlg = false;
    }
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    if (!super.onMouseDown(e)) { return false; }

    if (this.isImageButton) {
      if (this.imgBtnStatus !== "disabled") {
        this.setImageButtonStatus("on");
      }
    }
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!super.onMouseUp(e)) { return false; }

    if (this.isImageButton && this.imgBtnStatus !== "disabled") {
      let p: Ponkan3 = this.owner as Ponkan3;
      if (this.imgBtnExp != null && this.imgBtnExp != "") {
        this.resource.evalJs(this.imgBtnExp);
      }
      if (this.imgBtnJumpFilePath != null || this.imgBtnJumpLabel != null) {
        p.conductor.stop();
        p.conductor.jump(this.imgBtnJumpFilePath, this.imgBtnJumpLabel).done(() => {
          p.conductor.start();
        });
      } else if (this.imgBtnCallFilePath != null || this.imgBtnCallLabel) {
        p.conductor.stop();
        p.conductor.callSubroutine(
          this.imgBtnCallFilePath,
          this.imgBtnCallLabel,
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



}

