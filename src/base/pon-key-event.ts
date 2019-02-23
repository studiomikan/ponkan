
export enum KeyCode {
  Shift = 16,
  Ctrl = 17,
}

export class PonKeyEvent {
  private e: KeyboardEvent;

  public constructor(e: KeyboardEvent) {
    this.e = e;
  }

  public get keyCode(): number {
    return this.e.keyCode;
  }

  public get ctrl(): boolean { return this.e.ctrlKey; }
  public get shift(): boolean { return this.e.shiftKey; }
  public get alt(): boolean { return this.e.altKey; }
}
