import * as PIXI from "pixi.js";
import { PonMouseEvent } from "./pon-mouse-event";
import { AsyncCallbacks } from "./async-callbacks";
import { Logger } from "./logger";
import { IPonSpriteCallbacks, PonSprite } from "./pon-sprite";
import { Resource } from "./resource";

// export interface IBaseLayerCallback {
//   onLoadImage(layer: BaseLayer, image: HTMLImageElement): void;
// }

/**
 * 基本レイヤ。PIXI.Containerをラップしたもの
 */
export class BaseLayer implements IPonSpriteCallbacks {
  /** リソース */
  private r: Resource;
  /** レイヤ名 */
  public name: string;

  /** スプライト表示用コンテナ */
  protected _container: PIXI.Container;
  /** レイヤサイズでクリッピングするためのマスク */
  protected maskSprite: PIXI.Sprite;

  /** 背景色用スプライト */
  protected backgroundSprite: PonSprite;
  protected _backgroundColor: number = 0x000000;
  protected _backgroundAlpha: number = 1.0;

  /** 読み込んでいる画像 */
  protected image: HTMLImageElement | null = null;
  /** 画像用スプライト */
  protected imageSprite: PonSprite | null = null;

  // 子レイヤ
  private _children: BaseLayer[] = [];

  // 文字関係
  protected textSprites: PonSprite[] = [];
  protected textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    // fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: "normal",
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

  public get children(): BaseLayer[] { return this._children; }
  public get container(): PIXI.Container { return this._container; }
  public get x(): number { return this.container.x; }
  public set x(x) { this.container.x = x; }
  public get y(): number { return this.container.y; }
  public set y(y) { this.container.y = y; }
  public get width(): number { return this.container.width; }
  public set width(width: number) {
    this.container.width = this.maskSprite.width = this.backgroundSprite.width = width;
  }
  public get height(): number { return this.container.height; }
  public set height(height: number) {
    this.container.height = this.maskSprite.height = this.backgroundSprite.height = height;
  }
  public get visible(): boolean { return this.container.visible; }
  public set visible(visible: boolean) { this.container.visible = visible; }
  public get alpha(): number { return this.container.alpha; }
  public set alpha(alpha: number) { this.container.alpha = alpha; }
  
  public get backgroundColor(): number { return this.backgroundColor; }
  public get backgroundAlpha(): number { return this.backgroundAlpha; }

  public get imageX(): number { return this.imageSprite === null ? 0 : this.imageSprite.x; }
  public set imageX(imageX: number) { if (this.imageSprite !== null) { this.imageSprite.x = imageX; } }
  public get imageY(): number { return this.imageSprite === null ? 0 : this.imageSprite.y; }
  public set imageY(imageY: number) { if (this.imageSprite !== null) { this.imageSprite.y = imageY; } }

  public constructor(name: string, r: Resource) {
    this.r = r;
    this.name = name;

    this._container = new PIXI.Container();
    this._container.width = 32;
    this._container.height = 32;

    this.maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.maskSprite.width = 32;
    this.maskSprite.height = 32;
    this.container.addChild(this.maskSprite);
    this.container.mask = this.maskSprite;

    this.backgroundSprite = new PonSprite(this, 0);

    Logger.debug("new layer =>", this);
  }

  /**
   * 破棄
   */
  public destroy(): void {
    this.maskSprite.destroy();
    this.backgroundSprite.destroy();
    if (this.imageSprite != null) { this.imageSprite.destroy(); }
    this.clearText();
    this.children.forEach((child) => {
      child.destroy();
    });
    this._children = [];
  }

  public pixiContainerAddChild(sprite: PIXI.DisplayObject, zIndex: number) {
    if (this._container.children.length <= zIndex) {
      this._container.addChild(sprite);
    } else {
      this._container.addChildAt(sprite, zIndex);
    }
  }

  public pixiContainerRemoveChild(sprite: PIXI.DisplayObject) {
    this._container.removeChild(sprite);
  }

  public addChild(childLayer: BaseLayer): BaseLayer {
    this.children.push(childLayer);
    this.container.addChild(childLayer.container);
    return childLayer;
  }

