import * as PIXI from "pixi.js";

export class PonRenderer {
  private _width: number;
  private _height: number;
  private parentElm: HTMLElement;
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  private _texture: PIXI.Texture;
  private _sprite: PIXI.Sprite;
  private _container: PIXI.Container;

  private otherRenderer: PonRenderer | null = null;

  public get width(): number { return this._width; }
  public get height(): number { return this._height; }
  public get canvasElm(): HTMLCanvasElement { return this.renderer.view; }
  public get texture(): PIXI.Texture { return this._texture; }
  public get sprite(): PIXI.Sprite { return this._sprite; }
  public get container(): PIXI.Container { return this._container; }

  public constructor(parentElm: HTMLElement, width: number, height: number) {
    this._width = width;
    this._height = height;
    this.parentElm = parentElm;

    this.renderer = PIXI.autoDetectRenderer(this._width, this._height, { backgroundColor: 0xFF000011 });
    parentElm.appendChild(this.renderer.view);

    this._texture = PIXI.Texture.from(this.renderer.view);
    this._sprite = PIXI.Sprite.from(this._texture as any);

    this._container = new PIXI.Container();
  }

  public destroy() {
    this.container.destroy();
    this.parentElm.removeChild(this.renderer.view);
    this.renderer.destroy();
  }

  public draw(tick: number) {
    if (this.renderer == null || this._container == null) { return; }
    if (this.otherRenderer !== null) {
      this.otherRenderer.texture.update();
    }
    this.renderer.render(this._container);
  }

  public addContainer(child: PIXI.Container) {
    this._container.addChild(child);
  }

  public removeContainer(child: PIXI.Container) {
    this._container.removeChild(child);
  }

  public setOtherRenderer(renderer: PonRenderer) {
    this.delOtherRenderer();

    this.otherRenderer = renderer;
    this._container.addChild(renderer.sprite);
  }

  public delOtherRenderer() {
    if (this.otherRenderer !== null) {
      this._container.removeChild(this.otherRenderer.sprite);
    }
  }

}
