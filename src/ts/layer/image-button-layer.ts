import { CommandButton } from "./button";
import { TextButtonLayer } from "./text-button-layer";

export class CommandImageButton extends CommandButton {
  protected direction: "horizontal" | "vertical" = "horizontal";

  public async initImageButton(
    jump = true,
    call = false,
    filePath: string | null = null,
    label: string | null = null,
    countPage = true,
    isSystemButton = false,
    exp: string | null = null,
    file: string,
    direction: "horizontal" | "vertical",
    onEnterSoundBuf: string,
    onLeaveSoundBuf: string,
    onClickSoundBuf: string,
  ): Promise<void> {
    this.clearCommandButton();
    this.freeImage();
    this.initCommandButton(jump, call, filePath, label, countPage, isSystemButton, exp,
                    onEnterSoundBuf, onLeaveSoundBuf, onClickSoundBuf);
    this.direction = direction;
    await this.loadImage(file);
    if (this.direction === "vertical") {
      this.height = Math.floor(this.imageHeight / 3);
    } else {
      this.width = Math.floor(this.imageWidth / 3);
    }
    this.setButtonStatus("disabled");
  }

  public clearCommandButton(): void {
    super.clearCommandButton();
    this.direction = "horizontal";
  }

  public setButtonStatus(status: "normal" | "over" | "on" | "disabled"): void {
    super.setButtonStatus(status);

    if (this.direction === "vertical") {
      switch (status) {
        case "normal":
        case "disabled":
          this.imageY = 0;
          break;
        case "over":
          this.imageY = -Math.floor(this.imageHeight / 3);
          break;
        case "on":
          this.imageY = -Math.floor(this.imageHeight / 3 * 2);
          break;
      }
    } else {
      switch (status) {
        case "normal":
        case "disabled":
          this.imageX = 0;
          break;
        case "over":
          this.imageX = -Math.floor(this.imageWidth / 3);
          break;
        case "on":
          this.imageX = -Math.floor(this.imageWidth / 3 * 2);
          break;
      }
    }
  }

  protected static imageButtonStoreParams: string[] = [
    "direction",
  ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    CommandImageButton.imageButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    await super.restore(data, tick, clear);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    const me: any = this as any;
    CommandImageButton.imageButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    super.restoreAfterLoadImage(data, tick);
  }

  public copyTo(dest: CommandImageButton): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    CommandImageButton.imageButtonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}

export class ImageButtonLayer extends TextButtonLayer {

  private imageButtons: CommandImageButton[] = [];

  public async addImageButton(
    jump = true,
    call = false,
    filePath: string | null = null,
    label: string | null = null,
    countPage = true,
    exp: string | null = null,
    file: string,
    x: number,
    y: number,
    direction: "horizontal" | "vertical",
    isSystemButton: boolean,
    onEnterSoundBuf: string,
    onLeaveSoundBuf: string,
    onClickSoundBuf: string,
  ): Promise<void> {
    const name = `ImageButton ${this.imageButtons.length}`;
    const btn = new CommandImageButton(name, this.resource, this.owner);
    this.addChild(btn);
    this.imageButtons.push(btn);

    btn.x = x;
    btn.y = y;
    await btn.initImageButton(
      jump,
      call,
      filePath,
      label,
      countPage,
      isSystemButton,
      exp,
      file,
      direction,
      onEnterSoundBuf,
      onLeaveSoundBuf,
      onClickSoundBuf,
    );
  }

  public clearImageButtons(): void {
    this.imageButtons.forEach((imageButton) => {
      imageButton.clearCommandButton();
      imageButton.destroy();
      this.deleteChildLayer(imageButton);
    });
    this.imageButtons = [];
  }

  public lockButtons(): void {
    super.lockButtons();
    this.imageButtons.forEach((imageButton) => {
      imageButton.setButtonStatus("disabled");
    });
  }

  public unlockButtons(): void {
    super.unlockButtons();
    this.imageButtons.forEach((imageButton) => {
      imageButton.setButtonStatus("normal");
    });
  }

  public lockSystemButtons(): void {
    super.lockSystemButtons();
    this.imageButtons.forEach((imageButton) => {
      imageButton.lockSystemButton();
    });
  }

  public unlockSystemButtons(): void {
    super.unlockSystemButtons();
    this.imageButtons.forEach((imageButton) => {
      imageButton.unlockSystemButton();
    });
  }

  public store(tick: number): any {
    const data: any = super.store(tick);
    // const me: any = this as any;

    data.imageButtons = this.imageButtons.map((imageButton) => imageButton.store(tick));

    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    if (data.imageButtons.length > 0) {
      if (data.imageButtons.length === this.imageButtons.length) {
        // 数が同じ場合（たとえばtemploadなどでロードしたときなど）は読み込み直さない
        await Promise.all(
          data.imageButtons.map((imageButtonData: any, i: number) => {
            return this.imageButtons[i].restore(imageButtonData, tick, clear);
          })
        );
      } else {
        // 数が合わない場合は一度破棄して作り直す
        this.clearImageButtons()
        await Promise.all(
          data.imageButtons.map((imageButtonData: any) => {
            const btn = new CommandImageButton(imageButtonData.name, this.resource, this.owner);
            this.addChild(btn);
            this.imageButtons.push(btn);
            return btn.restore(imageButtonData, tick, clear);
          })
        );
      }
    } else {
      this.clearImageButtons();
    }
    await super.restore(data, tick, clear); // TODO: このタイミングであってるのかどうか確認する
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    if (data.imageButtons != null && data.imageButtons.length > 0) {
      for (let i = 0; i < data.imageButtons.length; i++) {
        this.imageButtons[i].restoreAfterLoadImage(data.imageButtons[i], tick);
      }
    }
  }

  public copyTo(dest: ImageButtonLayer): void {
    super.copyTo(dest);

    dest.clearImageButtons();
    this.imageButtons.forEach((srcBtn) => {
      const destBtn = new CommandImageButton(srcBtn.name, dest.resource, dest.owner);
      dest.addChild(destBtn);
      dest.imageButtons.push(destBtn);
      srcBtn.copyTo(destBtn);
    });
  }

}
