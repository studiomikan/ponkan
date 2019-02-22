export class PonEventHandler {
  public readonly eventName: string;
  public readonly callback: string;
  public readonly param: string;

  public constructor(eventName: string, callback: string, param: any = null) {
    this.eventName = eventName;
    this.callback = callback;
    this.param = param;
  }

  public fire(self: any): void {
    if (self == null) {
      throw new Error(`イベントハンドラの呼び出し元オブジェクトがnullです(${this.callback})`);
    }
    let func = self[this.callback];
    if (func == null || typeof func !== "function") {
      throw new Error(`${this.callback}メソッドが未定義です`);
    }
    func.call(self, this.param);
  }
}
