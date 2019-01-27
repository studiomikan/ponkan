import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { Macro } from "./macro";
import { Script } from "./script";

export class Resource {
  private basePath: string;
  public readonly tmpVar: object = {};
  public readonly gameVar: object = {};
  public readonly systemVar: object = {};
  
  public readonly macroInfo: any = {};
  public macroParams: object | null = null;

  public constructor(basePath: string = "") {
    this.basePath = this.fixPath(basePath);
  }

  // tslint:disable
  public evalJs(js: string): any {
    let tv = this.tmpVar;
    let gv = this.gameVar;
    let sv = this.systemVar;
    let mp = this.macroParams;
    return (function() {
      return eval(js);
    })();
  }
  // tslint:enable

  public setMacroParams(params: any): void {
    this.macroParams = params;
  }

  public resetMacroParams(): void {
    this.macroParams = null;
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

  public hasMacro(name: string): boolean {
    return this.macroInfo[name] != null;
  }

  public getMacro(name: string): Macro {
    return this.macroInfo[name];
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
        const script: Script = new Script(this, filePath, text);
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
    let loaded: boolean = false;

    image.onload = (e) => {
      loaded = true;
      cb.callDone(image);
    };
    image.onerror = (e) => {
      // 画像がキャッシュされているとき、サーバが302を返すことがある。
      // その時は、onloadとonerrorの両方が呼ばれてしまうので、
      // すでにonloadが呼ばれて読み込み済みだとわかっている場合はエラーを無視する。
      if (!loaded) {
        cb.callFail(image);
      }
    };
    image.src = path;

    return cb;
  }

}
