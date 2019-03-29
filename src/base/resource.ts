import { Howl, Howler } from 'howler';
import * as Util from "./util";
import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { PonGame } from "./pon-game";
import { Macro } from "./macro";
import { Script } from "./script";
import { Sound, ISoundCallbacks } from "./sound";

export class Resource {
  private ponGame: PonGame;
  private basePath: string;
  public tmpVar: any = {};
  public gameVar: any = {};
  public systemVar: any = { saveDataInfo: [] };

  public cursor: any = {
    "disabled": "auto",
    "normal": "auto",
    "over": "pointer",
    "on": "pointer"
  }

  public readonly macroInfo: any = {};
  public macroParams: object | null = null;

  private bufferCanvas: HTMLCanvasElement;
  private bufferCanvasContext: CanvasRenderingContext2D;

  public constructor(ponGame: PonGame, basePath: string = "") {
    this.ponGame = ponGame;
    this.basePath = this.fixPath(basePath);

    Howler.usingWebAudio = true;

    this.bufferCanvas = <HTMLCanvasElement> document.createElement('canvas');
    this.bufferCanvas.width = ponGame.width;
    this.bufferCanvas.height = ponGame.height;

    let context: CanvasRenderingContext2D | null = this.bufferCanvas.getContext("2d");
    if (context === null) {
      throw new Error("Canvasの初期化に失敗しました。");
    }
    this.bufferCanvasContext = context;
  }

  public getForeCanvasElm(): HTMLCanvasElement {
    return this.ponGame.foreRenderer.canvasElm;
  }

  public getBackCanvasElm(): HTMLCanvasElement {
    return this.ponGame.backRenderer.canvasElm;
  }

  public saveSystemData(saveDataPrefix: string): void {
    try {
      Logger.debug("==SYSTEM SAVE======================================");
      Logger.debug(this.systemVar);
      Logger.debug("===================================================");
      this.storeToLocalStorage(`${saveDataPrefix}_sys`, JSON.stringify(this.systemVar));
    } catch (e) {
      Logger.error(e);
      throw new Error("セーブデータの保存に失敗しました。JSON文字列に変換できません");
    }
  }

  public loadSystemData(saveDataPrefix: string): void {
    try {
      let str: string = this.restoreFromLocalStorage(`${saveDataPrefix}_sys`);
      if (str != null) {
        Util.objExtend(this.systemVar, JSON.parse(str));
      }
      Logger.debug("==SYSTEM LOAD======================================");
      Logger.debug(this.systemVar);
      Logger.debug("===================================================");
    } catch (e) {
      Logger.error(e);
      throw new Error("システムデータのロードに失敗しました");
    }
  }

  public debugClearSystemData(): void {
    Object.keys(this.systemVar).forEach((key) => {
      delete this.systemVar[key];
    });
  }

  // tslint:disable
  public evalJs(js: string): any {
    let ponkan = this.ponGame;
    let tv = this.tmpVar;
    let gv = this.gameVar;
    let sv = this.systemVar;
    let mp = this.macroParams;
    return (function() {
      return eval(js);
    })();
  }

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
        cb.callFail(e);
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
    if (filePath.indexOf("data:image/") === 0) {
      image.src = filePath;
    } else {
      image.src = path;
    }

    return cb;
  }

  public loadSound(
    filePath: string,
    bufferNum: number,
    callbacks: ISoundCallbacks
  ): AsyncCallbacks {
    const cb = new AsyncCallbacks();

    let h: Howl = new Howl({
      src: [this.getPath(filePath)],
      loop: true,
      volume: 1,
      autoplay: false,
      onload: () => {
        cb.callDone(new Sound(filePath, h, bufferNum, callbacks));
      },
      onloaderror: () => {
        cb.callFail(filePath);
      }
    });

    return cb;
  }

  public isEnabledLocalStorage(): boolean {
    return window.localStorage != null;
  }

  public storeToLocalStorage(name: string, data: string): void {
    try {
      window.localStorage.setItem(name, data);
    } catch (e) {
      // ストレージが満杯だったときに発生
      throw new Error("ストレージが満杯のため保存できませんでした");
    }
  }

  public restoreFromLocalStorage(name: string): string {
    let data: string | null = window.localStorage.getItem(name);
    if (data != null) {
      return data;
    } else {
      throw new Error(`ストレージ${name}にはデータがありません`);
    }
  }

  public copyLocalStorage(srcName: string, destName: string): boolean {
    try {
      let srcData: string = this.restoreFromLocalStorage(srcName);
      this.storeToLocalStorage(destName, srcData);
      return true;
    } catch (e) {
      return false;
    }
  }

  // /**
  //  * ローカルストレージが使用できるかどうかを返す
  //  * @return {boolean} 使用できるかどうか
  //  */
  // static isEnabledLocalStorage () {
  //   return window.localStorage != null
  // }
  //
  // /**
  //  * オブジェクトを保存する
  //  * @param {string} name データ名
  //  * @param {string} data 保存するオブジェクト
  //  */
  // static store (name, data) {
  //   let dataStr = data
  //   if (data != null) {
  //     dataStr = JSON.stringify(data)
  //   }
  //   window.localStorage.setItem(name, dataStr)
  // }
  //
  // /**
  //  * オブジェクトを復元する
  //  * @param {string} name データ名
  //  * @return {object} 復元したオブジェクト
  //  */
  // static restore (name) {
  //   let dataStr = window.localStorage.getItem(name)
  //   return JSON.parse(dataStr)
  // }
  //


}
