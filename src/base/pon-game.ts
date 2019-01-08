import * as PIXI from 'pixi.js'
import { Logger } from './logger';
import { Resource } from './resource'
import { PonRenderer } from './pon-renderer'
import { PonMouseEvent } from './pon-mouse-event'
import { BaseLayer, BaseLayerCallback } from './base-layer'

export class PonGame {
  protected parentElm: HTMLElement;
  protected resource: Resource;
  private loopFlag: boolean = false;
  private loopCount: number = 0;
  private fpsPreTick: number = 0;
  private fpsCount: number = 0;
  private fps: number = 0;
  private renderer: PonRenderer;
  private layers: BaseLayer[] = [];

  public constructor(parentId: string) {
    let elm: HTMLElement | null = document.getElementById(parentId);
    if (elm == null) {
      throw new Error(`Not found HTMLElement: ${parentId}`);
    }
    this.parentElm = elm;
    this.resource = new Resource('gamedata');
    this.renderer = new PonRenderer(elm, 800, 450);

    this.initMouseEventOnCanvas();

    // テスト
    let layer = new BaseLayer(this.resource, {
      onLoadImage: (layer: BaseLayer, image: HTMLImageElement) => {
        Logger.debug("OnLoadImage ", layer, image);
      }
    });
    this.addLayer(layer);
    layer.x = 100;
    layer.y = 100;
    layer.width = 200;
    layer.height = 200;
    layer.setBackgoundColor(0x808080, 1.0);
    layer.loadImage('okayu.jpg');

    layer.addText("あいうえおかきくけこさしすせそ");
    layer.addTextReturn();
    layer.addText("Hello PIXI.js");
    layer.alpha = 1;

    layer.loadImage('okayu.jpg');

    this.resource.loadScript('sample.pon').done((script) => {
      console.log("done callback");
      console.log(script);
    }).fail(() => {
      console.log("fail callback");
    });
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
      // console.log(this.fps);
    }

    this.update(tick);
    this.renderer.draw(tick)

    this.loopCount++;
    this.fpsCount++;
    window.requestAnimationFrame(() => this.loop());
  }

  protected update(tick: number): void {
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
