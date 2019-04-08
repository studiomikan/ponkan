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

export class PonGame implements IConductorEvent {
  public static readonly Logger = Logger;
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
    this.config = config;
    if (config.width == null || config.height == null) {
      config.width = 800;
      config.height = 450;
    }
    this.foreRenderer = new PonRenderer(elm, config.width, config.height);
    this.backRenderer = new PonRenderer(elm, config.width, config.height);
    this.backRenderer.canvasElm.style.display = "none";

    this.resource = new Resource(this, config.gameDataDir);

    this.transManager = new TransManager(this, this.resource);
    this.screenShot = new ScreenShot(config);

    this.initWindowEvent();
    this.initMouseEventOnCanvas();
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

  /**
   * レイヤの表と裏を入れ替える。
   * レンダラーの入れ替えも行うため、裏レイヤーで描画されるようになる。
   * トランジションが終わったらresetPrimaryLayersRendererを呼ぶこと。
   */
  public flipPrimaryLayers(): void {
    // 入れ替え
    let tmp1 = this.forePrimaryLayers;
    this.forePrimaryLayers = this.backPrimaryLayers;
    this.backPrimaryLayers = tmp1;
    // レンダラーとの紐付けを解除
    this.forePrimaryLayers.forEach((fore) => {
      this.foreRenderer.removeContainer(fore.container);
      this.backRenderer.removeContainer(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.backRenderer.removeContainer(back.container);
      this.foreRenderer.removeContainer(back.container);
    });
       // レンダラーに紐付ける
    this.forePrimaryLayers.forEach((fore) => {
      this.backRenderer.addContainer(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.foreRenderer.addContainer(back.container);
    });
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
    window.addEventListener('unload', () => {
      this.onWindowClose()
    })
    window.addEventListener('beforeunload', () => {
      this.onWindowClose()
    })
  }

  public onWindowClose(): boolean { return true; };

  private initMouseEventOnCanvas(): void {
    const canvas = this.foreRenderer.canvasElm;
    canvas.addEventListener("mouseenter", (e) => {
      try { if (this.isLocked) { return } this.onMouseEnter(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mouseleave", (e) => {
      try { if (this.isLocked) { return } this.onMouseLeave(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousemove", (e) => {
      try { if (this.isLocked) { return } this.onMouseMove(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousedown", (e) => {
      try { if (this.isLocked) { return } this.onMouseDown(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mouseup", (e) => {
      try { if (this.isLocked) { return } this.onMouseUp(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousewheel", (e) => {
      try { if (this.isLocked) { return } this.onMouseWheel(new PonWheelEvent(e as WheelEvent)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("contextmenu", (e) => {
      e.stopPropagation();
      e.preventDefault ();
      return false;
    });
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
