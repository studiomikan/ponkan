export class PonKeyEvent {
  private e: KeyboardEvent;

  public constructor(e: KeyboardEvent) {
    this.e = e;
    // console.log(e, e.key);
  }

  public get key(): string {
    return this.e.key;
  }

  public get ctrl(): boolean {
    return this.e.ctrlKey;
  }
  public get shift(): boolean {
    return this.e.shiftKey;
  }
  public get alt(): boolean {
    return this.e.altKey;
  }
}
