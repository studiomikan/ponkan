import * as PIXI from "pixi.js";

const DEFAULT_WIDTH = 32;
const DEFAULT_HEIGHT = 32;

/**
 * PonSpriteのコールバック
 */
export interface IPonSpriteCallbacks {
  /**
   * コンテナにスプライトを追加する
   * @param child 追加するスプライト
   */
  pixiContainerAddChild(child: PIXI.DisplayObject): void;
  /**
   * コンテナからスプライトを削除する
   * @param child 削除するスプライト
   */
  pixiContainerRemoveChild(child: PIXI.DisplayObject): void;
}

export enum SpriteType {
  Unknown = 0,
  Image,
  Color,
  // Text,
  Canvas,
}

/**
 * スプライト
 */
export class PonSprite {
  /** コールバック */
  private callbacks: IPonSpriteCallbacks;
  private _x: number = 0;
  private _y: number = 0;
  private _offsetX: number = 0;
  private _offsetY: number = 0;
  private _width: number = DEFAULT_WIDTH;
  private _height: number = DEFAULT_HEIGHT;
  private _scaleX: number = 1.0;
  private _scaleY: number = 1.0;
  private _visible: boolean = true;
  /** PIXIのスプライト */
  private pixiSprite: PIXI.Sprite | PIXI.Graphics | null = null;
  public type: SpriteType = SpriteType.Unknown;

  public get pixiDisplayObject(): PIXI.DisplayObject | null {
    return this.pixiSprite;
  }

  public get spriteType(): SpriteType {
    return this.type;
  }

  /** x座標 */
  public get x(): number {
    return this._x;
  }
  /** x座標 */
  public set x(x) {
    this._x = x;
    if (this.pixiSprite != null) {
      this.pixiSprite.x = x + this._offsetX;
    }
  }
  /** y座標 */
  public get y(): number {
    return this._y;
  }
  /** y座標 */
  public set y(y) {
    this._y = y;
    if (this.pixiSprite != null) {
      this.pixiSprite.y = y + this._offsetY;
    }
  }
  /** 幅 */
  public get width(): number {
    return this._width;
  }
  /** 幅 */
  public set width(width) {
    this._width = width;
    if (this.pixiSprite != null) {
      this.pixiSprite.width = width;
    }
  }
  /** 高さ */
  public get height(): number {
    return this._height;
  }
  /** 高さ */
  public set height(height) {
    this._height = height;
    if (this.pixiSprite != null) {
      this.pixiSprite.height = height;
    }
  }

  /** スケーリング x */
  public get scaleX(): number {
    return this._scaleX;
  }
  /** スケーリング x */
  public set scaleX(scaleX: number) {
    this._scaleX = scaleX;
    if (this.pixiSprite != null) {
      this.pixiSprite.scale.x = scaleX;
      this._width = this.pixiSprite.width;
    }
  }
  /** スケーリング y */
  public get scaleY(): number {
    return this._scaleY;
  }
  /** スケーリング y */
  public set scaleY(scaleY: number) {
    this._scaleY = scaleY;
    if (this.pixiSprite != null) {
      this.pixiSprite.scale.y = scaleY;
      this._height = this.pixiSprite.height;
    }
  }

  /** 表示状態 */
  public get visible(): boolean {
    return this._visible;
  }
  /** 表示状態 */
  public set visible(visible: boolean) {
    this._visible = visible;
    if (this.pixiSprite != null) {
      this.pixiSprite.visible = visible;
    }
  }

  /**
   * @param callbacks コールバック
   */
  public constructor(callbacks: IPonSpriteCallbacks) {
    this.callbacks = callbacks;
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
   * このスプライトの保持している座標、サイズ、表示状態などはクリアされず、
   * そのままの状態を保つ。
   */
  public clear(): void {
    try {
      if (this.pixiSprite != null) {
        this.callbacks.pixiContainerRemoveChild(this.pixiSprite);
        this.pixiSprite.destroy();
      }
      this.pixiSprite = null;
      this.type = SpriteType.Unknown;
      // this.inEffectTypes = [];
      // this.inEffectTime = 100;
      // this.inEffectStartTick = -1;
    } catch (e) {
      console.error(e);
      throw e;
    }
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
    this.pixiSprite.scale.x = this.scaleX;
    this.pixiSprite.scale.y = this.scaleY;
    this.callbacks.pixiContainerAddChild(this.pixiSprite);
    this.type = SpriteType.Color;
  }

  /**
   * スプライトの塗りつぶしをクリアする
   */
  public clearColor(): void {
    if (this.pixiSprite != null && this.pixiSprite instanceof PIXI.Graphics) {
      this.pixiSprite.clear();
      this.type = SpriteType.Unknown;
    }
  }

  /**
   * 画像を設定する
   * @param image 画像
   */
  public setImage(image: HTMLImageElement): void {
    this.clear();
    const texture: PIXI.Texture = PIXI.Texture.from(image);
    this.pixiSprite = new PIXI.Sprite(texture);
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this.pixiSprite.anchor.set(0);
    this.pixiSprite.scale.x = this.scaleX;
    this.pixiSprite.scale.y = this.scaleY;
    this._width = this.pixiSprite.width;
    this._height = this.pixiSprite.height;
    this.callbacks.pixiContainerAddChild(this.pixiSprite);
    this.type = SpriteType.Image;
  }

  /**
   * キャンバスを設定する
   * @param canvas キャンバス
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.clear();
    const texture: PIXI.Texture = PIXI.Texture.from(canvas);
    this.pixiSprite = new PIXI.Sprite(texture);
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this.pixiSprite.anchor.set(0);
    this.pixiSprite.scale.x = this.scaleX;
    this.pixiSprite.scale.y = this.scaleY;
    this._width = this.pixiSprite.width;
    this._height = this.pixiSprite.height;
    this.callbacks.pixiContainerAddChild(this.pixiSprite);
    this.type = SpriteType.Canvas;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public beforeDraw(tick: number): void {
    if (this.pixiSprite != null) {
      if (this.type === SpriteType.Canvas) {
        (this.pixiSprite as PIXI.Sprite).texture.update();
      }
    }
  }
}
