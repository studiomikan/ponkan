import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { FrameAnimLayer } from "./frame-anim-layer";
import { Ponkan3 } from "../ponkan3";
import { ConductorState } from "../base/conductor";

class TextButton extends BaseLayer {
}

export class TextButtonLayer extends FrameAnimLayer {

  protected isTextButton: boolean = false;
  protected txtBtnInsideFlg : boolean = false;
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
    this.isTextButton = false;
  }

  // TODO マウスオーバー時などの処理
  public onMouseEnter(e: PonMouseEvent): boolean {
    if (!super.onMouseEnter(e)) { return false; }

    if (this.isTextButton) {
      let color = this.txtBtnOverBackgroundColor;
      let alpha = this.txtBtnOverBackgroundAlpha;
      if (color == null) { color = this.txtBtnNormalBackgroundColor; }
      if (alpha == null) { alpha = this.txtBtnNormalBackgroundAlpha; }
      this.setBackgroundColor(color, alpha);
      this.resource.getCanvasElm().style.cursor = "pointer";
      this.txtBtnInsideFlg = true;
    }
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }

    if (this.isTextButton) {
      let color = this.txtBtnNormalBackgroundColor;
      let alpha = this.txtBtnNormalBackgroundAlpha;
      this.setBackgroundColor(color, alpha);
      this.resource.getCanvasElm().style.cursor = "default";
      this.txtBtnInsideFlg = false;
    }
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    if (!super.onMouseDown(e)) { return false; }

    if (this.isTextButton) {
      let color = this.txtBtnOnBackgroundColor;
      let alpha = this.txtBtnOnBackgroundAlpha;
      if (color == null) { color = this.txtBtnNormalBackgroundColor; }
      if (alpha == null) { alpha = this.txtBtnNormalBackgroundAlpha; }
      this.setBackgroundColor(color, alpha);
      this.resource.getCanvasElm().style.cursor = "pointer";
    }
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!super.onMouseUp(e)) { return false; }

    if (this.isTextButton) {
      if (this.txtBtnExp != null && this.txtBtnExp != "") {
        this.resource.evalJs(this.txtBtnExp);
      }
      let p: Ponkan3 = this.owner as Ponkan3;
      let isStable: boolean = p.conductor.isStable;
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


}

