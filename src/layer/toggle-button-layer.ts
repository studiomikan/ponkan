import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { AsyncCallbacks } from "../base/async-callbacks";
import { Resource } from "../base/resource";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { ToggleButton } from "./toggle-button";
import { BaseLayer } from "../base/base-layer";
import { ImageButtonLayer } from "./image-button-layer";
import { Ponkan3 } from "../ponkan3";

export class ImageToggleButton extends ToggleButton {
  protected direction: "horizontal" | "vertical" = "horizontal";

  public initImageToggleButton(
    filePath: string,
    varName: string,
    exp: string | null,
    direction: "horizontal" | "vertical",
  ): AsyncCallbacks {
    let cb = new AsyncCallbacks();

    this.resetToggleButton();
    this.freeImage();


    this.loadImage(filePath).done(() => {
      this.direction = direction;
      if (this.direction === "vertical") {
        this.height = Math.floor(this.imageHeight / 2);
      } else {
        this.width = Math.floor(this.imageWidth / 2);
      }
      this.initToggleButton(varName, exp);
      cb.callDone();
    }).fail(() => {
      cb.callFail();
      throw new Error("画像の読み込みに失敗しました。");
    });

    return cb;
  }

  public resetToggleButton(): void {
    super.resetToggleButton();
    this.direction = "horizontal";
  }

  public setValue(value: boolean): void {
    super.setValue(value);

    if (this.direction === "vertical") {
      if (value) {
        this.imageY = -Math.floor(this.imageHeight / 2);
      } else {
        this.imageY = 0;
      }
    } else {
      if (value) {
        this.imageX = -Math.floor(this.imageWidth / 2);
      } else {
        this.imageX = 0;
      }
    }
  }

  protected static imageToggleButtonStoreParams: string[] = [
    "direction",
  ];

  public store(tick: number): any {
    let data: any = super.store(tick);
    let me: any = this as any;
    ImageToggleButton.imageToggleButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    super.restore(asyncTask, data, tick);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    let me: any = this as any;
    ImageToggleButton.imageToggleButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    super.restoreAfterLoadImage(data, tick);
  }
}

export class ToggleButtonLayer extends ImageButtonLayer {

  private imageToggleButtons: ImageToggleButton[] = [];

  public addToggleButton(
    filePath: string,
    x: number,
    y: number,
    varName: string,
    exp: string | null,
    direction: "horizontal" | "vertical",
  ): AsyncCallbacks {
    let name = `ImageToggleButton ${this.imageToggleButtons.length}`;
    let btn = new ImageToggleButton(name, this.resource, this.owner);
    this.addChild(btn);
    this.imageToggleButtons.push(btn);

    btn.x = x;
    btn.y = y;
    return btn.initImageToggleButton(
      filePath,
      varName,
      exp,
      direction
    );
  }

  public clearToggleButtons(): void {
    this.imageToggleButtons.forEach((toggleButton) => {
      toggleButton.resetToggleButton();
      toggleButton.destroy();
      this.deleteChildLayer(toggleButton);
    });
    this.imageToggleButtons = [];
  }

  public store(tick: number): any {
    let data: any = super.store(tick);
    let me: any = this as any;
  
    data.imageToggleButtons = 
      this.imageToggleButtons.map(toggleButton => toggleButton.store(tick));
  
    return data;
  }
  
  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    this.clearToggleButtons();
    if (data.imageToggleButtons != null && data.imageToggleButtons.length > 0) {
      data.imageToggleButtons.forEach((toggleButtonData: any) => {
        let btn = new ImageToggleButton(toggleButtonData.name, this.resource, this.owner);
        this.addChild(btn);
        this.imageToggleButtons.push(btn);
        btn.restore(asyncTask, toggleButtonData, tick);
      });
    }
    super.restore(asyncTask, data, tick);
  }
  
  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    if (data.imageToggleButtons != null && data.imageToggleButtons.length > 0) {
      for (let i = 0; i < data.imageToggleButtons.length; i++) {
        this.imageToggleButtons[i].restoreAfterLoadImage(data.imageToggleButtons[i], tick);
      }
    }
  }

}

