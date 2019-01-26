import * as PIXI from "pixi.js";
import { BaseLayer } from "./base-layer";
import { Logger } from "./logger";
import { PonMouseEvent } from "./pon-mouse-event";
import { PonRenderer } from "./pon-renderer";
import { PonEventHandler } from "./pon-event-handler";
import { Resource } from "./resource";

export class PonGame {
  protected resource: Resource;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  protected renderer: PonRenderer;
  private layers: BaseLayer[] = [];

  public get width(): number { return this.renderer.width; }
  public get height(): number { return this.renderer.height; }

  protected eventHandlers: any = {};

  public constructor(parentId: string, config: any = {}) {
    const elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
    this.resource = new Resource("gamedata");

    if (config.width == null || config.height == null) {
      config.width = 800;
      config.height = 450;
    }
    this.renderer = new PonRenderer(elm, config.width, config.height);

    this.initMouseEventOnCanvas();
  }

  public destroy(): void {
    this.stop();
    this.renderer.destroy();
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
      this.renderer.draw(tick);

      this.loopCount++;
      this.fpsCount++;
      window.requestAnimationFrame(() => this.loop());
    } catch (e) {
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
    this.layers.forEach((layer) => {
      layer.destroy();
      this.renderer.removeContainer(layer.container);
    });
    this.layers = [];
  }

  public addLayer(layer: BaseLayer): BaseLayer {
    // console.log(layer);
    this.layers.push(layer);
    this.renderer.addContainer(layer.container);
    return layer;
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

  private initMouseEventOnCanvas(): void {
    const canvas = this.renderer.canvasElm;
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
