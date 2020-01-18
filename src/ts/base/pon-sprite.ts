import * as PIXI from "pixi.js";
import { Ease } from "../base/util";

const DEFAULT_WIDTH = 32;
const DEFAULT_HEIGHT = 32;

// 日本語フォントの上部が見切れてしまう問題の対処
PIXI.TextMetrics.BASELINE_SYMBOL += "ぽン甘｜";

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
  Text,
  Canvas,
}

export type InEffectType = "alpha" | "move" | "alphamove";

enum InEffectState {
  Stop = 0,
  Run,
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
  private _textStyle: PIXI.TextStyle | null = null;
  private _textPitch: number = 0;
  /** PIXIのスプライト */
  private pixiSprite: PIXI.Text | PIXI.Sprite | PIXI.Graphics | null = null;
  private type: SpriteType = SpriteType.Unknown;

  private inEffectTypes: InEffectType[] = [];
  private inEffectOptions: any = {};
  private inEffectEase: "none" | "in" | "out" | "both" = "none";
  private inEffectState: InEffectState = InEffectState.Stop;
  private inEffectTime: number = 100;
  private inEffectStartTick: number = -1;

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

  /** テキスト */
  public get text(): string | null {
    if (this.pixiSprite !== null && this.textStyle !== null) {
      return (this.pixiSprite as PIXI.Text).text;
    } else {
      return null;
    }
  }
  /** テキストスタイル */
  public get textStyle(): PIXI.TextStyle | null {
    return this._textStyle;
  }
  /** テキストの文字間 */
  public get textPitch(): number {
    return this._textPitch;
  }
  /** テキストの横幅 */
  public get textWidth(): number {
    return this._width + this._textPitch;
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

  // public clone(callbacks: IPonSpriteCallbacks): PonSprite {
  //   let p = new PonSprite(callbacks);
  //
  //   p._x = this._x;
  //   p._y = this._y;
  //   p._width = this._width;
  //   p._height = this._height;
  //   p._visible = this._visible;
  //
  //
  //   if (this.pixiSprite !== null) {
  //     if (this.pixiSprite instanceof PIXI.Text) {
  //       if (this.textStyleVal !== null) {
  //         p.textStyleVal = this.textStyleVal.clone();
  //       }
  //     } else if (this.pixiSprite instanceof PIXI.Sprite) {
  //       p.pixiSprite = this.pixiSprite.clone();
  //     } else {
  //       p.pixiSprite = this.pixiSprite.clone();
  //     }
  //   } else {
  //     this.pixiSprite = null;
  //   }
  //
  //   return p;
  // }

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
      this.inEffectTypes = [];
      this.inEffectTime = 100;
      this.inEffectStartTick = -1;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * スプライトにテキストを描画する。
   * テキストに合わせて幅と高さは自動で設定される
   * @param text 文字
   * @param style 描画スタイル
   */
  public createText(text: string, style: PIXI.TextStyle, pitch: number): void {
    this.clear();
    this._textStyle = style.clone();
    this._textPitch = pitch;

    this.pixiSprite = new PIXI.Text(text, this._textStyle);
    this.pixiSprite.x = this.x;
    this.pixiSprite.y = this.y;
    this.pixiSprite.anchor.set(0);
    this.pixiSprite.scale.x = this.scaleX;
    this.pixiSprite.scale.y = this.scaleY;
    this._width = this.pixiSprite.width;
    this._height = this.pixiSprite.height;
    this.callbacks.pixiContainerAddChild(this.pixiSprite);
    this.type = SpriteType.Text;
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

  public copyTextFrom(src: PonSprite): void {
    if (src.type !== SpriteType.Text) {
      return;
    }
    const srcText = src.pixiSprite as PIXI.Text;
    this.createText(srcText.text, src.textStyle as PIXI.TextStyle, src.textPitch);
    this.x = src.x;
    this.y = src.y;
    this.copyEffectStateFrom(src);
  }

  private copyEffectStateFrom(src: PonSprite): void {
    this.inEffectTypes = src.inEffectTypes;
    this.inEffectOptions = src.inEffectOptions;
    this.inEffectEase = src.inEffectEase;
    this.inEffectState = src.inEffectState;
    this.inEffectStartTick = src.inEffectStartTick;
    this.inEffectTime = src.inEffectTime;
  }

  public initInEffect(types: InEffectType[], time: number, ease: "none" | "in" | "out" | "both", options: any): void {
    this.inEffectTypes = types;
    this.inEffectEase = ease;
    this.inEffectOptions = options;
    this.inEffectState = InEffectState.Run;
    this.inEffectStartTick = -1;
    this.inEffectTime = time;
    if (types.includes("move")) {
      if (options == null) {
        options = {};
      }
      if (options.offsetx == null) {
        options.offsetx = 0;
      }
      if (options.offsety == null) {
        options.offsety = 0;
      }
    }
  }

  public beforeDraw(tick: number): void {
    if (this.pixiSprite != null) {
      if (this.type === SpriteType.Canvas) {
        (this.pixiSprite as PIXI.Sprite).texture.update();
      }

      if (this.inEffectState === InEffectState.Run) {
        if (this.inEffectStartTick === -1) {
          this.inEffectStartTick = tick;
        }
        const elapsedTime = tick - this.inEffectStartTick;
        let phase = elapsedTime / this.inEffectTime;
        if (phase < 0) phase = 0;
        if (phase > 1) phase = 1;
        // easeの処理
        switch (this.inEffectEase) {
          case "in":
            phase = Ease.in(phase);
            break;
          case "out":
            phase = Ease.out(phase);
            break;
          case "both":
            phase = Ease.inOut(phase);
            break;
          // case 'none': phase = phase; break;
        }
        // エフェクトをかける
        if (this.inEffectTypes.includes("alpha")) {
          this.InEffectAlpha(this.pixiSprite, elapsedTime, phase);
        }
        if (this.inEffectTypes.includes("move")) {
          this.InEffectMove(this.pixiSprite, elapsedTime, phase);
        }
        if (elapsedTime >= this.inEffectTime) {
          this.inEffectState = InEffectState.Stop;
        }
      }
    }
  }

  private InEffectAlpha(sprite: PIXI.Container, elapsedTime: number, phase: number): void {
    sprite.alpha = phase;
  }

  private InEffectMove(sprite: PIXI.Container, elapsedTime: number, phase: number): void {
    this._offsetX = Math.floor(this.inEffectOptions.offsetx * (1 - phase));
    this._offsetY = Math.floor(this.inEffectOptions.offsety * (1 - phase));
    sprite.x = this._x + this._offsetX;
    sprite.y = this._y + this._offsetY;
  }
}
