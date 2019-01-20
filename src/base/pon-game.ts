import * as PIXI from "pixi.js";
import { BaseLayer } from "./base-layer";
import { Logger } from "./logger";
import { PonMouseEvent } from "./pon-mouse-event";
import { PonRenderer } from "./pon-renderer";
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

  public constructor(parentId: string) {
    const elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
    this.resource = new Resource("gamedata");
    this.renderer = new PonRenderer(elm, 800, 450);

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

  public clearLayer() {
    this.layers.forEach((layer) => {
      layer.destroy();
      this.renderer.removeContainer(layer.container);
    });
    this.layers = [];
  }

  public addLayer(layer: any) {
    // console.log(layer);
    this.layers.push(layer);
    this.renderer.addContainer(layer.container);
    return layer;
  }

  private initMouseEventOnCanvas(): void {
    const canvas = this.renderer.canvasElm;
    console.log(canvas);

    canvas.addEventListener("mouseenter", (e) => this.onMouseEnter(new PonMouseEvent(e)));
    canvas.addEventListener("mouseleave", (e) => this.onMouseLeave(new PonMouseEvent(e)));
    canvas.addEventListener("mousemove", (e) => this.onMouseMove(new PonMouseEvent(e)));
    canvas.addEventListener("mousedown", (e) => this.onMouseDown(new PonMouseEvent(e)));
    canvas.addEventListener("mouseup", (e) => this.onMouseUp(new PonMouseEvent(e)));
  }

  public onMouseEnter(e: PonMouseEvent): boolean { return true; }
  public onMouseLeave(e: PonMouseEvent): boolean { return true; }
  public onMouseMove(e: PonMouseEvent): boolean { return true; }
  public onMouseDown(e: PonMouseEvent): boolean { return true; }
  public onMouseUp(e: PonMouseEvent): boolean { return true; }
}
