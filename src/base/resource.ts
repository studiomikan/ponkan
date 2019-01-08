import { Logger } from './logger';
import { Script } from './script';

export class LoadTextCallbacks {
  public doneFunc: null | ((data: string) => void) = null;
  public failFunc: null | (() => void) = null;
  public alwaysFunc: null | (() => void) = null;

  public done(func: (data: string) => void): LoadTextCallbacks { this.doneFunc = func; return this; }
  public fail(func: () => void): LoadTextCallbacks { this.failFunc = func; return this; }
  public always(func: () => void): LoadTextCallbacks { this.alwaysFunc = func; return this; }
}

export class LoadScriptCallbacks {
  public doneFunc: null | ((data: Script) => void) = null;
  public failFunc: null | (() => void) = null;
  public alwaysFunc: null | (() => void) = null;

  public done(func: (data: Script) => void): LoadScriptCallbacks { this.doneFunc = func; return this; }
  public fail(func: () => void): LoadScriptCallbacks { this.failFunc = func; return this; }
  public always(func: () => void): LoadScriptCallbacks { this.alwaysFunc = func; return this; }
}

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
  private fixPath(path: string): string{
    return path[path.length - 1] == "/" ? path.substring(0, path.length - 1) : path;
  }

  /**
   * リソースのパスを取得する。
   * @param filePath ファイルパス（basePathからの相対パス）
   */
  public getPath(filePath: string) {
    return `${this.basePath}/${filePath}`
  }

  /**
   * テキストを読み込む
   * @param filePath ファイルパス（basePathからの相対パス）
   * @return コールバックオブジェクト
   */
  public loadText(filePath: string): LoadTextCallbacks {
    let cb = new LoadTextCallbacks();
    let xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (200 <= xhr.status && xhr.status < 300) {
        Logger.debug("AJAX SUCCESS: ", xhr);
        if (cb.doneFunc != null) cb.doneFunc(xhr.responseText);
      } else {
        Logger.debug("AJAX FAILED: ", xhr);
        if (cb.failFunc != null) cb.failFunc();
      }
    }
    xhr.open('GET', this.getPath(filePath),true);
    xhr.send();

    return cb;
  }

  /**
   * スクリプトファイルを読み込む
   * @param filePath ファイルパス（basePathからの相対パス）
   * @return コールバックオブジェクト
   */
  public loadScript(filePath: string): LoadScriptCallbacks {
    let cb = new LoadScriptCallbacks();
    this.loadText(filePath).done((text) => {
      try {
        let script = new Script(text);
        if (cb.doneFunc != null) cb.doneFunc(script);
      } catch (e) {
        Logger.error(e);
        if (cb.failFunc != null) cb.failFunc();
      }
    }).fail(() => {
      if (cb.failFunc != null) cb.failFunc();
    });
    return cb;
  }

  /**
   * 画像を読み込む
   * @param filePath ファイルパス（basePathからの相対パス）
   * @return コールバックオブジェクト
   */
  public loadImage(filePath: string): LoadImageCallbacks {
    let cb = new LoadImageCallbacks();
    let path: string = this.getPath(filePath);
    let image: HTMLImageElement = new Image();

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

