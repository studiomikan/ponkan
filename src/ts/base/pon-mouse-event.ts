export class PonMouseEvent {
  public readonly x: number;
  public readonly y: number;
  public readonly button: number;
  private _stopPropagationFlag: boolean = false;
  private _forceStopFlag: boolean = false;

  public constructor(x: number, y: number, button: number);
  public constructor(e: MouseEvent);
  public constructor(a: any, b?: number, c?: number) {
    if (a instanceof MouseEvent) {
      this.x = a.offsetX;
      this.y = a.offsetY;
      this.button = a.button;
    } else if (a != null && b != null && c != null) {
      this.x = a;
      this.y = b;
      this.button = c;
    } else {
      this.x = 0;
      this.y = 0;
      this.button = 0;
    }
  }

  public get isLeft(): boolean {
    return this.button === 0;
  }

  public get isCenter(): boolean {
    return this.button === 1;
  }

  public get isRight(): boolean {
    return this.button === 2;
  }

  public stopPropagation(): void {
    this._stopPropagationFlag = true;
  }

  public get stopPropagationFlag(): boolean {
    return this._stopPropagationFlag;
  }

  public forceStop(): void {
    this._forceStopFlag = true;
  }

  public get forceStopFlag(): boolean {
    return this._forceStopFlag;
  }
}
