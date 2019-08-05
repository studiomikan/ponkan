import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Resource } from "../base/resource";
import { Ponkan3 } from "../ponkan3";
import { ImageButton } from "./image-button-layer";
import { ToggleButtonLayer } from "./toggle-button-layer";

/**
 * スライダー
 */
export class Slider extends BaseLayer {
  protected foreImage: BaseLayer | null = null;
  protected button: ImageButton | null = null;
  protected locked: boolean = false;

  public initSlider(
    backImagePath: string,
    foreImagePath: string,
    buttonImagePath: string,
  ): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    const task = new AsyncTask();

    // 背景画像読み込み
    task.add((params: any, index: number): AsyncCallbacks => {
      return this.loadImage(backImagePath);
    });
    // 前景画像読み込み
    task.add((params: any, index: number): AsyncCallbacks => {
      const foreImage = new BaseLayer("slider fore", this.resource, this.owner);
      this.addChild(foreImage);
      this.foreImage = foreImage;
      const foreImageCb = foreImage.loadImage(foreImagePath);
      foreImageCb.done(() => {
        foreImage.x = 0;
        foreImage.y = 0;
        foreImage.width = 100; // TODO 修正
        foreImage.visible = true;
      });
      return foreImageCb;
    });
    // ボタン読み込み
    task.add((params: any, index: number): AsyncCallbacks => {
      const button = new ImageButton("slider fore", this.resource, this.owner);
      this.addChild(button);
      this.button = button;
      const buttonCb = button.initImageButton(
        false,           // jump: boolean = true,
        false,           // call: boolean = false,
        null,            // filePath: string | null = null,
        null,            // label: string | null = null,
        true,            // countPage: boolean = true,
        false,           // isSystemButton: boolean = false,
        "alert();",      // exp: string | null = null,
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
      this.visible = true;
    });
  }

  public resetSlider(): void {
    this.freeImage();
    if (this.foreImage != null) {
      this.foreImage.freeImage();
      this.foreImage.visible = false;
      this.deleteChildLayer(this.foreImage);
    }
    if (this.button != null) {
      this.button.resetButton();
      this.button.freeImage();
      this.button.visible = false;
      this.deleteChildLayer(this.button);
    }
  }

  public lock(): void {
    this.locked = true;
  }

  public unlock(): void {
    this.locked = false;
  }

}

export class SliderLayer extends ToggleButtonLayer {

  private sliders: Slider[] = [];

  public addSlider(
    x: number,
    y: number,
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
