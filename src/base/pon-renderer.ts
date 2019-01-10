import * as PIXI from "pixi.js";

export class PonRenderer {
  private width: number;
  private height: number;
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  private _container: PIXI.Container;

  private testsprite: PIXI.Sprite | null = null;

  public get canvasElm(): HTMLCanvasElement { return this.renderer.view; }
  public get container(): PIXI.Container { return this._container; }

  public constructor(parentElm: HTMLElement, width: number, height: number) {
    this.width = width;
    this.height = height;

    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, { backgroundColor: 0xFF000011 });
    parentElm.appendChild(this.renderer.view);

    this._container = new PIXI.Container();

    // テスト用
    const style = new PIXI.TextStyle({
      fontSize: 24,
      fontWeight: "normal",
      fill: 0xffffff,
    });
    const sprite = new PIXI.Text("Hello PIXI.js", style);
    sprite.anchor.set(0);
    sprite.x = 0;
    sprite.y = 0;
    this.testsprite = sprite;
    this._container.addChild(sprite);
    // テスト用
  }

  public draw(tick: number) {
    if (this.renderer == null || this._container == null) { return; }
    if (this.testsprite != null) {
      this.testsprite.x++;
      this.testsprite.x = this.testsprite.x % 300;
    }
    this.renderer.render(this._container);
  }

  public addContainer(child: PIXI.Container) {
    this._container.addChild(child);
  }

  public removeContainer(child: PIXI.Container) {
    this._container.removeChild(child);
  }
}
