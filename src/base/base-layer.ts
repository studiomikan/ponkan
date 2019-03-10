import * as PIXI from "pixi.js";
import { PonGame } from "./pon-game";
import { PonMouseEvent } from "./pon-mouse-event";
import { AsyncCallbacks } from "./async-callbacks";
import { AsyncTask } from "./async-task";
import { Logger } from "./logger";
import { IPonSpriteCallbacks, PonSprite } from "./pon-sprite";
import { Resource } from "./resource";

/**
 * 基本レイヤ。PIXI.Containerをラップしたもの
 */
export class BaseLayer {
  /** レイヤ名 */
  public name: string;
  /** リソース */
  protected resource: Resource;
  /** 持ち主 */
  protected owner: PonGame;

  /** スプライト表示用コンテナ */
  protected _container: PIXI.Container;
  public get container(): PIXI.Container { return this._container; }
  /** レイヤサイズでクリッピングするためのマスク */
  protected maskSprite: PIXI.Sprite;

  /** 背景色用スプライト */
  protected backgroundSprite: PonSprite;
  protected hasBackgroundColor: boolean = false;
  protected _backgroundColor: number = 0x000000;
  protected _backgroundAlpha: number = 1.0;

  protected textContainer: PIXI.Container;
  protected textSpriteCallbacks: IPonSpriteCallbacks;

  protected childContainer: PIXI.Container;
  protected childSpriteCallbacks: IPonSpriteCallbacks;

  protected imageContainer: PIXI.Container;
  protected imageSpriteCallbacks: IPonSpriteCallbacks;

  /** 読み込んでいる画像 */
  protected image: HTMLImageElement | null = null;
  protected imageFilePath: string | null = null;
  /** 画像用スプライト */
  protected imageSprite: PonSprite | null = null;
  protected get imageWidth(): number { return this.image !== null ? this.image.width : 0; }
  protected get imageHeight(): number { return this.image !== null ? this.image.height : 0; }

  // 子レイヤ
  private _children: BaseLayer[] = [];

