export class AsyncCallbacks {
  private doneFuncs: ((data: any) => void)[] = [];
  private failFuncs: ((data: any) => void)[] = [];
  private alwaysFuncs: ((data: any) => void)[] = [];

  public done(func: (data: any) => void): AsyncCallbacks {
    this.doneFuncs.push(func);
    return this;
  }
  public fail(func: (data: any) => void): AsyncCallbacks {
    this.failFuncs.push(func);
    return this;
  }
  public always(func: (data: any) => void): AsyncCallbacks {
    this.alwaysFuncs.push(func);
    return this;
  }

  public callDone(data: any = null) {
    this.doneFuncs.forEach((doneFunc) => {
      if (doneFunc != null) { doneFunc(data); }
    });
    this.alwaysFuncs.forEach((alwaysFunc) => {
      if (alwaysFunc != null) { alwaysFunc(data); }
    });
  }
  public callFail(data: any = null) {
    this.failFuncs.forEach((failFunc) => {
      if (failFunc != null) { failFunc(data); }
    });
    this.alwaysFuncs.forEach((alwaysFunc) => {
      if (alwaysFunc != null) { alwaysFunc(data); }
    });
  }
}
