import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { Ponkan } from "../ponkan";

export type ButtonStatus = "normal" | "over" | "on" | "disabled";

export class Button extends BaseLayer {
  private _isButton: boolean = false;
  protected insideFlag: boolean = false;
  protected buttonStatus: ButtonStatus = "disabled";
  protected down: boolean = false;
  /** キーボード操作時の選択インデックス */
  public keyIndex: number = 0;

  public get isButton(): boolean {
    return this._isButton;
  }

  public initButton(keyIndex: number): void {
    this.clearButton();
    this._isButton = true;
    this.keyIndex = keyIndex;
  }

  public clearButton(): void {
    this.setButtonStatus("disabled");
    this._isButton = false;
    this.insideFlag = false;
    this.down = false;
    this.keyIndex = 0;
  }

  public setButtonStatus(status: ButtonStatus): void {
    this.buttonStatus = status;
    if (this.buttonStatus === "disabled") {
      this.down = false;
    }
    this.resource.getCanvasElm().style.cursor = this.resource.cursor[status];
  }

  public getButtonStatus(): ButtonStatus {
    return this.isButton ? this.buttonStatus : "disabled";
  }

  public get isFocused(): boolean {
    return this.getButtonStatus() === "over";
  }

  public focus(): void {
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("over");
    }
    this.insideFlag = true;
  }

  public blur(): void {
    if (this.buttonStatus !== "disabled") {
      this.setButtonStatus("normal");
    }
    this.insideFlag = false;
  }

  public onMouseEnter(e: PonMouseEvent): void {
    super.onMouseEnter(e);
    this.focus();
  }

  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);
    this.blur();
  }

  public onMouseMove(e: PonMouseEvent): void {
    super.onMouseMove(e);
    if (this.buttonStatus !== "disabled" && this.isInsideEvent(e)) {
      this.resource.getCanvasElm().style.cursor = this.resource.cursor[this.buttonStatus];
    }
  }

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);

    if (this.isInsideEvent(e) && this.buttonStatus !== "disabled") {
      this.setButtonStatus("on");
      this.down = true;
    }
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);
    this.down = false;
  }

  public async submit(): Promise<void> {
    // should be override
  }

  protected static buttonStoreParams: string[] = ["insideFlag", "buttonStatus", "keyIndex"];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    Button.buttonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    this.clearButton();
    await super.restore(data, tick, clear);

    const me: any = this as any;
    Button.buttonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    this.insideFlag = false;
    this.setButtonStatus(data.buttonStatus);
  }

  public copyTo(dest: Button): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    Button.buttonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}

/**
 * textbuttonコマンドやimagebuttonコマンドで生成するボタンの機能
 */
export class CommandButton extends Button {
  protected jump: boolean = true;
  protected call: boolean = false;
  protected filePath: string | null = null;
  protected label: string | null = null;
  protected countPage: boolean = true;
  protected isSystemButton: boolean = false;
  protected onEnterExp: string | null = null;
  protected onLeaveExp: string | null = null;
  protected onClickExp: string | null = null;
  protected onEnterSoundBuf: string | null = null;
  protected onLeaveSoundBuf: string | null = null;
  protected onClickSoundBuf: string | null = null;
  protected systemButtonLocked: boolean = false;

  public initCommandButton(
    jump = true,
    call = false,
    filePath: string | null = null,
    label: string | null = null,
    countPage = true,
    isSystemButton = false,
    onEnterExp: string | null = null,
    onLeaveExp: string | null = null,
    onClickExp: string | null = null,
    onEnterSoundBuf: string | null = null,
    onLeaveSoundBuf: string | null = null,
    onClickSoundBuf: string | null = null,
    keyIndex: number | null = null,
  ): void {
    this.initButton(keyIndex != null ? keyIndex : 0);
    this.jump = jump;
    this.call = call;
    this.filePath = filePath;
    this.label = label;
    this.countPage = countPage;
    this.isSystemButton = isSystemButton;
    this.onEnterExp = onEnterExp;
    this.onLeaveExp = onLeaveExp;
    this.onClickExp = onClickExp;
    this.visible = true;
    this.onEnterSoundBuf = onEnterSoundBuf;
    this.onLeaveSoundBuf = onLeaveSoundBuf;
    this.onClickSoundBuf = onClickSoundBuf;
  }

