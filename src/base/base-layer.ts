import * as PIXI from 'pixi.js'
import { PonRenderer } from './pon-renderer'
import { PonSprite, PonSpriteCallback } from './pon-sprite'

export interface BaseLayerCallback {
}

export class BaseLayer implements PonSpriteCallback {
  private callbacks: BaseLayerCallback;
  protected _container: PIXI.Container;
  // protected _width: number = 32;
  // protected _height: number = 32;
  // protected _visible: boolean = false;
  public backgroundSprite: PonSprite;
  public textSprites: PonSprite[] = [];

  private textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: 'normal',
    fill: 0xffffff,
  });

  public get container(): PIXI.Container{ return this._container; }
  public get x(): number { return this.container.x; }
  public set x(x) { this.container.x = x; }
  public get y(): number { return this.container.y; }
  public set y(y) { this.container.y = y; }
  public get width(): number { return this.container.width; }
  public set width(width: number) { this.container.width = width; }
  public get height(): number { return this.container.height; }
  public set height(height: number) { this.container.height = height; }
  public get visible(): boolean { return this.container.visible; }
  public set visible(visible: boolean) { this.container.visible = visible; }

  public constructor(callbacks: BaseLayerCallback) {
    this.callbacks = callbacks;
    this._container = new PIXI.Container();

    this.backgroundSprite = new PonSprite(this);
    let bg = this.backgroundSprite;
    bg.width = 100;
    bg.height = 100;
    bg.fillColor(0xFF0000, 1.0);
    this.width = 100;
    this.height = 100;
    this.x = 100;
    this.y = 100;
  }

  public destroy() {
    // 破棄処理
  }

  public pixiContainerAddChild(sprite: PIXI.DisplayObject) { this._container.addChild(sprite); }
  public pixiContainerRemoveChild(sprite: PIXI.DisplayObject) { this._container.removeChild(sprite); }

  public setBackgoundColor(color: number, alpha: number) {
  }

  public addChar(ch: string) {
  }

  public clearText() {
  }

}

