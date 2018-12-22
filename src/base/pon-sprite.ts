import * as PIXI from 'pixi.js'
import { PonRenderer } from './pon-renderer'
import { BaseLayer } from './base-layer'

const DEFAULT_WIDTH: number = 32;
const DEFAULT_HEIGHT: number = 32;

export interface PonSpriteCallback {
  pixiContainerAddChild(child: PIXI.DisplayObject): void;
  pixiContainerRemoveChild(child: PIXI.DisplayObject): void;
}

export class PonSprite {
  private callbacks: PonSpriteCallback;
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = DEFAULT_WIDTH;
  private _height: number = DEFAULT_HEIGHT;
  private pixiSprite: PIXI.Text | PIXI.Sprite | PIXI.Graphics | null = null;

  public get x(): number { return this._x; }
  public set x(x) { this._x = x; if (this.pixiSprite != null) this.pixiSprite.x = x; }
  public get y(): number { return this._y; }
  public set y(y) { this._y = y; if (this.pixiSprite != null) this.pixiSprite.y = y; }
  public get width(): number { return this._width; }
  public set width(width) { this._width = width; if (this.pixiSprite != null) this.pixiSprite.width = width; }
  public get height(): number { return this._height; }
  public set height(height) { this._height = height; if (this.pixiSprite != null) this.pixiSprite.height = height; }

  public constructor(callbacks: PonSpriteCallback) {
    this.callbacks = callbacks;
    // this.renderer = renderer;
    // let sprite = new PIXI.Text("Hello PIXI.js", style);
    // sprite.anchor.set(0)
    // sprite.x = 0
    // sprite.y = 0
    // this.testsprite = sprite;
    // this.container.addChild(sprite);
  }

  public clear() {
    if (this.pixiSprite != null) this.callbacks.pixiContainerRemoveChild(this.pixiSprite);
    this.pixiSprite = null;
  }

  public initSprite() {
    if (this.pixiSprite == null) return;
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this.pixiSprite.width = this.width;
    this.pixiSprite.height = this.height;
  }

  /**
   * スプライトにテキストを描画する。
   * テキストが描画できるだけの十分なwidthとheightを指定しておく必要がある。
   * @param text 文字
   * @param style 描画スタイル
   */
  public createText(text: string, style: PIXI.TextStyle) {
    this.clear();
    this.pixiSprite = new PIXI.Text(text, style);
    this.initSprite();

    this.pixiSprite.anchor.set(0)
    this.callbacks.pixiContainerAddChild(this.pixiSprite);
  }

  /**
   * スプライトを単色で塗りつぶす。
   * これを使用する前に事前にスプライトの幅と高さを設定しておく必要がある。
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public fillColor(color: number, alpha: number) {
    this.clear();
    this.pixiSprite = new PIXI.Graphics();
    this.initSprite();

    this.pixiSprite.lineStyle(0);
    this.pixiSprite.beginFill(color, alpha);
    this.pixiSprite.drawRect(0, 0, this.width, this.height);
    this.callbacks.pixiContainerAddChild(this.pixiSprite);
  }

  public onUpdate(tick: number) {
  }

  public onDraw(tick: number) {
  }

}

