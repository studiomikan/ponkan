export class LoadImageCallbacks {
  public doneFunc: null | ((data: HTMLImageElement) => void) = null;
  public failFunc: null | (() => void) = null;
  public alwaysFunc: null | (() => void) = null;

  public done(func: (data: HTMLImageElement) => void): LoadImageCallbacks { this.doneFunc = func; return this; }
  public fail(func: () => void): LoadImageCallbacks { this.failFunc = func; return this; }
  public always(func: () => void): LoadImageCallbacks { this.alwaysFunc = func; return this; }
}

export class Resource {
  private basePath: string;
  
  public constructor(basePath: string = "") {
    this.basePath = this.fixPath(basePath);
  }

  /**
   * パスの末尾からスラッシュを取り除いて返す
   */
  public fixPath(path: string): string{
    return path[path.length - 1] == "/" ? path.substring(0, path.length - 1) : path;
  }

  /**
   * リソースのパスを取得する
   */
  public getPath(filePath: string) {
    return `${this.basePath}/${filePath}`
  }

  public loadImage(filePath: string): LoadImageCallbacks {
    let path: string = this.getPath(filePath);
    let image: HTMLImageElement = new Image();
    let cb: LoadImageCallbacks = new LoadImageCallbacks();

    image.onload = () => {
      if (cb.doneFunc != null) cb.doneFunc(image);
      if (cb.alwaysFunc != null) cb.alwaysFunc();
    };
    image.onerror = () => {
      if (cb.failFunc != null) cb.failFunc();
      if (cb.alwaysFunc != null) cb.alwaysFunc();
    };
    image.src = path;

    return cb;
  }

}

