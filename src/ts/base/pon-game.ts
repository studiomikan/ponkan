import { BaseLayer } from "./base-layer";
import { Conductor, IConductorEvent } from "./conductor";
import { Logger } from "./logger";
import { PonKeyEvent } from "./pon-key-event";
import { PonMouseEvent } from "./pon-mouse-event";
import { PonRenderer } from "./pon-renderer";
import { PonWheelEvent } from "./pon-wheel-event";
import { Resource } from "./resource";
import { ScreenShot } from "./screen-shot";
import { Tag } from "./tag";
import { TransManager } from "./trans-manager";

export enum ScaleMode {
  FIXED = 0,
  FIT,
  FULLSCREEN,
}

export class PonGame implements IConductorEvent {
  private eventHandlers: any = {};
  public static ScaleMode = ScaleMode;

  public static readonly Logger = Logger;
  public readonly parentElm: HTMLElement;
  public config: any = {};
  public isLocked: boolean = false;

  public readonly resource: Resource;
  private updateLoopFlag: boolean = false;
  private drawLoopFlag: boolean = false;
  private updateLoopTimer: number | null = null;
  private drawLoopTimer: number | null = null;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  public readonly renderer: PonRenderer;

  private _scaleModeBuffer: ScaleMode = ScaleMode.FIT;
  private _scaleMode: ScaleMode = ScaleMode.FIT;
  public _fixedScaleWidth: number = 800;
  public _fixedScaleHeight: number = 450;

  // コンダクタ
  protected conductorStack: Conductor[] = [];

  // レイヤ
  private forePrimaryLayers: BaseLayer[] = [];
  private backPrimaryLayers: BaseLayer[] = [];

  public readonly transManager: TransManager;
  public readonly screenShot: ScreenShot;
  public updateScreenShotFlag: boolean = true;

  public get width(): number {
    return this.renderer.width;
  }
  public get height(): number {
    return this.renderer.height;
  }

  public constructor(parentId: string, config: any = {}) {
    const elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
    this.parentElm = elm;
    this.config = config;
    if (config.width == null || config.height == null) {
      config.width = 800;
      config.height = 450;
    }
    this.renderer = new PonRenderer(elm, config.width, config.height);

    elm.style.position = "relative";
    elm.style.display = "block";
    elm.style.padding = "0";
    this.renderer.canvasElm.style.display = "block";
    this.renderer.canvasElm.className = "ponkan-scale-target";

    this.resource = new Resource(this, config.gameDataDir, config.gameVersion);
    this.resource.enableResourceCache = !config.developMode;

    this.transManager = new TransManager(this, this.resource);
    this.screenShot = new ScreenShot(config);

    this.initWindowScale();
    this.initWindowEvent();
    this.initMouseEventOnCanvas(this.renderer.canvasElm);
    this.initKeyboardEvent();

    this.conductorStack.push(new Conductor(this.resource, "Main Conductor", this));
  }

  public destroy(): void {
    this.stop();
    this.renderer.destroy();
    this.removeEvents();
  }

  public start(): void {
    this.stop();
    this.startUpdateLoop();
    this.startDrawLoop();
  }

  public startUpdateLoop(): void {
    this.updateLoopFlag = true;
    this.updateLoopTimer = window.setTimeout(() => {
      this.updateLoop();
    }, 0);
  }

  public startDrawLoop(): void {
    this.fpsPreTick = Date.now();
    this.drawLoopFlag = true;
    window.setTimeout(() => {
      this.drawLoop();
    }, 60);
  }

  public stop(): void {
    this.stopUpdateLoop();
    this.stopDrawLoop();
  }

  public stopUpdateLoop(): void {
    this.updateLoopFlag = false;
    if (this.updateLoopTimer != null) {
      window.clearTimeout(this.updateLoopTimer);
      this.updateLoopTimer = null;
    }
  }

  public stopDrawLoop(): void {
    this.fpsPreTick = 0;
    this.fpsCount = 0;
    this.fps = 0;
    this.drawLoopFlag = false;
    if (this.drawLoopTimer != null) {
      window.cancelAnimationFrame(this.drawLoopTimer);
      this.drawLoopTimer = null;
    }
  }

  public lock(stop = true): void {
    this.isLocked = true;
    if (stop) {
      this.conductor.stop();
    }
  }

  public unlock(restart = true): void {
    this.isLocked = false;
    if (restart) {
      this.conductor.start();
    }
  }

  // ============================================================
  // スケーリング
  // ============================================================

