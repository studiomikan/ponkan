import { BaseLayer } from "../base/base-layer";
import { PonGame } from "../base/pon-game";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Resource } from "../base/resource";
import { Button, ButtonStatus } from "./button";
import { ToggleButtonLayer } from "./toggle-button-layer";

export class SliderButton extends Button {
  private callbacks: any;

  public async initSliderButton(imagePath: string, keyIndex: number): Promise<void> {
    await this.loadImage(imagePath);
    this.initButton(keyIndex);
    this.width = Math.floor(this.imageWidth / 3);
  }

  public clearSliderButton(): void {
    this.clearButton();
    this.freeImage();
  }

  public setButtonStatus(status: ButtonStatus): void {
    super.setButtonStatus(status);

    switch (status) {
      case "normal":
      case "disabled":
        this.imageX = 0;
        break;
      case "over":
        this.imageX = -Math.floor(this.imageWidth / 3);
        break;
      case "on":
        this.imageX = -Math.floor((this.imageWidth / 3) * 2);
        break;
    }
  }

  public setCallbacks(callbacks: any): void {
    this.callbacks = callbacks;
  }

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);
    if (this.isInsideEvent(e) && e.isLeft && this.callbacks.onMouseDown) {
      this.callbacks.onMouseDown(e);
    }
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);
    if (this.callbacks.onMouseUp) {
      this.callbacks.onMouseUp(e);
    }
  }

  public async submit(): Promise<void> {
    super.submit();
    if (this.callbacks.submit) {
      this.callbacks.submit();
    }
  }

  public slideToLeft(): void {
    if (this.callbacks.slideToLeft) {
      this.callbacks.slideToLeft();
    }
  }

  public slideToRight(): void {
    if (this.callbacks.slideToRight) {
      this.callbacks.slideToRight();
    }
  }
}

/**
 * スライダー
 */
export class Slider extends BaseLayer {
  protected foreImage: BaseLayer;
  public readonly button: SliderButton;
  protected locked: boolean = false;
  protected value: number = 0;
  protected onStart: string | ((v: number) => void) = ""; // スライド開始
  protected onSlide: string | ((v: number) => void) = ""; // スライド中
  protected onEnd: string | ((v: number) => void) = ""; // スライド終わり
  protected onChange: string | ((v: number) => void) = ""; // 値変更後。onEndより後
  protected down: boolean = false;

  constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.foreImage = new BaseLayer("slider fore", resource, owner);
    this.addChild(this.foreImage);
    this.button = new SliderButton("slider button", resource, owner);
    this.addChild(this.button);
    this.button.setCallbacks({
      onMouseDown: (e: PonMouseEvent) => {
        this.onButtonDown(e);
      },
      onMouseUp: (e: PonMouseEvent) => {
        this.onButtonUp(e);
      },
      submit: () => {
        this.submit();
      },
      slideToLeft: () => {
        this.setValue(this.value - 0.04);
        this.submit();
      },
      slideToRight: () => {
        this.setValue(this.value + 0.04);
        this.submit();
      },
    });
  }

  public async initSlider(
    value: number,
    onStart: string | ((v: number) => void),
    onSlide: string | ((v: number) => void),
    onEnd: string | ((v: number) => void),
    onChange: string | ((v: number) => void),
    backImagePath: string,
    foreImagePath: string,
    buttonImagePath: string,
    keyIndex: number,
  ): Promise<void> {
    this.clearSlider();

    if (value < 0.0) {
      value = 0.0;
    }
    if (value > 1.0) {
      value = 1.0;
    }
    this.value = value;
    this.onStart = onStart;
    this.onSlide = onSlide;
    this.onEnd = onEnd;
    this.onChange = onChange;

    const task: Promise<void>[] = [];

    // 背景画像読み込み
    task.push(this.loadImage(backImagePath));
    // 前景画像読み込み
    task.push(
      this.foreImage.loadImage(foreImagePath).then(() => {
        this.foreImage.x = 0;
        this.foreImage.y = 0;
        this.foreImage.visible = true;
      }),
    );
    // ボタン読み込み
    task.push(
      this.button.initSliderButton(buttonImagePath, keyIndex).then(() => {
        this.button.x = 0;
        this.button.y = 0;
        this.button.visible = true;
        this.button.setButtonStatus("normal");
      }),
    );

    return Promise.all(task).then(() => {
      this.setValue(value);
      this.visible = true;
      this.lock();
    });
  }

  public clearSlider(): void {
    this.freeImage();
    this.value = 0;
    this.onStart = "";
    this.onSlide = "";
    this.onEnd = "";
    this.onChange = "";
    this.down = false;

    this.foreImage.freeImage();
    this.foreImage.visible = false;

    this.button.clearSliderButton();
    this.button.freeImage();
    this.button.visible = false;
  }

  public lock(): void {
    this.locked = true;
    this.button.setButtonStatus("disabled");
  }

  public unlock(): void {
    this.locked = false;
    this.button.setButtonStatus("normal");
  }

  public setValueX(x: number): void {
    let x2 = x - this.button.width / 2;
    if (x2 < 0.0) {
      x2 = 0.0;
    }
    if (x2 > this.width - this.button.width) {
      x2 = this.width - this.button.width;
    }
    this.foreImage.width = x2;
    this.button.x = x2;

    let value = x2 / (this.width - this.button.width);
    if (value < 0.0) {
      value = 0.0;
    }
    if (value > 1.0) {
      value = 1.0;
    }
    this.value = value;
  }

  public setValue(value: number): void {
    if (value < 0.0) {
      value = 0.0;
    }
    if (value > 1.0) {
      value = 1.0;
    }
    const x = value * (this.width - this.button.width);
    this.value = value;
    this.foreImage.width = x;
    this.button.x = x;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onButtonDown(e: PonMouseEvent): void {
    if (!this.locked) {
      this.down = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onButtonUp(e: PonMouseEvent): void {
    // this.down = false;
  }

  public onMouseEnter(e: PonMouseEvent): void {
    super.onMouseEnter(e);
  }

  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);
  }

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);
    if (!this.locked && e.isLeft && this.isInsideEvent(e)) {
      this.down = true;
      this.setValueX(e.x);
      this.executeSliderCallback(this.onStart);
      e.stopPropagation();
      e.forceStop();
    }
  }

  public onMouseMove(e: PonMouseEvent): void {
    super.onMouseMove(e);
    if (!this.locked && this.down) {
      this.setValueX(e.x);
      this.executeSliderCallback(this.onSlide);
      this.resource.getCanvasElm().style.cursor = this.resource.cursor.over;
    }
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);
    if (this.down) {
      this.down = false;
      this.resource.getCanvasElm().style.cursor = this.resource.cursor.normal;
      e.stopPropagation();
      e.forceStop();
      this.executeSliderCallback(this.onEnd);
      this.submit();
    }
  }

  public submit(): void {
    this.executeSliderCallback(this.onChange);
  }

  private executeSliderCallback(callback: string | ((v: number) => void)): void {
    if (callback != null && callback !== "") {
      if (typeof callback === "function") {
        callback(this.value);
      } else {
        this.resource.evalJs(callback as string);
      }
    }
  }

  protected static sliderStoreParams: string[] = ["locked", "value", "exp"];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    Slider.sliderStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    data.foreImage = this.foreImage.store(tick);
    data.button = this.button.store(tick);
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    this.clearSlider();
    await super.restore(data, tick, clear);

    const me: any = this as any;
    Slider.sliderStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    await this.foreImage.restore(data.foreImage, tick, clear);
    await this.button.restore(data.button, tick, clear);
    this.button.setCallbacks({
      onMouseDown: (e: PonMouseEvent) => {
        this.onButtonDown(e);
      },
      onMouseUp: (e: PonMouseEvent) => {
        this.onButtonUp(e);
      },
    });
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    this.setValue(data.value);
    if (data.locked) {
      this.lock();
    } else {
      this.unlock();
    }
  }

  public copyTo(dest: Slider): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    Slider.sliderStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
    this.foreImage.copyTo(dest.foreImage);
    this.button.copyTo(dest.button);
  }
}

