export class PonEventHandler {
  public readonly eventName: string;
  public readonly callback: () => void;
  public readonly info: string;

  public constructor(
    eventName: string,
    callback: () => void,
    info: string,
  ) {
    this.eventName = eventName;
    this.callback = callback;
    this.info = info;
  }

  public fire(): void {
    this.callback();
  }
}
