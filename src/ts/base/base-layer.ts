import * as PIXI from "pixi.js";
import { AsyncCallbacks } from "./async-callbacks";
import { AsyncTask } from "./async-task";
import { Logger } from "./logger";
import { PonGame } from "./pon-game";
import { PonMouseEvent } from "./pon-mouse-event";
import { IPonSpriteCallbacks, PonSprite } from "./pon-sprite";
import { PonWheelEvent } from "./pon-wheel-event";
import { Resource } from "./resource";

export interface IBaseLayerEventListener {
  // onLabel(labelName: string, line: number, tick: number): "continue" | "break";
  onChangeX(sender: BaseLayer, x: number): void;
  onChangeY(sender: BaseLayer, y: number): void;
}

export class BaseLayerChar {
  public readonly ch: string;
  public readonly sp: PonSprite;
  public readonly ruby: string;
  public readonly rubySp: PonSprite | null;
  public constructor(ch: string, sp: PonSprite, ruby: string = "", rubySp: PonSprite | null = null) {
    this.ch = ch;
    this.sp = sp;
    this.ruby = ruby;
    this.rubySp = rubySp;
  }

  public clone(spriteCallbacks: IPonSpriteCallbacks): BaseLayerChar {
    const sp = new PonSprite(spriteCallbacks);
    sp.createText(this.ch, this.sp.textStyle as PIXI.TextStyle, this.sp.textPitch);
    sp.x = this.sp.x;
    sp.y = this.sp.y;
    return new BaseLayerChar(this.ch, sp, this.ruby);
  }

  public destroy(): void {
    this.sp.destroy();
    if (this.rubySp != null) {
      this.rubySp.destroy();
    }
  }
}

export class BaseLayerTextLine {
  public readonly container: PIXI.Container;
  public readonly spriteCallbacks: IPonSpriteCallbacks;
  public readonly chList: BaseLayerChar[] = [];

  private _textX: number = 0;
  // private _textY: number = 0;

