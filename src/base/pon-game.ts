import * as PIXI from 'pixi.js'
import { PonRenderer } from './pon-renderer'
import { PonMouseEvent } from './pon-mouse-event'

export class PonGame {
  private parentElm: HTMLElement;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  private ponRenderer: PonRenderer;

  public constructor(parentId: string) {
    let elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
    this.parentElm = elm;

    this.ponRenderer = new PonRenderer(elm, 800, 450);

    this.initMouseEventOnCanvas()
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
    if (!this.loopFlag) return;

    let tick: number = Date.now();

    if (tick - this.fpsPreTick >= 1000) {
      this.fps = this.fpsCount;
      this.fpsPreTick = tick;
      this.fpsCount = 0;
      console.log(this.fps);
    }

    this.ponRenderer.draw(tick)
    
    this.loopCount++;
    this.fpsCount++;
    window.requestAnimationFrame(() => this.loop());
  }

  private initMouseEventOnCanvas(): void {
    let canvas = this.ponRenderer.canvasElm;
    console.log(canvas);

    canvas.addEventListener("mouseenter", e => this.onMouseEnter(new PonMouseEvent(e)));
    canvas.addEventListener("mouseleave", e => this.onMouseLeave(new PonMouseEvent(e)));
    canvas.addEventListener("mousemove", e => this.onMouseMove(new PonMouseEvent(e)));
    canvas.addEventListener("mousedown", e => this.onMouseDown(new PonMouseEvent(e)));
    canvas.addEventListener("mouseup", e => this.onMouseUp(new PonMouseEvent(e)));
  }

  protected onMouseEnter(e: PonMouseEvent) {}
  protected onMouseLeave(e: PonMouseEvent) {}
  protected onMouseMove(e: PonMouseEvent) {}
  protected onMouseDown(e: PonMouseEvent) {}
  protected onMouseUp(e: PonMouseEvent) {}
}
