import * as PIXI from "pixi.js";
import { AsyncTask } from "./async-task";
import { AsyncCallbacks } from "./async-callbacks";
import { BaseLayer } from "./base-layer";
import { Logger } from "./logger";
import { Conductor, ConductorState, IConductorEvent } from "./conductor";
import { Tag } from "./tag";
import { PonMouseEvent } from "./pon-mouse-event";
import { PonWheelEvent } from "./pon-wheel-event";
import { PonKeyEvent } from "./pon-key-event";
import { PonRenderer } from "./pon-renderer";
import { PonEventHandler } from "./pon-event-handler";
import { Resource } from "./resource";
import { TransManager } from "./trans-manager";
import { ScreenShot } from "./screen-shot";

export enum ScaleMode {
  FIXED = 0,
  FIT,
}

export class PonGame implements IConductorEvent {
  public static ScaleMode = ScaleMode;

  public static readonly Logger = Logger;
  public readonly parentElm: HTMLElement;
  public config: any = {};
  public isLocked: boolean = false;

  public readonly resource: Resource;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  public readonly foreRenderer: PonRenderer;
  public readonly backRenderer: PonRenderer;

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
  public reserveScreenShotFlag: boolean = false;

  public get width(): number { return this.foreRenderer.width; }
  public get height(): number { return this.foreRenderer.height; }

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
    this.foreRenderer = new PonRenderer(elm, config.width, config.height);
    this.backRenderer = new PonRenderer(elm, config.width, config.height);

    elm.style.position = "relative";
    elm.style.display = "block";
    elm.style.padding = "0";
    // elm.style.width = config.width + "px";
    // elm.style.height = config.height + "px";
    // [this.foreRenderer.canvasElm, this.backRenderer.canvasElm].forEach((canvas: HTMLCanvasElement) => {
    //   canvas.style.display = "block";
    //   // // canvas.style.position = "absolute";
    //   // canvas.style.top = "0";
    //   // canvas.style.left = "0";
    // });
    this.foreRenderer.canvasElm.style.display = "block";
    this.backRenderer.canvasElm.style.display = "none";

    this.resource = new Resource(this, config.gameDataDir);

    this.transManager = new TransManager(this, this.resource);
    this.screenShot = new ScreenShot(config);

    this.initWindowScale();
    this.initWindowEvent();
    this.initMouseEventOnCanvas(this.foreRenderer.canvasElm);
    // this.initMouseEventOnCanvas(this.backRenderer.canvasElm);
    this.initKeyboardEvent();

