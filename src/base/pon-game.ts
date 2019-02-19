import * as PIXI from "pixi.js";
import { BaseLayer } from "./base-layer";
import { Logger } from "./logger";
import { PonMouseEvent } from "./pon-mouse-event";
import { PonRenderer } from "./pon-renderer";
import { PonEventHandler } from "./pon-event-handler";
import { Resource } from "./resource";
import { TransManager } from "./trans-manager";

export class PonGame {
  public readonly resource: Resource;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  public readonly foreRenderer: PonRenderer;
  public readonly backRenderer: PonRenderer;

  private forePrimaryLayers: BaseLayer[] = [];
  private backPrimaryLayers: BaseLayer[] = [];
  private drawBackFlg: boolean = true;

  public readonly transManager: TransManager;

  public get width(): number { return this.foreRenderer.width; }
  public get height(): number { return this.foreRenderer.height; }

  protected eventHandlers: any = {};

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
    // this.backRenderer.canvasElm.style.display = "none";
    
    this.resource = new Resource(this, "gamedata");

    this.transManager = new TransManager(this, this.resource);
    this.resource.loadTransRule("rule_around.png");

    this.initWindowEvent();
    this.initMouseEventOnCanvas();
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

  public flipPrimaryLayers(): void {
    // レンダラーとの紐付けを解除
    this.forePrimaryLayers.forEach((fore) => {
      this.foreRenderer.removeContainer(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.backRenderer.removeContainer(back.container);
    });

    // 新しくレンダラーに紐付ける
    this.forePrimaryLayers.forEach((fore) => {
      this.backRenderer.addContainer(fore.container);
    });
    this.backPrimaryLayers.forEach((back) => {
      this.foreRenderer.addContainer(back.container);
    });

    // 入れ替え
    let tmp1 = this.forePrimaryLayers;
    this.forePrimaryLayers = this.backPrimaryLayers;
    this.backPrimaryLayers = tmp1;
  }

  public addEventHandler(handler: PonEventHandler): void {
    let eventName: string = handler.eventName;
    if (this.eventHandlers[eventName] == null) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
  }

  public trigger(eventName: string, receiver: any): void {
    let handlers: PonEventHandler[] = this.eventHandlers[eventName];
    if (handlers == null) { return; }
    handlers.forEach((h) => {
      Logger.debug("FIRE! ", eventName, h, receiver);
      h.fire(receiver);
    });
    this.eventHandlers[eventName] = null;
  }

  public clearEventHandler(): void {
    this.eventHandlers = {};
  }

  private initWindowEvent(): void {
    window.addEventListener('unload', () => {
      this.onWindowClose()
    })
  }

  public onWindowClose(): boolean { return true; };

  private initMouseEventOnCanvas(): void {
    const canvas = this.foreRenderer.canvasElm;
    canvas.addEventListener("mouseenter", (e) => {
      try { this.onMouseEnter(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mouseleave", (e) => {
      try { this.onMouseLeave(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousemove", (e) => {
      try { this.onMouseMove(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mousedown", (e) => {
      try { this.onMouseDown(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
    canvas.addEventListener("mouseup", (e) => {
      try { this.onMouseUp(new PonMouseEvent(e)); }
      catch (ex) { this.error(ex); }
    });
  }

  public onMouseEnter(e: PonMouseEvent): boolean { return true; }
  public onMouseLeave(e: PonMouseEvent): boolean { return true; }
  public onMouseMove(e: PonMouseEvent): boolean { return true; }
  public onMouseDown(e: PonMouseEvent): boolean { return true; }
  public onMouseUp(e: PonMouseEvent): boolean { return true; }
}
