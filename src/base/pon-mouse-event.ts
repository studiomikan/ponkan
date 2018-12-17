export class PonMouseEvent {
  private _x: number;
  private _y: number;
  public get x(): number { return this._x; }
  public get y(): number { return this._y; }

  public constructor(x: number, y: number);
  public constructor(e: MouseEvent);
  public constructor(a: any, b?: number) {
    if (a instanceof MouseEvent) {
      this._x = a.offsetX;
      this._y = a.offsetY;
    } else if (a != null && b != null) {
      this._x = a;
      this._y = b;
    } else {
      this._x = 0;
      this._y = 0;
    }
  }
}
