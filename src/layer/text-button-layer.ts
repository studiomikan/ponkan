import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { FrameAnimLayer } from "./frame-anim-layer";

class TextButton extends BaseLayer {
}

export class TextButtonLayer extends FrameAnimLayer {

  protected isTextButton: boolean = false;
  protected txtBtnText: string = "";
  protected txtBtnWidth: number = 32;
  protected txtBtnHeight: number = 32;
  protected txtBtnNormalBackgroundColor: number = 0x000000;
  protected txtBtnOverBackgroundColor: number = 0x000000;
  protected txtBtnOnBackgroundColor: number = 0x000000;

  public initTextButton(
    text: string,
    width: number,
    height: number,
    normalBackgroundColor: number,
    overBackgroundColor: number,
    onBackgroundColor: number,
    normalBackgroundAlpha: number = 1.0,
    overBackgroundAlpha: number = 1.0,
    onBackgroundAlpha: number = 1.0,
  ): void {
    this.resetTextButton();
    this.isTextButton = true;

    this.txtBtnText = text;
    this.txtBtnWidth = width;
    this.txtBtnHeight = height;
    this.txtBtnNormalBackgroundColor = normalBackgroundColor;
    this.txtBtnOverBackgroundColor = overBackgroundColor;
    this.txtBtnOnBackgroundColor = onBackgroundColor;

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




}