  public constructor() {
    this.container = new PIXI.Container();
    this.spriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.container.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.container.removeChild(child);
      },
    };
  }

  public forEach(func: (ch: BaseLayerChar, index: number) => void): void {
    this.chList.forEach(func);
  }

  /**
   * このテキスト行を破棄する。
   * 以後、テキストを追加したりするとエラーになる。
   */
  public destroy(): void {
    this.chList.forEach((blc) => {
      blc.destroy();
    });
    this.chList.splice(0, this.chList.length);
    this.container.destroy();
  }

  /**
   * このテキスト行の文字をすべてクリアする。
   */
  public clear(): void {
    this.chList.forEach((blc) => {
      blc.destroy();
    });
    this.chList.splice(0, this.chList.length);
  }

  public get x() { return this.container.x; }
  public set x(x: number) { this.container.x = x; }
  public get y() { return this.container.y; }
  public set y(y: number) { this.container.y = y; }
  public get textX() { return this._textX; }
  public get text() {
    let str = "";
    this.chList.forEach((blc) => {
      str += blc.ch;
    });
    return str;
  }
  public get tailChar(): string { return this.chList[this.chList.length - 1].ch; }
  public get length() { return this.chList.length; }
  public get width(): number {
    if (this.chList.length === 0) {
      return 0;
    }
    let width = 0;
    this.chList.forEach((blc) => {
      width += blc.sp.textWidth;
    });
    return width;
  }

  public addChar(ch: string, textStyle: PIXI.TextStyle, pitch: number, lineHeight: number): void {
    const sp: PonSprite = new PonSprite(this.spriteCallbacks);
    sp.createText(ch, textStyle, pitch);
    sp.x = this._textX;
    sp.y = lineHeight - (+textStyle.fontSize);
    this._textX += sp.textWidth;
    this.chList.push(new BaseLayerChar(ch, sp));
  }

  public getCh(index: number): BaseLayerChar {
    return this.chList[index];
  }

  public backspace(): void {
    this.chList[this.chList.length - 1].destroy();
    this.chList.splice(this.chList.length - 1, 1);
  }

  public copyFrom(src: BaseLayerTextLine): void {
    this.clear();
    src.chList.forEach((srcBlc: BaseLayerChar) => {
      const newBlc = srcBlc.clone(this.spriteCallbacks);
      this.chList.push(newBlc);
    });
    this.x = src.x;
    this.y = src.y;
    this._textX = src._textX;
  }
}


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
  // protected textSpriteCallbacks: IPonSpriteCallbacks;
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
  // イベントリスナ
  private eventListenerList: IBaseLayerEventListener[] = [];

  /** イベント遮断フラグ。trueにするとマウスイベントの伝播を遮断する。 */
  public blockLeftClickFlag: boolean = false;
  public blockRightClickFlag: boolean = false;
  public blockCenterClickFlag: boolean = false;
  public blockMouseMove: boolean = false;
  public blockWheelFlag: boolean = false;

  // 文字関係
  protected textLines: BaseLayerTextLine[] = [new BaseLayerTextLine()];
  public textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: ["mplus-1m-regular", "monospace"],
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
    trim: false,
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
      return this.textStyle.fill as string;
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
      return this.textStyle.dropShadowColor as string;
    }
  }
  public set textShadowDistance(distance: number) { this.textStyle.dropShadowDistance = distance; }
  public get textShadowDistance(): number { return this.textStyle.dropShadowDistance; }

  public set textEdgeColor(color: number | string) { this.textStyle.stroke = color; }
  public get textEdgeColor(): number | string {
    if (typeof this.textStyle.stroke === "number") {
      return this.textStyle.stroke;
    } else {
      return this.textStyle.stroke as string;
    }
  }
  public set textEdgeWidth(width: number) { this.textStyle.strokeThickness = width; }
  public get textEdgeWidth(): number { return this.textStyle.strokeThickness; }

  public textMarginTop: number = 10;
  public textMarginRight: number  = 10;
  public textMarginBottom: number  = 10;
  public textMarginLeft: number  = 10;
  /** 次の文字を描画する予定の位置。予定であって、自動改行等が発生した場合は次の行になるため注意。 */
  // public textX: number = NaN;
  /** 次の文字を描画する予定の位置。予定であって、自動改行等が発生した場合は次の行になるため注意。 */
  // public textY: number = NaN;
  public textPitch: number = 0;
  public textLineHeight: number = 24;
  public textLinePitch: number = 5;
  public textAutoReturn: boolean = true;
  public textLocatePoint: number | null = null;
  public textIndentPoint: number | null = null;
  public reservedTextIndentPoint: number | null = null;
  public reservedTextIndentClear: boolean = false;
  public textAlign: "left" | "center" | "right" = "left";

  /** 禁則文字（行頭禁則文字） */
  public static headProhibitionChar: string =
    "%),:;]}｡｣ﾞﾟ。，、．：；゛゜ヽヾゝ\"ゞ々’”）〕］｝〉》」』】°′″℃￠％‰" +
    "!.?､･ｧｨｩｪｫｬｭｮｯｰ・？！ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ";
  /** 禁則文字（行末禁則文字） */
  public static tailProhibitionChar: string = "\\$([{｢‘“（〔［｛〈《「『【￥＄￡";

  public get children(): BaseLayer[] { return this._children; }
  public get x(): number { return this.container.x; }
  public set x(x) {
    this.container.x = x;
    this.callEventListener("onChangeX", [x]);
  }
  public get y(): number { return this.container.y; }
  public set y(y) {
    this.container.y = y;
    this.callEventListener("onChangeY", [y]);
  }
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

  public get scaleX(): number { return this.container.scale.x; }
  public set scaleX(scaleX: number) {
    this.container.scale.x = scaleX;
  }
  public get scaleY(): number { return this.container.scale.y; }
  public set scaleY(scaleY: number) {
    this.container.scale.y = scaleY;
  }

  public constructor(name: string, resource: Resource, owner: PonGame) {
    this.name = name;
    this.resource = resource;
    this.owner = owner;

    this._container = new PIXI.Container();

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
      },
    };

    this.backgroundSprite = new PonSprite(this.imageSpriteCallbacks);

    this.textContainer = new PIXI.Container();
    this.container.addChild(this.textContainer);
    this.textContainer.addChild(this.currentTextLine.container);
    // this.textSpriteCallbacks = {
    //   pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
    //     this.textContainer.addChild(child);
    //   },
    //   pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
    //     this.textContainer.removeChild(child);
    //   },
    // };
    this.clearText();

    this.childContainer = new PIXI.Container();
    this.container.addChild(this.childContainer);
    this.childSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.childContainer.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.childContainer.removeChild(child);
      },
    };

    this.visible = false;
    // Logger.debug("new layer =>", this);
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

  public addEventListener(listener: IBaseLayerEventListener): void {
    if (this.eventListenerList.indexOf(listener) === -1) {
      this.eventListenerList.push(listener);
    }
  }

  public delEventListener(listener: IBaseLayerEventListener): void {
    const index = this.eventListenerList.indexOf(listener);
    if (index !== -1) {
      this.eventListenerList.splice(index, 1);
    }
  }

  public clearEventListener(): void {
    this.eventListenerList = [];
  }

  private callEventListener(method: string, args: any[]) {
    args.unshift(this);
    this.eventListenerList.forEach((listener: any) => {
      listener[method].apply(listener, args);
    });
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
    const top: number = child.y;
    const right: number = child.x + child.width;
    const bottom: number = child.y + child.height;
    const left: number = child.x;
    return left <= x && x <= right && top <= y && y <= bottom;
  }

  protected isBlockedEvent(e: PonMouseEvent | PonWheelEvent, eventName: string): boolean {
    if (e instanceof PonMouseEvent) {
      if (eventName === "down" || eventName === "up") {
        if (this.blockLeftClickFlag && e.isLeft) { return true; }
        if (this.blockRightClickFlag && e.isRight) { return true; }
        if (this.blockCenterClickFlag && e.isCenter) { return true; }
      }
      if (eventName === "move") {
        if (this.blockMouseMove) { return true; }
      }
    } else {
      if (this.blockWheelFlag) { return true; }
    }
    return false;
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    // 子レイヤーのonMouseEnter/onMouseLeaveを発生させる
    if (!this.callChildrenMouseEnterLeave(e)) { return false; }
    if (!this.isBlockedEvent(e, "move")) { return false; }
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    // 子レイヤーのonMouseEnter/onMouseLeaveを発生させる
    if (!this.callChildrenMouseEnterLeave(e)) { return false; }
    if (!this.isBlockedEvent(e, "move")) { return false; }
    return true;
  }

  /** onMouseEnter等を発生させるためのバッファ */
  protected isInsideBuffer: boolean = false;
  public onMouseMove(e: PonMouseEvent): boolean {
    // 子レイヤーのonMouseEnter/onMouseLeaveを発生させる
    if (!this.callChildrenMouseEnterLeave(e)) { return false; }

    // mousemove
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) { continue; }
      const isInside = this.isInsideOfChildLayer(child, e.x, e.y);
      if (isInside) {
        const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
        if (!child.onMouseMove(e2)) { return false; }
      }
      child.isInsideBuffer = isInside;
    }
    if (this.isBlockedEvent(e, "move")) { return false; }
    return true;
  }

  // 子レイヤーのonMouseEnter/onMouseLeaveを発生させる
  private callChildrenMouseEnterLeave(e: PonMouseEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) { continue; }
      const isInside = this.isInsideOfChildLayer(child, e.x, e.y);
      let result: boolean = true;
      if (isInside !== child.isInsideBuffer) {
        const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
        result = isInside ? child.onMouseEnter(e2) : child.onMouseLeave(e2);
      }
      child.isInsideBuffer = isInside;
      if (!result) { return false; }
    }
    if (this.isBlockedEvent(e, "move")) {
      return false;
    }
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) { continue; }
      if (this.isInsideOfChildLayer(child, e.x, e.y)) {
        const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
        if (!child.onMouseDown(e2)) { return false; }
      }
    }
    Logger.debug("onMouseDown", this.name, e);
    if (this.isBlockedEvent(e, "down")) { return false; }
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) { continue; }
      if (this.isInsideOfChildLayer(child, e.x, e.y)) {
        const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
        if (!child.onMouseUp(e2)) { return false; }
      }
    }
    Logger.debug("onMouseUp", this.name, e);
    if (this.isBlockedEvent(e, "up")) { return false; }
    return true;
  }

  public onChangeStable(isStable: boolean): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].onChangeStable(isStable);
    }
  }

  public onMouseWheel(e: PonWheelEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) { continue; }
      if (!child.onMouseWheel(e)) { return false; }
    }
    if (this.isBlockedEvent(e, "wheel")) { return false; }
    return true;
  }

  /**
   * 背景色を設定する
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public setBackgroundColor(color: number, alpha: number = 1.0): void {
    this.freeImage();
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

  public get preTextLine(): BaseLayerTextLine {
    return this.textLines[this.textLines.length - 2];
  }

  public get currentTextLine(): BaseLayerTextLine {
    return this.textLines[this.textLines.length - 1];
  }

  private createBaseLayerTextLine(): BaseLayerTextLine {
    const line = new BaseLayerTextLine();
    this.textContainer.addChild(line.container);
    return line;
  }

  private deleteBaseLayerTextLine(line: BaseLayerTextLine): void {
    line.destroy();
    this.textContainer.removeChild(line.container);
  }

  public get text(): string {
    let str = "";
    this.textLines.forEach((textLine: BaseLayerTextLine) => {
      if (str !== "") {
        str += "\n";
      }
      str += textLine.text;
    });
    return str;
  }

  /**
   * 表示しているテキストの内容を文字列で取得
   * @return テキスト
   */
  public get messageText(): string {
    return this.text;
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
    if (ch === "\n" || ch === "\r") {
      this.addTextReturn();
      return;
    }

    // いったん描画
    this.currentTextLine.addChar(ch, this.textStyle, this.textPitch, this.textLineHeight);
    this.alignCurrentTextLine();

    // 自動改行判定
    // const isHeadProhibitionChar = BaseLayer.headProhibitionChar.indexOf(ch) != -1;
    // const isTailProhibitionChar = BaseLayer.tailProhibitionChar.indexOf(ch) != -1;
    if (this.textAutoReturn && this.shouldBeNewTextLine()) {
      this.currentTextLine.backspace();
      this.alignCurrentTextLine();
      this.addTextReturn();
      this.currentTextLine.addChar(ch, this.textStyle, this.textPitch, this.textLineHeight);
      this.alignCurrentTextLine();
    }
  }

  /**
   * 次の文字の表示位置を取得する
   * @param chWidth 追加しようとしている文字の横幅
   * @return 表示位置
   */
  public getNextTextPos(chWidth: number): { x: number, y: number, newLineFlag: boolean } {
    const currentLine = this.currentTextLine;
    const right = currentLine.x + currentLine.width;
    let x = 0;
    let y = currentLine.y;
    let newLineFlag = false;
    switch (this.textAlign) {
      case "left":
        if (this.shouldBeNewTextLine(chWidth)) {
          x = this.getTextLineBasePoint();
          y = this.currentTextLine.y + this.textLineHeight + this.textLinePitch;
          newLineFlag = true;
        } else {
          x = right;
          y = currentLine.y;
        }
        break;
      case "center":
        if (this.shouldBeNewTextLine(chWidth)) {
          x = this.getTextLineBasePoint() - chWidth / 2;
          y = this.currentTextLine.y + this.textLineHeight + this.textLinePitch;
          newLineFlag = true;
        } else {
          x = right + chWidth / 2;
          y = currentLine.y;
        }
        break;
      case "right":
        x = right;
        y = currentLine.y;
        if (this.shouldBeNewTextLine(chWidth)) {
          x = this.getTextLineBasePoint() - chWidth;
          y = this.currentTextLine.y + this.textLineHeight + this.textLinePitch;
          newLineFlag = true;
        } else {
          x = right;
          y = currentLine.y;
        }
        break;
    }
    return {x, y, newLineFlag};
  }

  /**
   * 改行が必要かどうかを返す（自動改行の判定用）
   * @param chWidth 追加する文字の幅
   * @return 改行が必要ならtrue
   */
  protected shouldBeNewTextLine(chWidth: number = 0): boolean {
    const currentLine = this.currentTextLine;
    const left = currentLine.x;
    const right = currentLine.x + currentLine.width;
    let x = 0;
    switch (this.textAlign) {
      case "left":
        return right + chWidth > this.width - this.textMarginRight;
      case "center":
        x = right + chWidth / 2;
        return (left - (chWidth / 2)) < this.textMarginLeft ||
               (right + (chWidth / 2) > this.width - this.textMarginRight);
      case "right":
        return left - chWidth < this.textMarginLeft;
    }
  }

  /**
   * テキストを改行する
   */
  public addTextReturn(): void {
    const preLineY = this.currentTextLine.y;
    this.textLines.push(this.createBaseLayerTextLine());

    if (this.reservedTextIndentPoint != null) {
      this.textIndentPoint = this.reservedTextIndentPoint;
    } else if (this.reservedTextIndentClear) {
      this.textIndentPoint = null;
      this.reservedTextIndentClear = false;
    }
    this.textLocatePoint = null;

    this.alignCurrentTextLine();
    this.currentTextLine.y = preLineY + this.textLineHeight + this.textLinePitch;
  }

  /**
   * 現在描画中のテキスト行をの位置をtextAlignにそろえる
   */
  public alignCurrentTextLine(): void {
    switch (this.textAlign) {
      case "left":
        this.currentTextLine.x = this.getTextLineBasePoint();
        break;
      case "center":
        this.currentTextLine.x = this.getTextLineBasePoint() - (this.currentTextLine.width / 2);
        break;
      case "right":
        this.currentTextLine.x = this.getTextLineBasePoint() - this.currentTextLine.width;
        break;
    }
  }

  /**
   * テキスト行の描画時、ベースとなる点(x)を取得する。
   * 左揃えの時: 左端の位置
   * 中央揃えの時：中央の位置
   * 右揃えの時：右端の位置
   */
  protected getTextLineBasePoint(): number {
    if (this.textLocatePoint != null) {
      return this.textLocatePoint;
    }
    switch (this.textAlign) {
      case "left":
        return this.textIndentPoint == null ? this.textMarginLeft : this.textIndentPoint;
      case "center":
        return this.textIndentPoint == null ?
          (this.width - this.textMarginLeft - this.textMarginRight) / 2 :
          (this.width - this.textIndentPoint - this.textMarginRight) / 2;
      case "right":
        return this.textIndentPoint == null ?
          (this.width - this.textMarginRight) :
          this.textIndentPoint;
    }
  }

  /**
   * テキストの表示位置を指定する。
   * 内部的には、指定前とは別の行として扱われる。
   * @param x x座標
   * @param y y座標
   */
  public setCharLocate(x: number | null, y: number | null): void {
    const preLine = this.currentTextLine;
    this.addTextReturn();
    const currentLine = this.currentTextLine;
    if (x != null) {
      this.textLocatePoint = x;
    } else {
      // yだけ変えるときのxを自動算出
      switch (this.textAlign) {
        case "left":
          this.textLocatePoint = preLine.x + preLine.width;
          break;
        case "center":
          this.textLocatePoint = preLine.x + (preLine.width / 2);
          break;
        case "right":
          this.textLocatePoint = preLine.x;
          break;
      }
    }
    if (y != null) {
      currentLine.y = y;
    } else {
      // xだけ変えるときのy
      currentLine.y = preLine.y;
    }
  }

  /**
   * 現在のテキスト描画位置でインデントするように設定する
   */
  public setIndentPoint(): void {
    const currentLine = this.currentTextLine;
    switch (this.textAlign) {
      case "left":
      case "center":
        this.reservedTextIndentPoint = currentLine.x + currentLine.width;
        break;
      case "right":
        this.reservedTextIndentPoint = currentLine.x;
        break;
    }
  }

  /**
   * インデント位置をクリアする
   */
  public clearIndentPoint(): void {
    this.reservedTextIndentPoint = null;
    this.reservedTextIndentClear = true;
  }

  /**
   * テキストをクリアする。
   * 描画していたテキストは全削除される。
   * テキストの描画開始位置は初期化される。
   * インデント位置は初期化される。
   */
  public clearText(): void {
    this.textLines.forEach((textLine: BaseLayerTextLine) => {
      this.deleteBaseLayerTextLine(textLine);
    });
    this.textLines = [this.createBaseLayerTextLine()];
    this.textLocatePoint = null;
    this.textIndentPoint = null;
    this.reservedTextIndentPoint = null;
    this.reservedTextIndentClear = false;

    this.currentTextLine.x = this.getTextLineBasePoint();
    this.currentTextLine.y = this.textMarginTop;
  }

  /**
   * 画像を読み込む。
   * 同時に、レイヤサイズを画像に合わせて変更する。
   * @param filePath ファイルパス
   */
  public loadImage(filePath: string): AsyncCallbacks {
    // Logger.debug("BaseLayer.loadImage call: ", filePath);
    const cb = new AsyncCallbacks();

    this.clearBackgroundColor();
    this.freeImage();
    const width = this.width;
    const height = this.height;
    this.resource.loadImage(filePath).done((image) => {
      // Logger.debug("BaseLayer.loadImage success: ", image);
      this.image = image as HTMLImageElement;
      this.imageFilePath = filePath;
      this.imageSprite = new PonSprite(this.imageSpriteCallbacks);
      this.imageSprite.setImage(image);
      this.width = this.imageSprite.width;
      this.height = this.imageSprite.height;
      this.imageX = 0;
      this.imageY = 0;
      cb.callDone(this);
    }).fail(() => {
      // Logger.debug("BaseLayer.loadImage fail: ");
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
    "name",
    "x",
    "y",
    "scaleX",
    "scaleY",
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
    "textPitch",
    "textLineHeight",
    "textLinePitch",
    "textAutoReturn",
    "textLocatePoint",
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
    const data: any = {};
    const me: any = this as any;
    BaseLayer.baseLayerStoreParams.forEach((p) => data[p] = me[p]);
    return data;
  }

  /**
   * 復元する。
   * 子レイヤーの状態は変化しないことに注意。
   * 継承先で子レイヤーを使用している場合は、継承先で独自に復元処理を実装する
   */
  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    const storeParams = () => {
      const me: any = this as any;
      const restoreParams = BaseLayer.baseLayerStoreParams.filter(
        (param) => BaseLayer.baseLayerIgnoreParams.indexOf(param) === -1);
      restoreParams.forEach((p) => me[p] = data[p]);
    };

    // テキストはクリアする
    if (clear) {
      this.clearText();
    }

    // 背景色
    this.clearBackgroundColor();
    if (data.hasBackgroundColor) {
      this.setBackgroundColor(data.backgroundColor, data.backgroundAlpha);
    }

    // 画像がある場合は非同期で読み込んでその後にサイズ等を復元する
    if (data.imageFilePath != null &&
        data.imageFilePath !== "" &&
        data.imageFilePath !== this.imageFilePath) {
      this.freeImage();
      asyncTask.add((params: any, index: number): AsyncCallbacks => {
        const cb = this.loadImage(data.imageFilePath);
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
    this.textLines.forEach((srcTextLine: BaseLayerTextLine, index: number) => {
      if (dest.textLines.length !== 0) {
        dest.textLines.push(dest.createBaseLayerTextLine());
      }
      const destTextLine: BaseLayerTextLine = dest.textLines[dest.textLines.length - 1];
      destTextLine.copyFrom(srcTextLine);
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
    const me: any = this as any;
    const you: any = dest as any;
    const params = BaseLayer.baseLayerStoreParams.filter(
      (param) => BaseLayer.baseLayerIgnoreParams.indexOf(param) === -1);
    params.forEach((p) => you[p] = me[p]);
  }

  /**
   * コンフィグを反映する。
   * このメソッドでは単純に値の設定のみ行うため、
   * 画像読み込みなどの非同期処理が必要なものには対応していない。
   */
  public applyConfig(config: any): void {
    if (config != null) {
      const me = (this as any);
      Object.keys(config).forEach((key) => {
        me[key] = config[key];
      });
    }
  }

}
