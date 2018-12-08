import * as PIXI from 'pixi.js'

console.log("START Ponkan3")

class PonRenderer {
  private width: number;
  private height: number;
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer | null = null;
  private container: PIXI.Container | null = null;

  private testsprite: PIXI.Sprite | null = null;

  public constructor(parentElm: HTMLElement, width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, { backgroundColor: 0xFF000011 });
    parentElm.appendChild(this.renderer.view);

    this.container = new PIXI.Container();

    // テスト用
    let style = new PIXI.TextStyle({
      fontSize: 24,
      fontWeight: 'normal',
      fill: 0xffffff,
    })
    let sprite = new PIXI.Text("Hello PIXI.js", style);
    sprite.anchor.set(0)
    sprite.x = 0
    sprite.y = 0
    this.testsprite = sprite;
    this.container.addChild(sprite);
    // テスト用
  }

  public draw(tick: number) {
    if (this.renderer == null || this.container == null) return;
    if (this.testsprite != null) {
      this.testsprite.x++;
      this.testsprite.x = this.testsprite.x % 300;
    }
    this.renderer.render(this.container)
  }

  public get canvasElm(): HTMLCanvasElement {
    if (this.renderer == null || this.renderer.view == null)
      throw new Error(`Illegal access property. PonRenderer.canvasElm`)
    else
      return this.renderer.view;
  }
}

class PonMouseEvent {
  private _x: number;
  private _y: number;
  public get x(): number { return this._x; }
  public get y(): number { return this._y; }

  public constructor(x: number, y: number);
  public constructor(e: MouseEvent);
  public constructor(a: any, b?: number) {
    if (a instanceof MouseEvent) {
      this._x = a.offsetX;
      this._y = a.offsetY;
    } else if (a != null && b != null) {
      this._x = a;
      this._y = b;
    } else {
      this._x = 0;
      this._y = 0;
    }
  }
}

class PonGame {
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

let game: PonGame = new PonGame("game");
game.start()

console.log("END ponkan3")

