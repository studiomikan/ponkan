import { BaseLayer } from '../base/base-layer';
import { PonMouseEvent } from '../base/pon-mouse-event';

/**
 * トグルボタン機能
 */
export class ToggleButton extends BaseLayer {
  protected insideFlag: boolean = false;
  protected buttonStatus: 'enabled' | 'disabled' = 'disabled';
  protected varName: string = 'toggle-button-value';
  protected exp: string | null = null;
  protected isSystemButton: boolean = false;
  protected systemButtonLocked: boolean = false;

  public initToggleButton(varName: string, isSystemButton: boolean, exp: string | null): void {
    this.insideFlag = false;
    this.varName = varName;
    this.isSystemButton = isSystemButton;
    this.exp = exp;
    this.setButtonStatus('disabled');
    this.setValue(this.getValue());
    this.visible = true;
  }

  public clearToggleButton(): void {
    this.setButtonStatus('disabled');
    this.insideFlag = false;
    this.varName = 'toggle-button-value';
    this.exp = null;
  }

  public setButtonStatus(status: 'enabled' | 'disabled'): void {
    if (this.isSystemButton && this.systemButtonLocked) {
      this.buttonStatus = 'disabled';
    } else {
      this.buttonStatus = status;
    }
    if (status === 'enabled' && this.insideFlag) {
      this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.over;
    } else {
      this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
    }
  }

  public lockSystemButton(): void {
    if (this.isSystemButton) {
      this.systemButtonLocked = true;
      this.setButtonStatus('disabled');
    }
  }

  public unlockSystemButton(): void {
    if (this.isSystemButton) {
      this.systemButtonLocked = false;
      this.setButtonStatus('enabled');
    }
  }
  public setValue(value: boolean): void {
    this.resource.tmpVar[this.varName] = value;
  }

  public getValue(): boolean {
    return this.resource.tmpVar[this.varName];
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
      this.setButtonStatus('enabled');
    } else {
      this.setButtonStatus('disabled');
    }
  }

  public onMouseEnter(e: PonMouseEvent): void {
    super.onMouseEnter(e);

    if (this.buttonStatus !== 'disabled') {
      this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.over;
    }
    this.insideFlag = true;
  }

  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);

    if (this.buttonStatus !== 'disabled') {
      this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
    }
    this.insideFlag = false;
  }

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);

    if (this.buttonStatus !== 'disabled') {
      this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.on;
    }
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);
    if (!e.isLeft) {
      return;
    }

    if (this.buttonStatus !== 'disabled') {
      this.setValue(!this.getValue());
      if (this.exp !== null && this.exp !== '') {
        this.resource.evalJs(this.exp);
      }
    }
  }

  protected static toggleButtonStoreParams: string[] = [
    'insideFlag',
    'buttonStatus',
    'varName',
    'isSystemButton',
    'systemButtonLocked',
    'exp',
  ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    ToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    this.clearToggleButton();
    await super.restore(data, tick, clear);
  }

  public restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    const me: any = this as any;
    ToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });
    this.insideFlag = false;
    this.setButtonStatus(data.buttonStatus);
    this.setValue(this.getValue());
  }

  public copyTo(dest: ToggleButton): void {
    super.copyTo(dest);

    const me: any = this as any;
    const you: any = dest as any;
    ToggleButton.toggleButtonStoreParams.forEach((param: string) => {
      you[param] = me[param];
    });
  }
}
