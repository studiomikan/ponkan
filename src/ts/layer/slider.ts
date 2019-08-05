import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { BaseLayer } from "../base/base-layer";
import { PonGame } from "../base/pon-game";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Resource } from "../base/resource";
import { Ponkan3 } from "../ponkan3";
import { ImageButton } from "./image-button-layer";
import { ToggleButtonLayer } from "./toggle-button-layer";
import { timingSafeEqual } from "crypto";

export class SliderButton extends ImageButton {
  private callback: any;

  public setCallback(callback: any): void {
    this.callback = callback;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    super.onMouseDown(e);
    this.callback.onMouseDown(e);
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    super.onMouseUp(e);
    this.callback.onMouseUp(e);
    return true;
  }

  public onMouseMove(e: PonMouseEvent): boolean {
    super.onMouseMove(e);
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    super.onMouseLeave(e);
    this.callback.onMouseLeave(e);
    return true;
  }

}

/**
 * スライダー
 */
export class Slider extends BaseLayer {
  protected foreImage: BaseLayer;
  protected button: SliderButton;
  protected locked: boolean = false;
  protected value: number = 0;
  protected down: boolean = false;

  constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.foreImage = new BaseLayer("slider fore", resource, owner);
    this.addChild(this.foreImage);
    this.button = new SliderButton("slider button", resource, owner);
    this.addChild(this.button);
    this.button.setCallback({
      onMouseDown: (e: PonMouseEvent) => { this.onButtonDown(e); },
      onMouseUp: (e: PonMouseEvent) => { this.onButtonUp(e); },
      onMouseLeave: (e: PonMouseEvent) => { this.onButtonLeave(e); },
    });
  }

  public initSlider(
    value: number,
    backImagePath: string,
    foreImagePath: string,
    buttonImagePath: string,
  ): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    const task = new AsyncTask();

    this.resetSlider();

    if (value < 0.0) { value = 0.0; }
    if (value > 1.0) { value = 1.0; }
    this.value = value;

    // 背景画像読み込み
    task.add((params: any, index: number): AsyncCallbacks => {
      return this.loadImage(backImagePath);
    });
    // 前景画像読み込み
    task.add((params: any, index: number): AsyncCallbacks => {
      const foreImage = this.foreImage;
      const foreImageCb = foreImage.loadImage(foreImagePath);
      foreImageCb.done(() => {
        foreImage.x = 0;
        foreImage.y = 0;
        foreImage.visible = true;
      });
      return foreImageCb;
    });
    // ボタン読み込み
    task.add((params: any, index: number): AsyncCallbacks => {
      const button = this.button;
      const buttonCb = button.initImageButton(
        false,           // jump: boolean = true,
        false,           // call: boolean = false,
        null,            // filePath: string | null = null,
        null,            // label: string | null = null,
        true,            // countPage: boolean = true,
        true,           // isSystemButton: boolean = false,
        "",      // exp: string | null = null,
        buttonImagePath, // file: string,
        "horizontal",    // direction: "horizontal" | "vertical",
        "",              // onEnterSoundBuf: string,
        "",              // onLeaveSoundBuf: string,
        "",              // onClickSoundBuf: string,
      );
      buttonCb.done(() => {
        button.x = 0;
        button.y = 0;
        button.visible = true;
        button.setButtonStatus("normal");
      });
      return buttonCb;
    });

    return task.run().done(() => {
      const x = this.value * (this.width - this.button.width);
      this.foreImage.width = x;
      this.button.x = x;
      this.visible = true;
    });
  }

  public resetSlider(): void {
    this.freeImage();
    this.value = 0;
    this.down = false;

    this.foreImage.freeImage();
    this.foreImage.visible = false;

    this.button.resetButton();
    this.button.freeImage();
    this.button.visible = false;
  }

  public lock(): void {
    this.locked = true;
  }

  public unlock(): void {
    this.locked = false;
  }

  public setValueX(x: number): void {
    this.foreImage.width = x - this.button.width / 2;
    this.button.x = x - this.button.width / 2;
    this.value = x / (this.width - this.button.width);
    if (this.value < 0.0) { this.value = 0.0; }
    if (this.value > 1.0) { this.value = 1.0; }
  }

  public onButtonDown(e: PonMouseEvent) {
    this.down = true;
    console.log("onButtonDown", this.down);
  }

  public onButtonUp(e: PonMouseEvent) {
    this.down = false;
    console.log("onButtonUp", this.down);
  }

  public onButtonLeave(e: PonMouseEvent) {
    // this.down = false;
    console.log("onButtonLeave");
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    if (!super.onMouseDown(e)) { return false; }
    this.down = true;
    this.setValueX(e.x);
    return false;
  }

  public onMouseMove(e: PonMouseEvent): boolean {
    if (!super.onMouseMove(e)) { return false; }
    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.over;
    console.log("down:", this.down);
    if (this.down) {
      this.setValueX(e.x);
    }
    return false;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (!super.onMouseUp(e)) { return false; }
    // this.down = false;
    return false;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    if (!super.onMouseLeave(e)) { return false; }
    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
    this.down = false;
    return true;
  }


}

export class SliderLayer extends ToggleButtonLayer {

  private sliders: Slider[] = [];

  public addSlider(
    x: number,
    y: number,
    value: number,
    backImagePath: string,
    foreImagePath: string,
    buttonImagePath: string,
  ): AsyncCallbacks {
    const name = `Slider ${this.sliders.length}`;
    const slider = new Slider(name, this.resource, this.owner);
    this.addChild(slider);
    this.sliders.push(slider);

    slider.x = x;
    slider.y = y;

    return slider.initSlider(
      value,
      backImagePath,
      foreImagePath,
      buttonImagePath,
    );
  }

  public clearSliders(): void {
    this.sliders.forEach((slider) => {
      slider.resetSlider();
      slider.destroy();
    });
    this.sliders = [];
  }

  public lockSliders(): void {
    this.sliders.forEach((slider) => slider.lock());
  }

  public unlockSliders(): void {
    this.sliders.forEach((slider) => slider.unlock());
  }

  public store(tick: number): any {
    const data: any = super.store(tick);
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    super.restore(asyncTask, data, tick, clear);
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
  }

  public copyTo(dest: SliderLayer): void {
    super.copyTo(dest);
  }
}
