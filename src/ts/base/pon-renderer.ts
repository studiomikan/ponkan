import * as PIXI from "pixi.js";

export class PonRenderer {
  private _width: number;
  private _height: number;
  private parentElm: HTMLElement;
  public readonly renderer: PIXI.Renderer;
  private _texture: PIXI.Texture;
  private _sprite: PIXI.Sprite;
  private _canvasElm: HTMLCanvasElement;

  public readonly primaryContainer: PIXI.Container;
  public readonly foreContainer: PIXI.Container;
  public readonly backContainer: PIXI.Container;

  public get width(): number {
    return this._width;
  }
  public get height(): number {
    return this._height;
  }
  public get canvasElm(): HTMLCanvasElement {
    return this._canvasElm;
  }
  public get texture(): PIXI.Texture {
    return this._texture;
  }
  public get sprite(): PIXI.Sprite {
    return this._sprite;
  }

  public constructor(parentElm: HTMLElement, width: number, height: number) {
    this._width = width;
    this._height = height;
    this.parentElm = parentElm;

    const renderer = new PIXI.Renderer({
      width: this._width,
      height: this._height,
      backgroundColor: 0xff000000,
      // transparent: true,
    });
    this.renderer = renderer;
    parentElm.appendChild(this.renderer.view);

    this._sprite = PIXI.Sprite.from(this.renderer.view);
    this._texture = this._sprite.texture;
    this._sprite.width = width;
    this._sprite.height = height;
    this._canvasElm = this.renderer.view;

    this.primaryContainer = new PIXI.Container();
    // const maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    // maskSprite.width = width;
    // maskSprite.height = height;
    // this.primaryContainer.addChild(maskSprite);
    // this.primaryContainer.mask = maskSprite;

    this.foreContainer = new PIXI.Container();
    this.backContainer = new PIXI.Container();
    this.backContainer.visible = false;

    this.primaryContainer.addChild(this.backContainer);
    this.primaryContainer.addChild(this.foreContainer);
  }

  private createContainer(width: number, height: number): PIXI.Container {
    const container = new PIXI.Container();
    const maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    maskSprite.width = width;
    maskSprite.height = height;
    container.addChild(maskSprite);
    container.mask = maskSprite;
    return container;
  }

  public destroy(): void {
    this.foreContainer.destroy();
    this.backContainer.destroy();
    this.parentElm.removeChild(this.renderer.view);
    this.renderer.destroy();
  }

  public draw(): void {
    if (this.renderer == null) {
      return;
    }
    this.renderer.render(this.primaryContainer);
  }

  public addToFore(container: PIXI.Container): void {
    this.foreContainer.addChild(container);
  }

  public addToBack(container: PIXI.Container): void {
    this.backContainer.addChild(container);
  }

  public removeFromFore(container: PIXI.Container): void {
    this.foreContainer.removeChild(container);
  }

  public removeFromBack(container: PIXI.Container): void {
    this.backContainer.removeChild(container);
  }

  public setBackVisible(visible: boolean): void {
    this.backContainer.visible = visible;
  }
}
