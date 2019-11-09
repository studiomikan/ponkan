import { ImageButtonLayer } from "./image-button-layer";
import { ToggleButton } from "./toggle-button";

export class ImageToggleButton extends ToggleButton {
  protected direction: "horizontal" | "vertical" = "horizontal";

  public async initImageToggleButton(
    filePath: string,
    varName: string,
    isSystemButton = false,
    exp: string | null,
    direction: "horizontal" | "vertical",
  ): Promise<void> {
    this.clearToggleButton();
    this.freeImage();

    try {
      await this.loadImage(filePath);
      this.direction = direction;
      if (this.direction === "vertical") {
        this.height = Math.floor(this.imageHeight / 2);
      } else {
        this.width = Math.floor(this.imageWidth / 2);
      }
      this.initToggleButton(varName, isSystemButton, exp);
    } catch (e) {
      throw new Error("画像の読み込みに失敗しました。");
    }
  }

  public clearToggleButton(): void {
    super.clearToggleButton();
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
    const data: any = super.store(tick);
    const me: any = this as any;
    ImageToggleButton.imageToggleButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    await super.restore(data, tick, clear);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    const me: any = this as any;
    ImageToggleButton.imageToggleButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    super.restoreAfterLoadImage(data, tick);
  }

  public copyTo(dest: ImageToggleButton): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    ImageToggleButton.imageToggleButtonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}

export class ToggleButtonLayer extends ImageButtonLayer {

  private imageToggleButtons: ImageToggleButton[] = [];

  public async addToggleButton(
    filePath: string,
    x: number,
    y: number,
    varName: string,
    isSystemButton = false,
    exp: string | null,
    direction: "horizontal" | "vertical",
  ): Promise<void> {
    const name = `ImageToggleButton ${this.imageToggleButtons.length}`;
    const btn = new ImageToggleButton(name, this.resource, this.owner);
    this.addChild(btn);
    this.imageToggleButtons.push(btn);

    btn.x = x;
    btn.y = y;
    return btn.initImageToggleButton(
      filePath,
      varName,
      isSystemButton,
      exp,
      direction,
    );
  }

  public clearToggleButtons(): void {
    this.imageToggleButtons.forEach((toggleButton) => {
      toggleButton.clearToggleButton();
      toggleButton.destroy();
      this.deleteChildLayer(toggleButton);
    });
    this.imageToggleButtons = [];
  }

  public lockButtons(): void {
    super.lockButtons();
    this.imageToggleButtons.forEach((toggleButton) => {
      toggleButton.setButtonStatus("disabled");
    });
  }

  public unlockButtons(): void {
    super.unlockButtons();
    this.imageToggleButtons.forEach((toggleButton) => {
      toggleButton.setButtonStatus("enabled");
    });
  }

  public lockSystemButtons(): void {
    super.lockSystemButtons();
    this.imageToggleButtons.forEach((toggleButton) => {
      toggleButton.lockSystemButton();
    });
  }

  public unlockSystemButtons(): void {
    super.unlockSystemButtons();
    this.imageToggleButtons.forEach((toggleButton) => {
      toggleButton.unlockSystemButton();
    });
  }

  public store(tick: number): any {
    const data: any = super.store(tick);
    // const me: any = this as any;

    data.imageToggleButtons =
      this.imageToggleButtons.map((toggleButton) => toggleButton.store(tick));

    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    if (data.imageToggleButtons.length > 0) {
      if (data.imageToggleButtons.length === this.imageToggleButtons.length) {
        // 数が同じ場合（たとえばtemploadなどでロードしたときなど）は読み込み直さない
        await Promise.all(
          data.imageToggleButtons.map((toggleButtonData: any, i: number) => {
            return this.imageToggleButtons[i].restore(toggleButtonData, tick, clear);
          })
        );
      } else {
        this.clearToggleButtons();
        await Promise.all(
           data.imageToggleButtons.forEach((toggleButtonData: any) => {
             const btn = new ImageToggleButton(toggleButtonData.name, this.resource, this.owner);
             this.addChild(btn);
             this.imageToggleButtons.push(btn);
             return btn.restore(toggleButtonData, tick, clear);
           })
        );
      }
    } else {
      this.clearToggleButtons();
    }
    await super.restore(data, tick, clear);
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    if (data.imageToggleButtons != null && data.imageToggleButtons.length > 0) {
      for (let i = 0; i < data.imageToggleButtons.length; i++) {
        this.imageToggleButtons[i].restoreAfterLoadImage(data.imageToggleButtons[i], tick);
      }
    }
  }

  public copyTo(dest: ToggleButtonLayer): void {
    super.copyTo(dest);

    dest.clearToggleButtons();
    this.imageToggleButtons.forEach((srcBtn) => {
      const destBtn = new ImageToggleButton(name, dest.resource, dest.owner);
      dest.addChild(destBtn);
      dest.imageToggleButtons.push(destBtn);
      srcBtn.copyTo(destBtn);
    });
  }

}
