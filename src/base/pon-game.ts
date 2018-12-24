import * as PIXI from 'pixi.js'
import { PonRenderer } from './pon-renderer'
import { PonMouseEvent } from './pon-mouse-event'
import { PonSprite } from './pon-sprite'
import { BaseLayer, BaseLayerCallback } from './base-layer'

export class PonGame implements BaseLayerCallback {
  private parentElm: HTMLElement;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  public renderer: PonRenderer;
  private sprites: PonSprite[] = [];
  private layers: BaseLayer[] = [];

  public constructor(parentId: string) {
    let elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
    this.parentElm = elm;

    this.renderer = new PonRenderer(elm, 800, 450);

    this.initMouseEventOnCanvas();

    // テスト
    // let f = new PonSprite(this.renderer);
    // f.x = 100;
    // f.y = 100;
    // f.fillColor(0xFF0000, 1.0);
    //
    // let s = new PonSprite(this.renderer);
    // s.createText("HOGE");
    // s.x = 100;
    // s.y = 100;
    //
    let layer = new BaseLayer(this);
    this.addLayer(layer);
    layer.x = 100;
    layer.y = 100;
    layer.width = 200;
    layer.height = 200;
    layer.setBackgoundColor(0x808080, 1.0);

    layer.addText("あいうえおかきくけこさしすせそ");
    layer.alpha = 1;
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

    this.renderer.draw(tick)

    this.loopCount++;
    this.fpsCount++;
    window.requestAnimationFrame(() => this.loop());
  }

  public clearLayer() {
    this.layers.forEach((layer) => {
      layer.destroy();
      this.renderer.removeContainer(layer.container);
    });
    this.layers = [];
  }

  public addLayer(layer: BaseLayer) {
    // TODO make
    console.log(layer);
    this.layers.push(layer);
    this.renderer.addContainer(layer.container);
  }

  private initMouseEventOnCanvas(): void {
    let canvas = this.renderer.canvasElm;
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