  public clearCommandButton(): void {
    this.clearButton();
    this.jump = true;
    this.call = false;
    this.filePath = null;
    this.label = null;
    this.onClickExp = null;
    this.onEnterSoundBuf = "";
    this.onLeaveSoundBuf = "";
    this.onClickSoundBuf = "";
  }

  public lockSystemButton(): void {
    if (this.isSystemButton) {
      this.systemButtonLocked = true;
      this.setButtonStatus("disabled");
    }
  }

  public unlockSystemButton(): void {
    if (this.isSystemButton) {
      this.systemButtonLocked = false;
      this.setButtonStatus("normal");
    }
  }

  public onChangeStable(isStable: boolean): void {
    super.onChangeStable(isStable);
    if (!this.isSystemButton) {
      return;
    }
    if (this.systemButtonLocked) {
      return;
    }
    if (isStable) {
      if (this.insideFlag) {
        this.setButtonStatus("over");
      } else {
        this.setButtonStatus("normal");
      }
    } else {
      this.setButtonStatus("disabled");
    }
  }

  public onMouseEnter(e: PonMouseEvent): void {
    super.onMouseEnter(e);

    if (this.buttonStatus !== "disabled") {
      if (this.onEnterExp != null && this.onEnterExp !== "") {
        this.resource.evalJs(this.onEnterExp);
      }
      if (this.onEnterSoundBuf != null && this.onEnterSoundBuf !== "") {
        const p: Ponkan = this.owner as Ponkan;
        p.getSoundBuffer(this.onEnterSoundBuf).play();
      }
    }
  }

  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);

    if (this.buttonStatus !== "disabled") {
      if (this.onLeaveExp != null && this.onLeaveExp !== "") {
        this.resource.evalJs(this.onLeaveExp);
      }
      if (this.onLeaveSoundBuf != null && this.onLeaveSoundBuf !== "") {
        const p: Ponkan = this.owner as Ponkan;
        p.getSoundBuffer(this.onLeaveSoundBuf).play();
      }
    }
  }

  public async onMouseUp(e: PonMouseEvent): Promise<void> {
    const down = this.down; // super.onMouseUpでfalseになってしまうのでキャッシュしておく

    super.onMouseUp(e);
    if (!e.isLeft) {
      return;
    }

    if (down && this.isInsideEvent(e) && this.buttonStatus !== "disabled") {
      e.stopPropagation();
      e.forceStop();
      return this.submit();
    }
  }

  public async submit(): Promise<void> {
    const p: Ponkan = this.owner as Ponkan;
    if (this.onClickExp !== null && this.onClickExp !== "") {
      this.resource.evalJs(this.onClickExp);
    }
    if (this.onClickSoundBuf != null && this.onClickSoundBuf !== "") {
      p.getSoundBuffer(this.onClickSoundBuf).play();
    }
    if (this.filePath != null || this.label != null) {
      if (this.call) {
        p.conductor.stop();
        try {
          await p.callSubroutine(this.filePath, this.label, this.countPage);
        } catch (e) {
          p.error(e);
        }
        p.conductor.start();
      } else if (this.jump) {
        p.conductor.stop();
        try {
          await p.conductor.jump(this.filePath, this.label, this.countPage);
        } catch (e) {
          p.error(e);
        }
        p.conductor.start();
      }
    }
    if (this.isSystemButton) {
      this.setButtonStatus("normal");
    } else {
      this.setButtonStatus("disabled");
    }
  }

  protected static commandButtonStoreParams: string[] = [
    "jump",
    "call",
    "filePath",
    "label",
    "countPage",
    "isSystemButton",
    "onC",
    "onEnterExp",
    "onLeaveExp",
    "onClickExp",
    "onEnterSoundBuf",
    "onLeaveSoundBuf",
    "onClickSoundBuf",
    "systemButtonLocked",
  ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    CommandButton.commandButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    this.clearCommandButton();
    await super.restore(data, tick, clear);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    const me: any = this as any;
    CommandButton.commandButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    this.insideFlag = false;
    this.setButtonStatus(data.buttonStatus);
  }

  public copyTo(dest: CommandButton): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    CommandButton.commandButtonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}