export class SliderLayer extends ToggleButtonLayer {
  private sliders: Slider[] = [];

  public async addSlider(
    x: number,
    y: number,
    value: number,
    onStart: string | ((v: number) => void),
    onSlide: string | ((v: number) => void),
    onEnd: string | ((v: number) => void),
    onChange: string | ((v: number) => void),
    backImagePath: string,
    foreImagePath: string,
    buttonImagePath: string,
    keyIndex: number,
  ): Promise<void> {
    const name = `Slider ${this.sliders.length}`;
    const slider = new Slider(name, this.resource, this.owner);
    this.addChild(slider);
    this.sliders.push(slider);

    slider.x = x;
    slider.y = y;

    return slider.initSlider(
      value,
      onStart,
      onSlide,
      onEnd,
      onChange,
      backImagePath,
      foreImagePath,
      buttonImagePath,
      keyIndex,
    );
  }

  public clearSliders(): void {
    this.sliders.forEach(slider => {
      slider.clearSlider();
      slider.destroy();
      this.deleteChildLayer(slider);
    });
    this.sliders = [];
  }

  public hasSlider(): boolean {
    return this.sliders.length > 0;
  }

  public lockSliders(): void {
    this.sliders.forEach(slider => slider.lock());
  }

  public unlockSliders(): void {
    this.sliders.forEach(slider => slider.unlock());
  }

  public getButtons(): Button[] {
    const buttons: Button[] = super.getButtons();
    this.sliders.forEach(slider => {
      buttons.push(slider.button as Button);
    });
    return buttons;
  }

  public store(tick: number): any {
    const data: any = super.store(tick);
    data.sliders = this.sliders.map(slider => slider.store(tick));
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    await super.restore(data, tick, clear);

    if (data.sliders != null && data.sliders.length > 0) {
      // console.log("sliders", data.sliders);
      if (data.sliders.length === this.sliders.length) {
        // 数が同じ場合
        await Promise.all(
          data.sliders.map((sliderData: any, i: number) => {
            return this.sliders[i].restore(sliderData, tick, clear);
          }),
        );
      } else {
        // 数が合わない場合は一度破棄して作り直す
        this.clearSliders();
        await Promise.all(
          data.sliders.map((sliderData: any) => {
            const s = new Slider(sliderData.name, this.resource, this.owner);
            this.addChild(s);
            this.sliders.push(s);
            return s.restore(sliderData, tick, clear);
          }),
        );
      }
    } else {
      this.clearSliders();
    }
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    if (data.sliders != null && data.sliders.length > 0) {
      for (let i = 0; i < data.sliders.length; i++) {
        this.sliders[i].restoreAfterLoadImage(data.sliders[i], tick);
      }
    }
  }

  public copyTo(dest: SliderLayer): void {
    super.copyTo(dest);

    dest.clearSliders();
    this.sliders.forEach(srcSlider => {
      const destSlider = new Slider(this.name, dest.resource, dest.owner);
      dest.addChild(destSlider);
      dest.sliders.push(destSlider);
      srcSlider.copyTo(destSlider);
    });
  }
}
