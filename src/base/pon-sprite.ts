import * as PIXI from 'pixi.js'
import { PonRenderer } from './pon-renderer'
import { BaseLayer } from './base-layer'

const DEFAULT_WIDTH: number = 32;
const DEFAULT_HEIGHT: number = 32;

/**
 * PonSpriteのコールバック
 */
export interface PonSpriteCallbacks {
  /**
   * コンテナにスプライトを追加する
   * @param child 追加するスプライト
   */
  pixiContainerAddChild(child: PIXI.DisplayObject, zIndex: number): void;
  /**
   * コンテナからスプライトを削除する
   * @param child 削除するスプライト
   */
  pixiContainerRemoveChild(child: PIXI.DisplayObject): void;
}

/**
 * スプライト
 */
export class PonSprite {
  /** コールバック */
  private callbacks: PonSpriteCallbacks;
  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _width: number = DEFAULT_WIDTH;
  private _height: number = DEFAULT_HEIGHT;
  private _visible: boolean = true;
  /** PIXIのスプライト */
  private pixiSprite: PIXI.Text | PIXI.Sprite | PIXI.Graphics | null = null;

  /** x座標 */
  public get x(): number { return this._x; }
  /** x座標 */
  public set x(x) { this._x = x; if (this.pixiSprite != null) this.pixiSprite.x = x; }
  /** y座標 */
  public get y(): number { return this._y; }
  /** y座標 */
  public set y(y) { this._y = y; if (this.pixiSprite != null) this.pixiSprite.y = y; }
  /** 幅 */
  public get width(): number { return this._width; }
  /** 幅 */
  public set width(width) { this._width = width; if (this.pixiSprite != null) this.pixiSprite.width = width; }
  /** 高さ */
  public get height(): number { return this._height; }
  /** 高さ */
  public set height(height) { this._height = height; if (this.pixiSprite != null) this.pixiSprite.height = height; }
  /** 表示状態 */
  public get visible(): boolean { return this._visible; }
  /** 表示状態 */
  public set visible(visible: boolean) { this._visible = visible; if (this.pixiSprite != null) this.pixiSprite.visible != visible; }
  /** 表示順 */
  public get zIndex(): number { return this._zIndex; }
  /** 表示順 */
  public set zIndex(zIndex: number) { this._zIndex = zIndex; }

  /**
   * @param callbacks コールバック
   */
  public constructor(callbacks: PonSpriteCallbacks, zIndex: number) {
    this.callbacks = callbacks;
    this.zIndex = zIndex;
  }

  /**
   * 破棄
   */
  public destroy(): void {
    this.clear();
  }

  /**
   * スプライトをクリアする。
   * 内部で保持しているPIXIのスプライトを開放する。
   * このスプライトの保持している座標、サイズ、表示状態などはクリアされず、そのままの状態を保つ。
   */
  public clear(): void {
    if (this.pixiSprite != null) {
      this.callbacks.pixiContainerRemoveChild(this.pixiSprite);
      this.pixiSprite.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
    }
    this.pixiSprite = null;
  }

  /**
   * スプライトにテキストを描画する。
   * テキストに合わせて幅と高さは自動で設定される
   * @param text 文字
   * @param style 描画スタイル
   */
  public createText(text: string, style: PIXI.TextStyle): void {
    this.clear();
    this.pixiSprite = new PIXI.Text(text, style);
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this._width = this.pixiSprite.width;
    this._height = this.pixiSprite.height;

    this.pixiSprite.anchor.set(0)
    this.callbacks.pixiContainerAddChild(this.pixiSprite, this.zIndex);
  }

  /**
   * スプライトを単色で塗りつぶす。
   * これを使用する前に事前にスプライトの幅と高さを設定しておく必要がある。
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public fillColor(color: number, alpha: number): void {
    this.clear();
    this.pixiSprite = new PIXI.Graphics();
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this.pixiSprite.width = this.width;
    this.pixiSprite.height = this.height;

    this.pixiSprite.lineStyle(0);
    this.pixiSprite.beginFill(color, alpha);
    this.pixiSprite.drawRect(0, 0, this.width, this.height);
    this.callbacks.pixiContainerAddChild(this.pixiSprite, this.zIndex);
  } 

  /**
   * 画像を設定する
   */
  public setImage(image: HTMLImageElement): void {
    this.clear();
    let texture: PIXI.Texture = PIXI.Texture.from(image);
    this.pixiSprite = new PIXI.Sprite(texture);
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this.pixiSprite.width = image.width;
    this.pixiSprite.height = image.height;

    this.pixiSprite.anchor.set(0)
    this.callbacks.pixiContainerAddChild(this.pixiSprite, this.zIndex);
  }

  public onUpdate(tick: number): void {
  }

  public onDraw(tick: number): void {
  }

}