  private initWindowScale(): void {
    this._fixedScaleWidth = this.config.width;
    this._fixedScaleHeight = this.config.height;

    let resizeTimer: number | null = null;
    window.addEventListener("resize", () => {
      if (resizeTimer != null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        this.onWindowResize();
      }, 100);
    });
    this.onWindowResize();

    window.addEventListener("fullscreenchange", () => {
      this.onFullscreenChange();
    });
    window.addEventListener("fullscreenerror", () => {
      this.onFullscreenChange();
    });
  }

  public get scaleMode(): ScaleMode {
    return this._scaleMode;
  }
  public set scaleMode(scaleMode: ScaleMode) {
    this._scaleModeBuffer = this._scaleMode;
    this._scaleMode = scaleMode;

    if (this._scaleMode === ScaleMode.FULLSCREEN) {
      if (!this.isFullscreen) {
        this.requestFullscreen();
      }
    } else {
      if (this.isFullscreen) {
        this.cancelFullscreen();
      }
    }

    this.onWindowResize();
  }

  private get isFullscreen(): boolean {
    const doc: any = window.document;
    return (
      (doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) !=
      null
    );
  }

  private requestFullscreen(): void {
    const elm: any = window.document.documentElement;
    const requestFullscreen =
      elm.requestFullscreen || elm.mozRequestFullScreen || elm.webkitRequestFullScreen || elm.msRequestFullscreen;

    if (requestFullscreen) {
      requestFullscreen.call(elm);
    }
  }

  private cancelFullscreen(): void {
    const doc: any = window.document;
    const cancelFullscreen =
      doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (cancelFullscreen) {
      cancelFullscreen.call(doc);
    }
  }

  public onFullscreenChange(): void {
    // フルスクリーンの状態が変化したときの動作
    // scaleMode との整合性を取る
    if (this.isFullscreen && this.scaleMode !== ScaleMode.FULLSCREEN) {
      this.scaleMode = ScaleMode.FULLSCREEN;
    } else if (!this.isFullscreen && this.scaleMode === ScaleMode.FULLSCREEN) {
      this.scaleMode = this._scaleModeBuffer;
    }
  }

  public get fixedScaleWidth(): number {
    return this._fixedScaleWidth;
  }
  public get fixedScaleHeight(): number {
    return this._fixedScaleHeight;
  }

  public setFixedScaleSize(width: number, height: number): void {
    this._fixedScaleWidth = width;
    this._fixedScaleHeight = height;
    this.scaleMode = ScaleMode.FIXED;
    if ((window as any).electron) {
      (window as any).electron.setContentSize(width, height);
    }
  }

  public onWindowResize(): void {
    // 一度サイズを0にすることで、スクロールバーを非表示にしてから、サイズを測っている。
    // そうでないと、clientWidth/clientHeightの値がスクロールバー分小さくなる。
    this.setCanvasScale(0, 0);

    let scaleX = 1.0;
    let scaleY = 1.0;
    switch (this.scaleMode) {
      case ScaleMode.FIXED:
        if (
          this.parentElm.clientWidth >= this.fixedScaleWidth &&
          this.parentElm.clientHeight >= this.fixedScaleHeight
        ) {
          scaleX = this.fixedScaleWidth / this.config.width;
          scaleY = this.fixedScaleHeight / this.config.height;
        } else {
          scaleX = scaleY = this.getFitScale();
        }
        this.setCanvasScale(scaleX, scaleY);
        break;
      case ScaleMode.FIT:
      case ScaleMode.FULLSCREEN:
        scaleX = scaleY = this.getFitScale();
        this.setCanvasScale(scaleX, scaleY);
        break;
    }
  }

  private getFitScale(): number {
    return Math.min(this.parentElm.clientWidth / this.config.width, this.parentElm.clientHeight / this.config.height);
  }

  public setCanvasScale(scaleX: number, scaleY: number): void {
    const width = this.config.width * scaleX;
    const height = this.config.height * scaleY;
    const transform = `scale(${scaleX},${scaleY})`;
    const left = (this.parentElm.clientWidth - width) / 2 + "px";
    const top = (this.parentElm.clientHeight - height) / 2 + "px";
    document.querySelectorAll(".ponkan-scale-target").forEach((elm: any) => {
      if (elm.style != null) {
        elm.style.position = "absolute";
        elm.style.transform = transform;
        elm.style["transform-origin"] = "0 0";
        elm.style.left = left;
        elm.style.top = top;
      }
    });
  }

  // ============================================================
  // 描画・更新ループ等のゲーム基礎部分
  // ============================================================

  private updateLoop(): void {
    try {
      if (!this.updateLoopFlag) {
        return;
      }
      const tick: number = Date.now();
      this.update(tick);
      this.updateLoopTimer = window.setTimeout(() => this.updateLoop(), 1);
    } catch (e) {
      console.error(e);
      this.error(e);
    }
  }

  private drawLoop(): void {
    try {
      if (!this.drawLoopFlag) {
        return;
      }
      const tick: number = Date.now();

      if (tick - this.fpsPreTick >= 1000) {
        this.fps = this.fpsCount;
        this.fpsPreTick = tick;
        this.fpsCount = 0;
      }

      this.beforeDraw(tick);
      if (this.transManager.isRunning) {
        this.transManager.draw(tick);
      } else {
        this.renderer.draw();
      }
      this.afterDraw(tick);

      if (this.updateScreenShotFlag) {
        this.screenShot.draw(this.renderer.canvasElm);
      }

      this.fpsCount++;
      this.drawLoopTimer = window.requestAnimationFrame(() => this.drawLoop());
    } catch (e) {
      console.error(e);
      this.error(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected update(tick: number): void {
    // should to override
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected beforeDraw(tick: number): void {
    // should to override
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected afterDraw(tick: number): void {
    // should to override
  }

  public error(e: Error): void {
    Logger.error(e);
    alert(e.message);
  }

  // ============================================================
  // コンダクタ関係
  // ============================================================

  public get conductor(): Conductor {
    return this.conductorStack[this.conductorStack.length - 1];
  }

  public get mainConductor(): Conductor {
    return this.conductorStack[0];
  }

  /**
   * サブルーチンを呼び出す。
   * @param file 移動先ファイル
   * @param label 移動先ラベル
   */
  public async callSubroutine(filePath: string | null, label: string | null = null, countPage = false): Promise<void> {
    if (filePath == null) {
      filePath = this.conductor.script.filePath;
    }
    const subConductor = new Conductor(this.resource, `Sub Conductor ${this.conductorStack.length}`, this);
    this.conductorStack.push(subConductor);
    return this.conductor.jump(filePath, label, countPage);
  }

  /**
   * サブルーチンから戻る
   * @param forceStart 強制的にpb, lb, waitclickを終わらせるかどうか
   * @param countPage 既読処理をするかどうか
   */
  public returnSubroutine(forceStart = false, countPage = true): "continue" | "break" {
    if (this.conductorStack.length === 1) {
      throw new Error("returnで戻れませんでした。callとreturnの対応が取れていません");
    }

    // return前のシナリオの既読を済ませる
    if (countPage) {
      this.conductor.passLatestSaveMark();
    }

    // console.log("BEFORE ", this.conductor.name, this.conductor.status);
    this.conductorStack.pop();
    this.onReturnSubroutin(forceStart);
    if (forceStart) {
      const latestTag = this.conductor.script.getLatestTag();
      if (latestTag != null && latestTag.name !== "s") {
        this.conductor.clearAllEventHandler();
        this.conductor.start();
      }
    }
    this.conductor.trigger("return_subroutin");
    // console.log("AFTER", this.conductor.name, this.conductor.status);
    this.onChangeStable(this.conductor.isStable);
    return "break";
  }

  public goToMainConductor(): void {
    while (this.conductorStack.length > 1) {
      const c = this.conductorStack.pop();
      if (c != null) {
        c.stop();
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onTag(tag: Tag, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onLabel(labelName: string, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSaveMark(saveMarkName: string, comment: string, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onChangeStable(isStable: boolean): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onReturnSubroutin(forceStart = false): void {
    return;
  }

  public onError(e: Error): void {
    this.error(e);
  }

  // ============================================================
  // レイヤー関係
  // ============================================================

  public addForePrimaryLayer(layer: BaseLayer): BaseLayer {
    this.forePrimaryLayers.push(layer);
    this.renderer.addToFore(layer.container);
    return layer;
  }

  public addBackPrimaryLayer(layer: BaseLayer): BaseLayer {
    this.backPrimaryLayers.push(layer);
    this.renderer.addToBack(layer.container);
    return layer;
  }

  public removeForePrimaryLayer(layer: BaseLayer): void {
    this.forePrimaryLayers = this.forePrimaryLayers.filter((a) => a !== layer);
    this.renderer.removeFromFore(layer.container);
  }

  public removeBackPrimaryLayer(layer: BaseLayer): void {
    this.backPrimaryLayers = this.backPrimaryLayers.filter((a) => a !== layer);
    this.renderer.removeFromBack(layer.container);
  }

  public flip(): void {
    this.flipPrimaryLayers();
    this.resetPrimaryLayersRenderer();
  }

  /**
   * レイヤの表と裏を入れ替える。
   * レンダラーの入れ替えは実施しないため、これまで裏ページだったものが画面に表示される状態となる。
   * トランジションが終わったらresetPrimaryLayersRendererを呼び、
   * レンダラーとの紐付けを正しい状態に戻すこと。
   */
  public flipPrimaryLayers(): void {
    const tmp = this.forePrimaryLayers;
    this.forePrimaryLayers = this.backPrimaryLayers;
    this.backPrimaryLayers = tmp;
  }

  /**
   * レンダラーの再設定
   */
  public resetPrimaryLayersRenderer(): void {
    // レンダラーとの紐付けを解除
    this.forePrimaryLayers.forEach((fore) => {
      fore.container.parent.removeChild(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      back.container.parent.removeChild(back.container);
    });
    // 新しくレンダラーに紐付ける
    this.forePrimaryLayers.forEach((fore) => {
      this.renderer.addToFore(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.renderer.addToBack(back.container);
    });
  }

  public lockScreenShot(): void {
    this.updateScreenShotFlag = false;
  }

  public unlockScreenShot(): void {
    this.updateScreenShotFlag = true;
  }

  /**
   * トランジション完了時にTransManagerから呼ばれる。
   * この時点で表ページ・裏ページの入れ替えは完了している。
   */
  public onCompleteTrans(): boolean {
    this.conductor.trigger("trans");
    return true;
  }

  // ============================================================
  // ブラウザイベント関係
  // ============================================================

  private initWindowEvent(): void {
    const handlers: any = (this.eventHandlers.window = {});
    window.addEventListener(
      "unload",
      (handlers.unload = (): void => {
        this.onWindowClose();
      }),
    );
    window.addEventListener(
      "beforeunload",
      (handlers.beforeunload = (): void => {
        this.onWindowClose();
      }),
    );
    window.addEventListener(
      "blur",
      (handlers.beforeunload = (): void => {
        this.onWindowBlur();
      }),
    );
  }

  public onWindowClose(): boolean {
    return true;
  }

  public onWindowBlur(): boolean {
    return true;
  }

  private removeEvents(): void {
    const removeFromHandlers = (handlers: any): void => {
      Object.keys(handlers).forEach((key) => {
        window.removeEventListener(key, handlers[key]);
      });
    };

    if (this.eventHandlers != null) {
      Object.keys(this.eventHandlers).forEach((key) => {
        removeFromHandlers(this.eventHandlers[key]);
      });
    }
  }

  private initMouseEventOnCanvas(canvas: HTMLCanvasElement): void {
    const handlers: any = (this.eventHandlers.mouse = {});
    canvas.addEventListener(
      "mouseenter",
      (handlers.mouseenter = (e: MouseEvent): boolean => {
        try {
          e.preventDefault();
          if (this.isLocked) {
            return true;
          }
          this.onMouseEnter(new PonMouseEvent(e));
        } catch (ex) {
          this.error(ex);
        }
        return true;
      }),
    );
    canvas.addEventListener(
      "mouseleave",
      (handlers.mouseleave = (e: MouseEvent): boolean => {
        try {
          e.preventDefault();
          if (this.isLocked) {
            return true;
          }
          this.onMouseLeave(new PonMouseEvent(e));
          return true;
        } catch (ex) {
          this.error(ex);
          return true;
        }
      }),
    );
    canvas.addEventListener(
      "wheel",
      (handlers.wheel = (e: Event): boolean => {
        try {
          e.preventDefault();
          if (this.isLocked) {
            return true;
          }
          this.onMouseWheel(new PonWheelEvent(e as WheelEvent));
        } catch (ex) {
          this.error(ex);
        }
        return true;
      }),
    );
    canvas.addEventListener(
      "click",
      (handlers.click = (e: MouseEvent): boolean => {
        e.preventDefault();
        return true;
      }),
    );
    canvas.addEventListener(
      "contextmenu",
      (handlers.contextmenu = (e: MouseEvent): boolean => {
        e.preventDefault();
        return true;
      }),
    );
    // touchmove or mousemove
    if ("ontouchmove" in canvas) {
      (canvas as HTMLCanvasElement).addEventListener(
        "touchmove",
        (handlers.touchmove = (e: TouchEvent): boolean => {
          try {
            e.preventDefault();
            if (this.isLocked) {
              return true;
            }
            this.onMouseMove(this.convertTouchEventToMouseEvent(e));
          } catch (ex) {
            this.error(ex);
          }
          return true;
        }),
      );
    } else {
      (canvas as HTMLCanvasElement).addEventListener(
        "mousemove",
        (handlers.mousemove = (e: MouseEvent): boolean => {
          try {
            e.preventDefault();
            if (this.isLocked) {
              return true;
            }
            this.onMouseMove(new PonMouseEvent(e));
          } catch (ex) {
            this.error(ex);
          }
          return true;
        }),
      );
    }
    // touchstart or mousedown
    if ("ontouchstart" in canvas) {
      (canvas as HTMLCanvasElement).addEventListener(
        "touchstart",
        (handlers.touchstart = (e: TouchEvent): boolean => {
          try {
            e.preventDefault();
            if (this.isLocked) {
              return true;
            }
            this.onMouseDown(this.convertTouchEventToMouseEvent(e));
          } catch (ex) {
            this.error(ex);
          }
          return true;
        }),
      );
    } else {
      (canvas as HTMLCanvasElement).addEventListener(
        "mousedown",
        (handlers.mousedown = (e: MouseEvent): boolean => {
          try {
            e.preventDefault();
            if (this.isLocked) {
              return true;
            }
            this.onMouseDown(new PonMouseEvent(e));
          } catch (ex) {
            this.error(ex);
          }
          return true;
        }),
      );
    }
    // touchend or mouseup
    if ("ontouchend" in canvas) {
      (canvas as HTMLCanvasElement).addEventListener(
        "touchend",
        (handlers.touchend = (e: TouchEvent): boolean => {
          e.preventDefault();
          try {
            if (this.isLocked) {
              return true;
            }
            this.onMouseUp(this.convertTouchEventToMouseEvent(e));
          } catch (ex) {
            this.error(ex);
          }
          return true;
        }),
      );
    } else {
      (canvas as HTMLCanvasElement).addEventListener(
        "mouseup",
        (handlers.mouseup = (e: MouseEvent): boolean => {
          e.preventDefault();
          try {
            if (this.isLocked) {
              return true;
            }
            this.onMouseUp(new PonMouseEvent(e));
          } catch (ex) {
            this.error(ex);
          }
          return true;
        }),
      );
    }
  }

  private convertTouchEventToMouseEvent(e: TouchEvent): PonMouseEvent {
    const touch = e.changedTouches[e.changedTouches.length - 1];
    let x = touch.pageX - (touch.target as HTMLElement).offsetLeft;
    let y = touch.pageY - (touch.target as HTMLElement).offsetTop;
    const button = 0;
    // touchイベントの場合は拡大縮小を考慮
    const scale = this.getFitScale();
    x /= scale;
    y /= scale;
    try {
      return new PonMouseEvent(Math.floor(x), Math.floor(y), button);
    } catch (ex) {
      this.error(ex);
      return new PonMouseEvent(-1, -1, button);
    }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public onMouseEnter(e: PonMouseEvent): void {
    return;
  }
  public onMouseLeave(e: PonMouseEvent): void {
    return;
  }
  public onMouseMove(e: PonMouseEvent): void {
    return;
  }
  public onMouseDown(e: PonMouseEvent): void {
    return;
  }
  public onMouseUp(e: PonMouseEvent): void {
    return;
  }
  public onMouseWheel(e: PonWheelEvent): boolean {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  private initKeyboardEvent(): void {
    const handlers: any = (this.eventHandlers.keyboard = {});
    window.addEventListener(
      "keydown",
      (handlers.keydown = (e: KeyboardEvent): void => {
        try {
          if (this.isLocked) {
            return;
          }
          this.onKeyDown(new PonKeyEvent(e));
        } catch (ex) {
          this.error(ex);
        }
      }),
    );
    window.addEventListener(
      "keyup",
      (handlers.keyup = (e: KeyboardEvent): void => {
        try {
          if (this.isLocked) {
            return;
          }
          this.onKeyUp(new PonKeyEvent(e));
        } catch (ex) {
          this.error(ex);
        }
      }),
    );
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public onKeyDown(e: PonKeyEvent): boolean {
    return true;
  }
  public onKeyUp(e: PonKeyEvent): boolean {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
