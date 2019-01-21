export class PonEventHandler {
  private _callback: string;
  private _param: string;

  public get callback() { return this._callback; }
  public get param() { return this._param; }

  public constructor(callback: string, param: string = "") {
    this._callback = callback;
    this._param = param;
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
