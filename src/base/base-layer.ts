import * as PIXI from 'pixi.js';
import { Logger } from './logger';
import { Resource, LoadImageCallbacks } from './resource'
import { PonSprite, PonSpriteCallback } from './pon-sprite';

export interface BaseLayerCallback {
}

/**
 * 基本レイヤ。PIXI.Containerをラップしたもの
 */
export class BaseLayer implements PonSpriteCallback {
  /** リソース */
  private r: Resource;
  /** コールバック */
  private callbacks: BaseLayerCallback;
  /** スプライト表示用コンテナ */
  protected _container: PIXI.Container;
  /** レイヤサイズでクリッピングするためのマスク */
  protected maskSprite: PIXI.Sprite;

  /** 背景色用スプライト */
  protected backgroundSprite: PonSprite;
  /** 読み込んでいる画像 */
  protected image: HTMLImageElement | null = null;
  /** 画像用スプライト */
  protected imageSprite: PonSprite | null = null;

  // 文字関係
  protected textSprites: PonSprite[] = [];
  protected textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: 'normal',
    fill: 0xffffff,
  });
  protected textMarginTop: number = 10;
  protected textMarginRight: number  = 10;
  protected textMarginBottom: number  = 10;
  protected textMarginLeft: number  = 10;
  /** 次の文字を描画する予定の位置。予定であって、自動改行等が発生した場合は次の行になるため注意。 */
  protected textX: number  = this.textMarginLeft;
  /** 次の文字を描画する予定の位置。予定であって、自動改行等が発生した場合は次の行になるため注意。 */
  protected textY: number  = this.textMarginTop;
  protected textLineHeight: number  = 24;
  protected textLinePitch: number  = 5;
  protected textAutoReturn: boolean = true;
  protected textIndentPoint: number = 0;

  public get container(): PIXI.Container{ return this._container; }
  public get x(): number { return this.container.x; }
  public set x(x) { this.container.x = x; }
  public get y(): number { return this.container.y; }
  public set y(y) { this.container.y = y; }
  public get width(): number { return this.container.width; }
  public set width(width: number) { this.container.width = this.maskSprite.width = this.backgroundSprite.width = width; }
  public get height(): number { return this.container.height; }
  public set height(height: number) { this.container.height = this.maskSprite.height = this.backgroundSprite.height = height; }
  public get visible(): boolean { return this.container.visible; }
  public set visible(visible: boolean) { this.container.visible = visible; }
  public get alpha(): number { return this.container.alpha; }
  public set alpha(alpha: number) { this.container.alpha = alpha; }

  public constructor(r: Resource, callbacks: BaseLayerCallback) {
    this.r = r;
    this.callbacks = callbacks;

    this._container = new PIXI.Container();
    this._container.width = 32;
    this._container.height = 32;

    this.maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.maskSprite.width = 32;
    this.maskSprite.height = 32;
    this.container.addChild(this.maskSprite);
    this.container.mask = this.maskSprite;

    this.backgroundSprite = new PonSprite(this);

    Logger.debug("new layer =>", this);
  }

  /**
   * 破棄
   */
  public destroy(): void {
    this.maskSprite.destroy();
    this.clearText();
  }

  public pixiContainerAddChild(sprite: PIXI.DisplayObject) { this._container.addChild(sprite); }
  public pixiContainerRemoveChild(sprite: PIXI.DisplayObject) { this._container.removeChild(sprite); }

  /**
   * 背景色を設定する
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public setBackgoundColor(color: number, alpha: number = 1.0): void {
    this.backgroundSprite.fillColor(color, alpha);
  }

  /**
   * レイヤにテキストを追加する
   */
  public addText(text: string): void {
    if (text == "") return;
    for (let i:number = 0; i < text.length; i++) {
      this.addChar(text[i]);
    }
  }

  /**
   * レイヤに1文字追加する
   */
  public addChar(ch: string): void {
    if (ch == "") return;
    if (ch.length > 1) {
    }
    if (ch == "\n" || ch == "\r") {
      this.addTextReturn();
      return;
    }
    let sp: PonSprite = new PonSprite(this);
    let fontSize: number = +this.textStyle.fontSize;
    sp.createText(ch, this.textStyle);
    
    if (this.textAutoReturn && (this.textX + sp.width + this.textMarginRight) > this.width) {
      // 文字がレイヤをはみ出すので、自動改行する。
      this.addTextReturn();
    }
    sp.x = this.textX;
    sp.y = this.textY + this.textLineHeight - fontSize;
    this.textX += sp.width;
  }

  /**
   * テキストを改行する
   */
  public addTextReturn(): void {
    if (this.textIndentPoint != 0)
      this.textX = this.textIndentPoint;
    else
      this.textX = this.textMarginLeft;
    this.textY += this.textLineHeight + this.textLinePitch;
  }

  /**
   * 現在のテキスト描画位置でインデントするように設定する
   */
  public setIndentPoint(): void {
    this.textIndentPoint = this.textX;
  }

  /**
   * テキストをクリアする。
   * 描画していたテキストは全削除される。
   * テキストの描画開始位置は初期化される。
   * インデント位置は初期化される。
   */
  public clearText(): void {
    this.textSprites.forEach((sp) => {
      sp.destroy();
    });
    this.textSprites = [];
    this.textX = this.textMarginLeft;
    this.textY = this.textMarginTop;
  }

  /**
   * 画像読み込み
   * @param filePath ファイルパス
   */
  public loadImage(filePath: string): void {
    this.freeImage();
    this.r.loadImage(filePath).done((image) => {
      Logger.debug("BaseLayer.loadImage success: ", image);
      this.image = image;
    }).fail(() => {
      Logger.debug("BaseLayer.loadImage fail: ");
    });
  }

  /**
   * 画像を開放する
   */
  public freeImage(): void {
    if (this.imageSprite != null) {
      this.imageSprite.destroy();
    }
    this.imageSprite = null;
    this.image = null;
  }

}