  // 文字関係
  protected textLines: PonSprite[][] = [[]];
  public textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: ["mplus-1p-regular", "monospace"],
    fontSize: 24,
    fontWeight: "normal",
    fill: 0xffffff,
    textBaseline: "alphabetic",
    dropShadow: false,
    dropShadowAlpha: 0.7,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 5,
    dropShadowColor: 0x000000,
    dropShadowDistance: 2,
    stroke: 0x000000,
    strokeThickness: 0,
  });
  public set textFontFamily(fontFamily: string[]) { this.textStyle.fontFamily = fontFamily; }
  public get textFontFamily(): string[] { 
    if (typeof this.textStyle.fontFamily === "string") {
      return [this.textStyle.fontFamily];
    } else {
      return this.textStyle.fontFamily;
    }
  }
  public set textFontSize(fontSize: number) {
    this.textStyle.fontSize = fontSize;
    if (this.textLineHeight < fontSize) { this.textLineHeight = fontSize; }
  }
  public get textFontSize(): number { return +this.textStyle.fontSize; }
  public set textFontWeight(fontWeight: string) { this.textStyle.fontWeight = fontWeight; }
  public get textFontWeight(): string { return this.textStyle.fontWeight; }
  public set textColor(color: number | string) { this.textStyle.fill = color; }
  public get textColor(): number | string {
    if (typeof this.textStyle.fill === "number") {
      return this.textStyle.fill;
    } else {
      return <string> this.textStyle.fill;
    }
  }
  public set textShadowVisible(visible: boolean) { this.textStyle.dropShadow = visible; }
  public get textShadowVisible(): boolean { return this.textStyle.dropShadow; }
  public set textShadowAlpha(alpha: number) { this.textStyle.dropShadowAlpha = alpha; }
  public get textShadowAlpha(): number { return this.textStyle.dropShadowAlpha; }
  public set textShadowAngle(angle: number) { this.textStyle.dropShadowAngle = angle; }
  public get textShadowAngle(): number { return this.textStyle.dropShadowAngle; }
  public set textShadowBlur(blur: number) { this.textStyle.dropShadowBlur = blur; }
  public get textShadowBlur(): number { return this.textStyle.dropShadowBlur; }
  public set textShadowColor(color: number | string) { this.textStyle.dropShadowColor = color; }
  public get textShadowColor(): number | string {
    if (typeof this.textStyle.dropShadowColor === "number") {
      return this.textStyle.dropShadowColor;
    } else {
      return <string> this.textStyle.dropShadowColor;
    }
  }
  public set textShadowDistance(distance: number) { this.textStyle.dropShadowDistance = distance; }
  public get textShadowDistance(): number { return this.textStyle.dropShadowDistance; }

  public set textEdgeColor(color: number | string) { this.textStyle.stroke = color; }
  public get textEdgeColor(): number | string {
    if (typeof this.textStyle.stroke === "number") {
      return this.textStyle.stroke;
    } else {
      return <string> this.textStyle.stroke;
    }
  }
  public set textEdgeWidth(width: number) { this.textStyle.strokeThickness = width; }
  public get textEdgeWidth(): number { return this.textStyle.strokeThickness; }

  public textMarginTop: number = 10;
  public textMarginRight: number  = 10;
  public textMarginBottom: number  = 10;
  public textMarginLeft: number  = 10;
  /** 次の文字を描画する予定の位置。予定であって、自動改行等が発生した場合は次の行になるため注意。 */
  public textX: number = NaN;
  /** 次の文字を描画する予定の位置。予定であって、自動改行等が発生した場合は次の行になるため注意。 */
  public textY: number = NaN;
  public textLineHeight: number  = 24;
  public textLinePitch: number  = 5;
  public textAutoReturn: boolean = true;
  public textIndentPoint: number = 0;
  public reservedTextIndentPoint: number = 0;
  public textAlign: "left" | "center" | "right" = "left";

  public get children(): BaseLayer[] { return this._children; }
  public get x(): number { return this.container.x; }
  public set x(x) { this.container.x = x; }
  public get y(): number { return this.container.y; }
  public set y(y) { this.container.y = y; }
  public get width(): number { return this.maskSprite.width; }
  public set width(width: number) {
    this.maskSprite.width = this.backgroundSprite.width = width;
  }
  public get height(): number { return this.maskSprite.height; }
  public set height(height: number) {
    this.maskSprite.height = this.backgroundSprite.height = height;
  }
  public get visible(): boolean { return this.container.visible; }
  public set visible(visible: boolean) { this.container.visible = visible; }
  public get alpha(): number { return this.container.alpha; }
  public set alpha(alpha: number) { this.container.alpha = alpha; }
  
  public get backgroundColor(): number { return this._backgroundColor; }
  public set backgroundColor(backgroundColor: number) {
    this.setBackgroundColor(backgroundColor, this._backgroundAlpha);
  }
  public set backgroundAlpha(backgroundAlpha: number) {
    this.setBackgroundColor(this._backgroundColor, backgroundAlpha);
  }
  public get backgroundAlpha(): number { return this._backgroundAlpha; }

  public get imageX(): number { return this.imageSprite === null ? 0 : this.imageSprite.x; }
  public set imageX(imageX: number) { if (this.imageSprite !== null) { this.imageSprite.x = imageX; } }
  public get imageY(): number { return this.imageSprite === null ? 0 : this.imageSprite.y; }
  public set imageY(imageY: number) { if (this.imageSprite !== null) { this.imageSprite.y = imageY; } }

  public constructor(name: string, resource: Resource, owner: PonGame) {
    this.name = name;
    this.resource = resource;
    this.owner = owner;

    this._container = new PIXI.Container();
    // this._container.width = 32;
    // this._container.height = 32;

    this.maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.maskSprite.width = 32;
    this.maskSprite.height = 32;
    this.container.addChild(this.maskSprite);
    this.container.mask = this.maskSprite;

    this.imageContainer = new PIXI.Container();
    this.container.addChild(this.imageContainer);
    this.imageSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.addChild(child);
      }, 
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.removeChild(child);
      }
    };

    this.backgroundSprite = new PonSprite(this.imageSpriteCallbacks);

    this.textContainer = new PIXI.Container();
    this.container.addChild(this.textContainer);
    this.textSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.textContainer.addChild(child);
      }, 
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.textContainer.removeChild(child);
      }
    };

    this.childContainer = new PIXI.Container();
    this.container.addChild(this.childContainer);
    this.childSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.childContainer.addChild(child);
      }, 
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.childContainer.removeChild(child);
      }
    };

    Logger.debug("new layer =>", this);
  }

  /**
   * 破棄
   */
  public destroy(): void {
    this.clearText();
    this.freeImage();
    this.maskSprite.destroy();
    this.backgroundSprite.destroy();
    if (this.imageSprite != null) { this.imageSprite.destroy(); }

    this.textContainer.destroy();
    this.imageContainer.destroy();
    this.childContainer.destroy();
    this.container.destroy();

    this.children.forEach((child) => {
      child.destroy();
    });
    this._children = [];
  }

  public addChild(childLayer: BaseLayer): BaseLayer {
    this.children.push(childLayer);
    this.container.addChild(childLayer.container);
    return childLayer;
  }

  /**
   * 子レイヤーを削除する。
   * 管理から削除されるだけで、レイヤー自体は初期化されたりしない。
   */
  public deleteChildLayer(childLayer: BaseLayer): void {
    const tmp: BaseLayer[] = [];
    this.children.forEach((child) => {
      if (child !== childLayer) {
        tmp.push(child);
      }
    });
    this._children = tmp;
  }

  /**
   * 子レイヤーをすべて削除する。
   * 管理から削除されるだけで、レイヤー自体は初期化されたりしない。
   */
  public deleteAllChildren(): void {
    this._children = [];
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
    // console.log("onMouseEnter", this.name, e);
    this.onMouseMove(e);
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    // console.log("onMouseLeave", this.name, e);
    this.onMouseMove(e);
    return true;
  }

  /** onMouseEnter等を発生させるためのバッファ */
  protected isInsideBuffer: boolean = false;
  public onMouseMove(e: PonMouseEvent): boolean {
    // 子レイヤーのonMouseEnter/onMouseLeaveを発生させる
    for (let i = this.children.length - 1; i >= 0; i--) {
      let child: BaseLayer = this.children[i];
      let isInside = this.isInsideOfChildLayer(child, e.x, e.y)
      let result: boolean = true;
      if (isInside != child.isInsideBuffer) {
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
        result = isInside ? child.onMouseEnter(e2) : child.onMouseLeave(e2);
      }
      child.isInsideBuffer = isInside;
      if (!result) { break; }
    }
    // mousemove
    for (let i = this.children.length - 1; i >= 0; i--) {
      let child: BaseLayer = this.children[i];
      let isInside = this.isInsideOfChildLayer(child, e.x, e.y)
      let result: boolean = true;
      if (isInside) {
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
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
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
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
        let e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
        if (!child.onMouseUp(e2)) { return false; }
      }
    }
    console.log("onMouseUp", this.name, e);
    return true;
  }

  public onChangeStable(isStable: boolean): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].onChangeStable(isStable);
    }
  }

  /**
   * 背景色を設定する
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public setBackgroundColor(color: number, alpha: number = 1.0): void {
    this.backgroundSprite.fillColor(color, alpha);
    this._backgroundColor = color;
    this._backgroundAlpha = alpha;
    this.hasBackgroundColor = true;
  }

  /**
   * 背景色をクリアする
   */
  public clearBackgroundColor(): void {
    this.backgroundSprite.clearColor();
    this.hasBackgroundColor = false;
  }

  public get currentTextLine(): PonSprite[] {
    return this.textLines[this.textLines.length - 1];
  }

  public get currentTextStylesBuf(): PonSprite[] {
    return this.textLines[this.textLines.length - 1];
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
      return this.addText(ch);
    }

    if (isNaN(this.textX)) { this.textX = this.textMarginLeft; }
    if (isNaN(this.textY)) { this.textY = this.textMarginTop; }

    if (ch === "\n" || ch === "\r") {
      this.addTextReturn();
      return;
    }
    const sp: PonSprite = new PonSprite(this.textSpriteCallbacks);
    const fontSize: number = +this.textStyle.fontSize;
    sp.createText(ch, this.textStyle);

    let pos = this.getNextTextPos(sp.width);
    sp.x = pos.x;
    sp.y = pos.y;
    this.currentTextLine.push(sp);
    this.textX = pos.x + sp.width;
    this.textY = pos.y;
  }

  public getCurrentLineWidth() {
    let line = this.currentTextLine;
    if (line.length === 0) {
      return 0;
    }
    let width: number = 0;
    line.forEach((sp) => {
      width += sp.width;
    });
    return width;
  }

  /**
   * 次の文字の表示位置を取得する
   * @param chWidth 追加しようとしている文字の横幅
   * @return 表示位置
   */
  public getNextTextPos(chWidth: number): {x: number, y: number} {
    // 自動改行の判定
    let lineWidth = this.getCurrentLineWidth();
    let totalMargin = this.textMarginLeft + this.textMarginRight;
    if (this.textIndentPoint !== 0) {
      switch (this.textAlign) {
        case "left": case "center":
          totalMargin = this.textIndentPoint + this.textMarginRight;
          break;
        case "right":
          totalMargin = (this.width - this.textIndentPoint) + this.textMarginLeft;
          break;
      }
    }
    if (this.textAutoReturn && (lineWidth + chWidth + totalMargin) > this.width) {
      this.addTextReturn();
    }

    // 追加する1文字に合わせて、既存の文字の位置を調整＆次の文字位置の算出
    let newLineWidth = this.getCurrentLineWidth() + chWidth;
    let startX: number = 0;
    let leftMargin = this.textIndentPoint !== 0 ? this.textIndentPoint : this.textMarginLeft;
    switch (this.textAlign) {
      case "left":
        startX = leftMargin;
        break;
      case "center":
        let center = leftMargin + (this.width - leftMargin - this.textMarginRight) / 2;
        startX = center - (newLineWidth / 2);
        break;
      case "right":
        let right = this.textIndentPoint !== 0 ? this.textIndentPoint : this.width - this.textMarginRight;
        startX = right - newLineWidth;
        break;
    }
    let x = startX;
    let y = this.textY + this.textLineHeight - this.textFontSize;
    let list: number[] = [];
    this.currentTextLine.forEach((sp) => {
      list.push(x);
      sp.x = x;
      sp.y = y;
      x += sp.width;
    });

    return {x: x, y: y};
  }

  /**
   * テキストを改行する
   */
  public addTextReturn(): void {
    this.textY += this.textLineHeight + this.textLinePitch;
    this.textLines.push([]);
    if (this.reservedTextIndentPoint !== 0) {
      this.textIndentPoint = this.reservedTextIndentPoint;
    }
  }

  /**
   * 現在のテキスト描画位置でインデントするように設定する
   */
  public setIndentPoint(): void {
    switch (this.textAlign) {
      case "left":
        let leftMargin = this.textIndentPoint !== 0 ? this.textIndentPoint : this.textMarginLeft;
        this.reservedTextIndentPoint = leftMargin + this.getCurrentLineWidth();
        break;
      case "center":
        this.reservedTextIndentPoint = this.textX;
        break;
      case "right":
        let rightMargin = this.textIndentPoint !== 0 ? this.textIndentPoint : this.textMarginRight;
        this.reservedTextIndentPoint = this.width - rightMargin - this.getCurrentLineWidth();
        break;
    }
  }

  /**
   * テキストをクリアする。
   * 描画していたテキストは全削除される。
   * テキストの描画開始位置は初期化される。
   * インデント位置は初期化される。
   */
  public clearText(): void {
    this.textLines.forEach((textLine: PonSprite[]) => {
      textLine.forEach((sp) => {
        sp.destroy();
      });
    });
    this.textLines = [[]];
    this.textX = this.textMarginLeft;
    this.textY = this.textMarginTop;
    this.textIndentPoint = 0;
    this.reservedTextIndentPoint = 0;
  }

  /**
   * 表示しているテキストの内容を文字列で取得
   * @return テキスト
   */
  public get messageText(): string {
    let message: string = "";
    this.textLines.forEach((textLine: PonSprite[], index: number) => {
      if (index > 0 ) {
        message += "\n"
      }
      textLine.forEach((sp) => {
        message += sp.text;
      });
    });
    return message;
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
    this.resource.loadImage(filePath).done((image) => {
      Logger.debug("BaseLayer.loadImage success: ", image);
      this.image = <HTMLImageElement> image;
      this.imageFilePath = filePath;
      this.imageSprite = new PonSprite(this.imageSpriteCallbacks);
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
    this.imageFilePath = null;
  }

  protected static baseLayerStoreParams: string[] = [
    // "name",
    "x",
    "y",
    "width",
    "height",
    "visible",
    "alpha",
    "backgroundColor",
    "backgroundAlpha",
    "hasBackgroundColor",
    "imageFilePath",
    "imageX",
    "imageY",
    "textFontFamily",
    "textFontSize",
    "textFontWeight",
    "textColor",
    "textShadowVisible",
    "textShadowAlpha",
    "textShadowAngle",
    "textShadowBlur",
    "textShadowColor",
    "textShadowDistance",
    "textEdgeColor",
    "textEdgeWidth",
    "textMarginTop",
    "textMarginRight",
    "textMarginBottom",
    "textMarginLeft",
    "textX",
    "textY",
    "textLineHeight",
    "textLinePitch",
    "textAutoReturn",
    "textIndentPoint",
    "reservedTextIndentPoint",
    "textAlign",
  ];

  protected static baseLayerIgnoreParams: string[] = [
    "backgroundColor",
    "backgroundAlpha",
    "hasBackgroundColor",
  ];

  /**
   * 保存する。
   * 子レイヤーの状態は保存されないことに注意が必要。
   */
  public store(tick: number): any {
    let data: any = {};
    let me: any = this as any;
    BaseLayer.baseLayerStoreParams.forEach(p => data[p] = me[p]);
    return data;
  }

  /**
   * 復元する。
   * 子レイヤーの状態は変化しないことに注意。
   * 継承先で子レイヤーを使用している場合は、継承先で独自に復元処理を実装する
   */
  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    let storeParams = () => {
      let me: any = this as any;
      let restoreParams = BaseLayer.baseLayerStoreParams.filter(
        param => BaseLayer.baseLayerIgnoreParams.indexOf(param) == -1);
      restoreParams.forEach(p => me[p] = data[p]);
    };

    // テキストはクリアする
    this.clearText();

    // 背景色
    this.clearBackgroundColor();
    if (data.hasBackgroundColor) {
      this.setBackgroundColor(data.backgroundColor, data.backgroundAlpha);
    }

    // 画像がある場合は非同期で読み込んでその後にサイズ等を復元する
    this.freeImage();
    if (data.imageFilePath != null && data.imageFilePath !== "") {
      asyncTask.add((params: any, index: number): AsyncCallbacks => {
        let cb = this.loadImage(data.imageFilePath);
        cb.done(() => {
          storeParams();
          this.restoreAfterLoadImage(data, tick);
        });
        return cb;
      });
    } else {
      storeParams();
      this.restoreAfterLoadImage(data, tick);
    }
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    // 継承先でオーバーライドして使うこと
  }

  public copyTo(dest: BaseLayer): void {
    // テキストのコピー
    dest.clearText();
    this.textLines.forEach((textLine: PonSprite[], index: number) => {
      if (dest.textLines.length !== 0) {
        dest.textLines.push([]);
      }
      let destTextLine: PonSprite[] = dest.textLines[dest.textLines.length - 1];
      textLine.forEach((srcSp: PonSprite, index: number) => {
        let ch: string | null = srcSp.text;
        let style: PIXI.TextStyle | null = srcSp.textStyle;
        if (ch === null || style === null) {
          return;
        }
        let destSp: PonSprite = new PonSprite(dest.textSpriteCallbacks);
        destSp.createText(ch, style);
        destSp.x = srcSp.x;
        destSp.y = srcSp.y;
        destTextLine.push(destSp);
      });
    });

    // 背景色のコピー
    dest.clearBackgroundColor();
    if (this.hasBackgroundColor) {
      dest.setBackgroundColor(this.backgroundColor, this.backgroundAlpha);
    }

    // 画像のコピー
    dest.freeImage();
    if (this.image !== null) {
      dest.imageSprite = new PonSprite(dest.imageSpriteCallbacks);
      dest.imageSprite.setImage(this.image);
      dest.image = this.image;
    }

    // その他のパラメータのコピー
    let me: any = this as any;
    let you: any = dest as any;
    let params = BaseLayer.baseLayerStoreParams.filter(
      param => BaseLayer.baseLayerIgnoreParams.indexOf(param) == -1);
    params.forEach(p => you[p] = me[p]);
  }

  /**
   * コンフィグを反映する。
   * このメソッドでは単純に値の設定のみ行うため、
   * 画像読み込みなどの非同期処理が必要なものには対応していない。
   */
  public applyConfig(config: any): void {
    if (config != null) {
      let me = (this as any);
      Object.keys(config).forEach((key) => {
        me[key] = config[key];
      });
    }
  }

}
