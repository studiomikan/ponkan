export class PonEventHandler {
  public readonly eventName: string;
  public readonly callback: () => void;

  public constructor(
    eventName: string,
    callback: () => void,
  ) {
    this.eventName = eventName;
    this.callback = callback;
  }

  public fire(): void {
    this.callback();
  }
}
