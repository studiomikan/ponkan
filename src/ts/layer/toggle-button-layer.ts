import { ImageButtonLayer } from "./image-button-layer";
import { Button, CommandButton, ButtonStatus } from "./button";

export class ImageToggleButton extends CommandButton {
  protected direction: "horizontal" | "vertical" = "horizontal";
  protected varName: string = "toggle-button-value";
  protected toggleState: boolean = false;
  protected offImageFile: string = "";

  public async initImageToggleButton(
    jump = true,
    call = false,
    filePath: string | null = null,
    label: string | null = null,
    countPage = true,
    isSystemButton = false,
    onEnterExp: string | null = null,
    onLeaveExp: string | null = null,
    onClickExp: string | null = null,
    imageFile: string,
    direction: "horizontal" | "vertical",
    onEnterSoundBuf: string,
    onLeaveSoundBuf: string,
    onClickSoundBuf: string,
    keyIndex: number | null = null,
    varName: string,
  ): Promise<void> {
    this.clearCommandButton();
    this.freeImage();
    this.initCommandButton(
      jump,
      call,
      filePath,
      label,
      countPage,
      isSystemButton,
      onEnterExp,
      onLeaveExp,
      onClickExp,
      onEnterSoundBuf,
      onLeaveSoundBuf,
      onClickSoundBuf,
      keyIndex,
    );
    this.direction = direction;
    this.varName = varName;
    this.resource.tmpVar[this.varName] = this.toggleState;

    await this.loadImage(imageFile);
    if (this.direction === "vertical") {
      this.height = Math.floor(this.imageHeight / 6);
    } else {
      this.width = Math.floor(this.imageHeight / 6);
    }
    this.setButtonStatus("disabled");
  }

  public clearCommandButton(): void {
    super.clearCommandButton();
    this.varName = "toggle-button-value";
    this.toggleState = false;
  }

  public setButtonStatus(status: ButtonStatus): void {
    super.setButtonStatus(status);

    if (this.direction === "vertical") {
      const base = this.toggleState ? -Math.floor(this.imageHeight / 2) : 0;
      switch (status) {
        case "normal":
        case "disabled":
          this.imageY = base;
          break;
        case "over":
          this.imageY = base - Math.floor(this.imageHeight / 6);
          break;
        case "on":
          this.imageY = base - Math.floor((this.imageHeight / 6) * 2);
          break;
      }
    } else {
      const base = this.toggleState ? -Math.floor(this.imageWidth / 2) : 0;
      switch (status) {
        case "normal":
        case "disabled":
          this.imageX = base;
          break;
        case "over":
          this.imageX = base - Math.floor(this.imageWidth / 6);
          break;
        case "on":
          this.imageX = base - Math.floor((this.imageWidth / 6) * 2);
          break;
      }
    }
  }

  public async submit(): Promise<void> {
    this.toggleState = !this.toggleState;
    this.resource.tmpVar[this.varName] = this.toggleState;
    await super.submit();
  }

  protected static toggleButtonStoreParams: string[] = ["varName", "toggleState", "onImageFile", "offImageFile"];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    ImageToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    await super.restore(data, tick, clear);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    const me: any = this as any;
    ImageToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    this.resource.tmpVar[this.varName] = this.toggleState;
    super.restoreAfterLoadImage(data, tick);
  }

  public copyTo(dest: ImageToggleButton): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    ImageToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}

export class ToggleButtonLayer extends ImageButtonLayer {
  private imageToggleButtons: ImageToggleButton[] = [];

  public async addToggleButton(
    jump = true,
    call = false,
    filePath: string | null = null,
    label: string | null = null,
    countPage = true,
    onEnterExp: string | null = null,
    onLeaveExp: string | null = null,
    onClickExp: string | null = null,
    imageFile: string,
    x: number,
    y: number,
    direction: "horizontal" | "vertical",
    isSystemButton: boolean,
    onEnterSoundBuf: string,
    onLeaveSoundBuf: string,
    onClickSoundBuf: string,
    keyIndex: number | null = null,
    varName: string,
  ): Promise<void> {
    const name = `ImageToggleButton ${this.imageToggleButtons.length}`;
    const btn = new ImageToggleButton(name, this.resource, this.owner);
    this.addChild(btn);
    this.imageToggleButtons.push(btn);

    btn.x = x;
    btn.y = y;
    await btn.initImageToggleButton(
      jump,
      call,
      filePath,
      label,
      countPage,
      isSystemButton,
      onEnterExp,
      onLeaveExp,
      onClickExp,
      imageFile,
      direction,
      onEnterSoundBuf,
      onLeaveSoundBuf,
      onClickSoundBuf,
      keyIndex,
      varName,
    );
  }

  public clearToggleButtons(): void {
    this.imageToggleButtons.forEach(toggleButton => {
      toggleButton.clearCommandButton();
      toggleButton.destroy();
      this.deleteChildLayer(toggleButton);
    });
    this.imageToggleButtons = [];
  }

  public hasToggleButton(): boolean {
    return this.imageToggleButtons.length > 0;
  }

  public getButtons(): Button[] {
    const buttons: Button[] = super.getButtons();
    this.imageToggleButtons.forEach(imageToggleButton => {
      buttons.push(imageToggleButton as Button);
    });
    return buttons;
  }

  public lockButtons(): void {
    super.lockButtons();
    this.imageToggleButtons.forEach(toggleButton => {
      toggleButton.setButtonStatus("disabled");
    });
  }

  public unlockButtons(): void {
    super.unlockButtons();
    this.imageToggleButtons.forEach(toggleButton => {
      toggleButton.setButtonStatus("normal");
    });
  }

  public lockSystemButtons(): void {
    super.lockSystemButtons();
    this.imageToggleButtons.forEach(toggleButton => {
      toggleButton.lockSystemButton();
    });
  }

  public unlockSystemButtons(): void {
    super.unlockSystemButtons();
    this.imageToggleButtons.forEach(toggleButton => {
      toggleButton.unlockSystemButton();
    });
  }

  public store(tick: number): any {
    const data: any = super.store(tick);
    // const me: any = this as any;

    data.imageToggleButtons = this.imageToggleButtons.map(toggleButton => toggleButton.store(tick));

    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    if (data.imageToggleButtons.length > 0) {
      if (data.imageToggleButtons.length === this.imageToggleButtons.length) {
        // 数が同じ場合（たとえばtemploadなどでロードしたときなど）は読み込み直さない
        await Promise.all(
          data.imageToggleButtons.map((toggleButtonData: any, i: number) => {
            return this.imageToggleButtons[i].restore(toggleButtonData, tick, clear);
          }),
        );
      } else {
        // 数が合わない場合は一度破棄して作り直す
        this.clearToggleButtons();
        await Promise.all(
          data.imageToggleButtons.forEach((toggleButtonData: any) => {
            const btn = new ImageToggleButton(toggleButtonData.name, this.resource, this.owner);
            this.addChild(btn);
            this.imageToggleButtons.push(btn);
            return btn.restore(toggleButtonData, tick, clear);
          }),
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
    this.imageToggleButtons.forEach(srcBtn => {
      const destBtn = new ImageToggleButton(name, dest.resource, dest.owner);
      dest.addChild(destBtn);
      dest.imageToggleButtons.push(destBtn);
      srcBtn.copyTo(destBtn);
    });
  }
}
