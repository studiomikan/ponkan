import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { Script } from "./script";
//
// export class LoadTextCallbacks {
//   public doneFunc: null | ((data: string) => void) = null;
//   public failFunc: null | (() => void) = null;
//   public alwaysFunc: null | (() => void) = null;
//
//   public done(func: (data: string) => void): LoadTextCallbacks { this.doneFunc = func; return this; }
//   public fail(func: () => void): LoadTextCallbacks { this.failFunc = func; return this; }
//   public always(func: () => void): LoadTextCallbacks { this.alwaysFunc = func; return this; }
// }
//
// export class LoadScriptCallbacks {
//   public doneFunc: null | ((data: Script) => void) = null;
//   public failFunc: null | (() => void) = null;
//   public alwaysFunc: null | (() => void) = null;
//
//   public done(func: (data: Script) => void): LoadScriptCallbacks { this.doneFunc = func; return this; }
//   public fail(func: () => void): LoadScriptCallbacks { this.failFunc = func; return this; }
//   public always(func: () => void): LoadScriptCallbacks { this.alwaysFunc = func; return this; }
// }
//
// export class LoadImageCallbacks {
//   public doneFunc: null | ((data: HTMLImageElement) => void) = null;
//   public failFunc: null | (() => void) = null;
//   public alwaysFunc: null | (() => void) = null;
//
//   public done(func: (data: HTMLImageElement) => void): LoadImageCallbacks { this.doneFunc = func; return this; }
//   public fail(func: () => void): LoadImageCallbacks { this.failFunc = func; return this; }
//   public always(func: () => void): LoadImageCallbacks { this.alwaysFunc = func; return this; }
// }

export class Resource {
  private basePath: string;
  public tmpVar: object = {};
  public gameVar: object = {};
  public systemVar: object = {};

  public constructor(basePath: string = "") {
    this.basePath = this.fixPath(basePath);
  }

  public evalJs(js: string): any {
    const tv = this.tmpVar;
    const gv = this.gameVar;
    const sv = this.systemVar;
    // tslint:disable-next-line
    return (function() {
      // tslint:disable-next-line
      return eval(js);
    })();
  }

  /**
   * パスの末尾からスラッシュを取り除いて返す
   */
  private fixPath(path: string): string {
    return path[path.length - 1] === "/" ? path.substring(0, path.length - 1) : path;
  }

  /**
   * リソースのパスを取得する。
   * @param filePath ファイルパス（basePathからの相対パス）
   */
  public getPath(filePath: string) {
    return `${this.basePath}/${filePath}`;
  }

  /**
   * テキストを読み込む
   * @param filePath ファイルパス（basePathからの相対パス）
   * @return コールバックオブジェクト
   */
  public loadText(filePath: string): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (200 <= xhr.status && xhr.status < 300) {
        Logger.debug("AJAX SUCCESS: ", xhr);
        cb.callDone(xhr.responseText);
      } else {
        Logger.debug("AJAX FAILED: ", xhr);
        cb.callFail(xhr.responseText);
      }
    };
    xhr.open("GET", this.getPath(filePath), true);
    xhr.send();

    return cb;
  }

  /**
   * スクリプトファイルを読み込む
   * @param filePath ファイルパス（basePathからの相対パス）
   * @return コールバックオブジェクト
   */
  public loadScript(filePath: string): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    this.loadText(filePath).done((text) => {
      try {
        const script: Script = new Script(text);
        cb.callDone(script);
      } catch (e) {
        Logger.error(e);
        cb.callFail();
      }
    }).fail(() => {
      cb.callFail();
    });
    return cb;
  }

  /**
   * 画像を読み込む
   * @param filePath ファイルパス（basePathからの相対パス）
   * @return コールバックオブジェクト
   */
  public loadImage(filePath: string): AsyncCallbacks {
    const cb = new AsyncCallbacks();
    const path: string = this.getPath(filePath);
    const image: HTMLImageElement = new Image();

    image.onload = () => {
      cb.callDone(image);
    };
    image.onerror = () => {
      cb.callFail(image);
    };
    image.src = path;

    return cb;
  }

}
