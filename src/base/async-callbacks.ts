export class AsyncCallbacks {
  private doneFunc: null | ((data: any) => void) = null;
  private failFunc: null | ((data: any) => void) = null;
  private alwaysFunc: null | ((data: any) => void) = null;

  public done(func: (data: any) => void): AsyncCallbacks {
    this.doneFunc = func;
    return this;
  }
  public fail(func: (data: any) => void): AsyncCallbacks {
    this.failFunc = func;
    return this;
  }
  public always(func: (data: any) => void): AsyncCallbacks {
    this.alwaysFunc = func;
    return this;
  }

  public callDone(data: any = null) {
    if (this.doneFunc != null) { this.doneFunc(data); }
    if (this.alwaysFunc != null) { this.alwaysFunc(data); }
  }
  public callFail(data: any = null) {
    if (this.failFunc != null) { this.failFunc(data); }
    if (this.alwaysFunc != null) { this.alwaysFunc(data); }
  }
}
