export class PonWheelEvent {
  public readonly deltaX: number;
  public readonly deltaY: number;

  public constructor(e: WheelEvent) {
    this.deltaX = e.deltaX;
    this.deltaY = e.deltaY;
  }

  public get isUp(): boolean {
    return this.deltaY <= 0;
  }

  public get isDown(): boolean {
    return this.deltaY > 0;
  }
}