    let mainConductor: Conductor = new Conductor(this.resource, "Main Conductor", this);
    this.conductorStack.push(mainConductor);
  }

  public destroy(): void {
    this.stop();
    this.foreRenderer.destroy();
    this.backRenderer.destroy();
  }

  public start(): void {
    this.stop();
    this.loopFlag = true;
    this.fpsPreTick = Date.now();
    window.setTimeout(() => { this.loop(); }, 60);
  }

  public stop(): void {
    this.loopFlag = false;
    this.loopCount = 0;
    this.fpsPreTick = 0;
    this.fpsCount = 0;
    this.fps = 0;
  }

  public lock(): void {
    this.isLocked = true;
  }

  public unlock(): void {
    this.isLocked = false;
  }

  //============================================================
  // スケーリング
  //============================================================

  // private windowResizeTimer: number = -1;
  private initWindowScale(): void {
    this._fixedScaleWidth = this.config.width;
    this._fixedScaleHeight = this.config.height;
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
    this.onWindowResize();
  }

  public get scaleMode(): ScaleMode { return this._scaleMode; }
  public set scaleMode(scaleMode: ScaleMode) {
    this._scaleMode = scaleMode;
    this.onWindowResize();
  }

  public get fixedScaleWidth(): number { return this._fixedScaleWidth; }
  public get fixedScaleHeight(): number { return this._fixedScaleHeight; }

  public setFixedScaleSize(width: number, height: number): void {
    this._fixedScaleWidth = width;
    this._fixedScaleHeight = height;
    this.scaleMode = ScaleMode.FIXED;
  }

  public onWindowResize(): void {
    let scaleX: number = 1.0;
    let scaleY: number = 1.0;
    switch (this.scaleMode) {
      case ScaleMode.FIXED:
        scaleX = this.fixedScaleWidth / this.config.width;
        scaleY = this.fixedScaleHeight / this.config.height;
        break;
      case ScaleMode.FIT:
        scaleX = scaleY = this.getFitScale();
        break;
    }
    this.setCanvasScale(scaleX, scaleY);
  }

  private getFitScale(): number {
    return Math.min(
      this.parentElm.clientWidth / this.config.width,
      this.parentElm.clientHeight / this.config.height);
  }

  public setCanvasScale(scaleX: number, scaleY: number): void {
    let width = this.config.width * scaleX;
    let height = this.config.height * scaleY;
    let left = ((this.parentElm.clientWidth - width) / 2) + "px";
    let top = ((this.parentElm.clientHeight - height) / 2) + "px";
    [this.foreRenderer.canvasElm, this.backRenderer.canvasElm].forEach((canvas: HTMLCanvasElement) => {
      canvas.style.transform = `scale(${scaleX},${scaleY})`;
      canvas.style.left = left;
      canvas.style.top = top;
    });
  }

  //============================================================
  // 描画・更新ループ等のゲーム基礎部分
  //============================================================

  private loop(): void {
    try {
      if (!this.loopFlag) { return; }
      const tick: number = Date.now();

      if (tick - this.fpsPreTick >= 1000) {
        this.fps = this.fpsCount;
        this.fpsPreTick = tick;
        this.fpsCount = 0;
        // console.log(this.fps);
      }

      this.update(tick);

      if (this.transManager.isRunning) {
        this.transManager.draw(tick);
      } else {
        this.backRenderer.draw(tick); // TODO 本来はここのback不要
        this.foreRenderer.draw(tick);
      }

      if (this.reserveScreenShotFlag) {
        this.screenShot.draw(this.foreRenderer.canvasElm);
        this.reserveScreenShotFlag = false;
      }

      this.loopCount++;
      this.fpsCount++;
      window.requestAnimationFrame(() => this.loop());
    } catch (e) {
      console.error(e);
      this.error(e);
    }
  }

  protected update(tick: number): void {
    // should to override
    // this.conductor.conduct(tick);
  }

  public error(e: Error): void {
    Logger.error(e);
    alert(e.message);
  }

  //============================================================
  // コンダクタ関係
  //============================================================

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
  public callSubroutine(
    filePath: string | null,
    label: string | null = null,
    countPage: boolean = false
  ): AsyncCallbacks {
    if (filePath == null) {
      filePath = this.conductor.script.filePath;
    }
    let subConductor = new Conductor(
      this.resource, `Sub Conductor ${this.conductorStack.length}`, this);
    this.conductorStack.push(subConductor);
    return this.conductor.jump(filePath, label, countPage);
  }

  /**
   * サブルーチンから戻る
   * @param forceStart 強制的にpb, lb, waitclickを終わらせるかどうか
   * @param countPage 既読処理をするかどうか
   */
  public returnSubroutine(forceStart: boolean = false, countPage: boolean = true): "continue" | "break" {
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
      this.conductor.clearAllEventHandler();
      this.conductor.start();
    }
    this.conductor.trigger("return_subroutin");
    // console.log("AFTER", this.conductor.name, this.conductor.status);
    this.onChangeStable(this.conductor.isStable);
    return "break";
  }

  public onLoadNewScript(labelName: string | null, countPage: boolean): void {
  }

  public onTag(tag: Tag, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  public onLabel(labelName: string, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  public onSaveMark(saveMarkName: string, comment: string, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  public onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break" {
    return "continue";
  }

  public onChangeStable(isStable: boolean): void {
  }

  public onReturnSubroutin(forceStart: boolean = false): void {
  }

  public onError(e: Error): void {
    this.error(e);
  }

  //============================================================
  // レイヤー関係
  //============================================================

  public clearLayer(): void {
    this.forePrimaryLayers.forEach((layer) => {
      layer.destroy();
      this.foreRenderer.removeContainer(layer.container);
    });
    this.forePrimaryLayers = [];
    this.backPrimaryLayers.forEach((layer) => {
      layer.destroy();
      this.backRenderer.removeContainer(layer.container);
    });
    this.backPrimaryLayers = [];
  }

  public addForePrimaryLayer(layer: BaseLayer): BaseLayer {
    this.forePrimaryLayers.push(layer);
    this.foreRenderer.addContainer(layer.container);
    return layer;
  }

  public addBackPrimaryLayer(layer: BaseLayer): BaseLayer {
    this.backPrimaryLayers.push(layer);
    this.backRenderer.addContainer(layer.container);
    return layer;
  }

  public removeForePrimaryLayer(layer: BaseLayer): void {
    this.forePrimaryLayers = this.forePrimaryLayers.filter(a => a != layer);
    this.foreRenderer.removeContainer(layer.container);
  }

  public removeBackPrimaryLayer(layer: BaseLayer): void {
    this.backPrimaryLayers = this.backPrimaryLayers.filter(a => a != layer);
    this.backRenderer.removeContainer(layer.container);
  }

  public flip(): void {
    this.flipPrimaryLayers();
    this.resetPrimaryLayersRenderer();
  }

  /**
   * レイヤの表と裏を入れ替える。
   * レンダラーの入れ替えは実施しないため、これまで裏レイヤーだったものが画面に表示される状態となる。
   * トランジションが終わったらresetPrimaryLayersRendererを呼び、
   * レンダラーとの紐付けを正しい状態に戻すこと。
   */
  public flipPrimaryLayers(): void {
    let tmp = this.forePrimaryLayers;
    this.forePrimaryLayers = this.backPrimaryLayers;
    this.backPrimaryLayers = tmp;
  }

  /**
   * レンダラーの再設定
   */
  public resetPrimaryLayersRenderer() {
    // レンダラーとの紐付けを解除
    this.forePrimaryLayers.forEach((fore) => {
      this.foreRenderer.removeContainer(fore.container);
      this.backRenderer.removeContainer(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.backRenderer.removeContainer(back.container);
      this.foreRenderer.removeContainer(back.container);
    });
    // 新しくレンダラーに紐付ける
    this.forePrimaryLayers.forEach((fore) => {
      this.foreRenderer.addContainer(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.backRenderer.addContainer(back.container);
    });
  }

  public reserveScreenShot(): void {
    this.reserveScreenShotFlag = true;
  }

  /**
   * トランジション完了時にTransManagerから呼ばれる。
   * この時点で表レイヤ・裏レイヤの入れ替えは完了している。
   */
  public onCompleteTrans(): boolean {
    this.conductor.trigger("trans");
    return true;
  }

  //============================================================
  // ブラウザイベント関係
  //============================================================

  private initWindowEvent(): void {
    window.addEventListener("unload", () => {
      this.onWindowClose()
    })
    window.addEventListener("beforeunload", () => {
      this.onWindowClose()
    })
  }

  public onWindowClose(): boolean { return true; };

  private initMouseEventOnCanvas(canvas: HTMLCanvasElement): void {
    // let move = "ontouchmove" in canvas ? "touchmove" : "mousemove";
    // let down = "ontouchstart" in canvas ? "touchstart" : "mousedown";
    // let up = "ontouchend" in canvas ? "touchend" : "mouseup";

    canvas.addEventListener("mouseenter", (e: MouseEvent) => {
      try { if (this.isLocked) { return } this.onMouseEnter(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mouseleave", (e: MouseEvent) => {
      try { if (this.isLocked) { return } this.onMouseLeave(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousewheel", (e: Event) => {
      try { if (this.isLocked) { return } this.onMouseWheel(new PonWheelEvent(e as WheelEvent)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousemove", (e: MouseEvent) => {
      try { if (this.isLocked) { return } this.onMouseMove(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousedown", (e: MouseEvent) => {
      try { if (this.isLocked) { return } this.onMouseDown(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });

    if ("ontouchend" in canvas) {
      (canvas as HTMLCanvasElement).addEventListener("touchend", (e: TouchEvent) => {
        let touch = e.changedTouches[e.changedTouches.length - 1]
        let x = touch.pageX - (touch.target as HTMLElement).offsetLeft;
        let y = touch.pageY - (touch.target as HTMLElement).offsetTop;
        let button = 0;
        // touchイベントの場合は拡大縮小を考慮
        if (this.scaleMode === ScaleMode.FIT) {
          let scale = this.getFitScale();
          x /= scale;
          y /= scale;
        }
        try { if (this.isLocked) { return } this.onMouseUp(new PonMouseEvent(x, y, button)); }
        catch (ex) { this.error(ex); }
      });
    } else  {
      (canvas as HTMLCanvasElement).addEventListener("mouseup", (e: MouseEvent) => {
        try { if (this.isLocked) { return } this.onMouseUp(new PonMouseEvent(e)); }
        catch (ex) { this.error(ex); }
      });
    }
  }

  public onMouseEnter(e: PonMouseEvent): boolean { return true; }
  public onMouseLeave(e: PonMouseEvent): boolean { return true; }
  public onMouseMove(e: PonMouseEvent): boolean { return true; }
  public onMouseDown(e: PonMouseEvent): boolean { return true; }
  public onMouseUp(e: PonMouseEvent): boolean { return true; }
  public onMouseWheel(e: PonWheelEvent): boolean { return true; }

  private initKeyboardEvent(): void {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      try { if (this.isLocked) { return } this.onKeyDown(new PonKeyEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      try { if (this.isLocked) { return } this.onKeyUp(new PonKeyEvent(e)); }
      catch (ex) { this.error(ex); }
    });
  }

  public onKeyDown(e: PonKeyEvent): boolean { return true; }
  public onKeyUp(e: PonKeyEvent): boolean { return true; }

}