  public deleteChildLayer(childLayer: BaseLayer): void {
    const tmp: BaseLayer[] = [];
    this.children.forEach((child) => {
      if (child !== childLayer) {
        tmp.push(child);
      }
    });
    this._children = tmp;
  }

  public child(index: number): BaseLayer {
    return this.children[index];
  }

  public update(tick: number): void {
    this.children.forEach((child) => {
      child.update(tick);
    });
  }

  /**
   * 座標が、指定の子レイヤーの内側かどうかを調査する
   */
  protected isInsideOfChildLayer(child: BaseLayer, x: number, y: number): boolean {
    let top: number = child.y;
    let right: number = child.x + child.width;
    let bottom: number = child.y + child.height;
    let left: number = child.x;
    return left <= x && x <= right && top <= y && y <= bottom;
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    console.log("onMouseEnter", this.name, e);
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    console.log("onMouseLeave", this.name, e);
    return true;
  }

  /** onMouseEnter等を発生させるためのバッファ */
  protected isInsideBuffer: boolean = false;
  public onMouseMove(e: PonMouseEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      let child: BaseLayer = this.children[i];
      let isInside = this.isInsideOfChildLayer(child, e.x, e.y)
      let result: boolean = true;
      // 子レイヤーのonMouseEnter/onMouseLeaveを発生させる
      if (isInside != child.isInsideBuffer) {
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y);
        result = isInside ? child.onMouseEnter(e2) : child.onMouseLeave(e2);
      }
      child.isInsideBuffer = isInside;
      if (!result) { return false; }
      // onMouseMove
      if (isInside) {
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y);
        if (!child.onMouseMove(e2)) { return false; }
      }
      child.isInsideBuffer = isInside;
      if (!result) { return false; }
    }
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      let child: BaseLayer = this.children[i];
      if (this.isInsideOfChildLayer(child, e.x, e.y)) {
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y);
        if (!child.onMouseDown(e2)) { return false; }
      }
    }
    console.log("onMouseDown", this.name, e);
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      let child: BaseLayer = this.children[i];
      if (this.isInsideOfChildLayer(child, e.x, e.y)) {
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y);
        if (!child.onMouseUp(e2)) { return false; }
      }
    }
    console.log("onMouseUp", this.name, e);
    return true;
  }

  /**
   * 背景色を設定する
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public setBackgoundColor(color: number, alpha: number = 1.0): void {
    this.backgroundSprite.fillColor(color, alpha);
    this._backgroundColor = color;
    this._backgroundAlpha = alpha;
  }

  /**
   * レイヤにテキストを追加する
   */
  public addText(text: string): void {
    if (text === "") { return; }
    for (let i = 0; i < text.length; i++) {
      this.addChar(text.charAt(i));
    }
  }

  /**
   * レイヤに1文字追加する
   */
  public addChar(ch: string): void {
    if (ch === "") { return; }
    if (ch.length > 1) {
      this.addText(ch);
      return;
    }
    if (ch === "\n" || ch === "\r") {
      this.addTextReturn();
      return;
    }
    const sp: PonSprite = new PonSprite(this, this.textSprites.length + 2);
    const fontSize: number = +this.textStyle.fontSize;
    this.textSprites.push(sp);
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
    if (this.textIndentPoint !== 0) {
      this.textX = this.textIndentPoint;
    } else {
      this.textX = this.textMarginLeft;
    }
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
   * 画像を読み込む。
   * 同時に、レイヤサイズを画像に合わせて変更する。
   * @param filePath ファイルパス
   */
  public loadImage(filePath: string): AsyncCallbacks {
    Logger.debug("BaseLayer.loadImage call: ", filePath);
    const cb = new AsyncCallbacks();

    this.freeImage();
    const width = this.width;
    const height = this.height;
    this.r.loadImage(filePath).done((image) => {
      Logger.debug("BaseLayer.loadImage success: ", image);
      this.image = <HTMLImageElement> image;
      this.imageSprite = new PonSprite(this, 1);
      this.imageSprite.setImage(image);
      this.width = image.width;
      this.height = image.height;
      this.imageX = 0;
      this.imageY = 0;
      cb.callDone(this);
    }).fail(() => {
      Logger.debug("BaseLayer.loadImage fail: ");
      cb.callFail(this);
    });

    return cb;
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
