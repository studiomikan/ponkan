import * as PIXI from "pixi.js";
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
  public isLocked: boolean = false;

  public readonly resource: Resource;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  public readonly foreRenderer: PonRenderer;
  public readonly backRenderer: PonRenderer;

  // conductor
  protected _conductor: Conductor;
  public get conductor(): Conductor { return this._conductor; }

  // レイヤ
  private forePrimaryLayers: BaseLayer[] = [];
  private backPrimaryLayers: BaseLayer[] = [];

  public readonly transManager: TransManager;
  public readonly screenShot: ScreenShot;
  public reserveScreenShotFlag: boolean = false;

  public get width(): number { return this.foreRenderer.width; }
  public get height(): number { return this.foreRenderer.height; }

  // protected eventHandlers: any = {};
  // protected eventHandlersStack: Array<any> = [];

  public constructor(parentId: string, config: any = {}) {
    const elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
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

    this._conductor = new Conductor(this.resource, this);
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
  }

  public error(e: Error): void {
    Logger.error(e);
    alert(e.message);
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
    return true;
  }
  //
  // public addEventHandler(handler: PonEventHandler): void {
  //   let eventName: string = handler.eventName;
  //   if (this.eventHandlers[eventName] == null) {
  //     this.eventHandlers[eventName] = [];
  //   }
  //   this.eventHandlers[eventName].push(handler);
  // }
  //
  // /**
  //  * イベントハンドラの引き金を引く
  //  * @param eventName イベント名
  //  * @return イベントハンドラが1つ以上実行されればtrue
  //  */
  // public trigger(eventName: string): boolean {
  //   let handlers: PonEventHandler[] = this.eventHandlers[eventName];
  //   if (handlers == null) { return false; }
  //   this.clearEventHandlerByName(eventName);
  //   handlers.forEach((h) => {
  //     Logger.debug("FIRE! ", eventName, h);
  //     h.fire();
  //   });
  //   return true;
  // }
  //
  // public clearAllEventHandler(): void {
  //   this.eventHandlers = {};
  // }
  //
  // public clearEventHandler(eventHandler: PonEventHandler): void {
  //   Object.keys(this.eventHandlers).forEach((eventName) => {
  //     this.eventHandlers[eventName].forEach((eventHandler: PonEventHandler, index: number) => {
  //       if (eventHandler === eventHandler) {
  //         this.eventHandlers[eventName].splice(index, 1);
  //         return;
  //       }
  //     });
  //   });
  // }
  //
  // public clearEventHandlerByName(eventName: string): void {
  //   delete this.eventHandlers[eventName];
  // }
  //
  // public pushEventHandlers(): void {
  //   this.eventHandlersStack.push(this.eventHandlers);
  //   this.eventHandlers = {};
  //   console.log("push eventhandlers: ", JSON.stringify(this.eventHandlers));
  // }
  //
  // public popEventHandlers(): void {
  //   if (this.eventHandlersStack.length === 0) {
  //     throw new Error("Engine Error. eventHandlerStackの不正操作");
  //   }
  //   this.eventHandlers = this.eventHandlersStack.pop();
  //   console.log("pop eventhandlers: ", JSON.stringify(this.eventHandlers));
  // }

  private initWindowEvent(): void {
    window.addEventListener('unload', () => {
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
