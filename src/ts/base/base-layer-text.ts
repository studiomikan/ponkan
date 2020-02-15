import * as PIXI from "pixi.js";
import { Ease, objSort } from "./util";

export type InEffectType = "alpha" | "move" | "alphamove";
export type TextColor = string | number | string[] | number[] | CanvasGradient | CanvasPattern;

enum InEffectState {
  Stop = 0,
  Run,
}

export class TextSpriteCache {
  public static MAX_SIZE: number = 5000;
  public static ENABLED: boolean = true;
  private map = new Map<string, PIXI.Text>();

  private genKey(ch: string, style: TextStyle): string {
    const tmp: any = { ch, style: objSort(style.toJson()) };
    return JSON.stringify(tmp);
  }

  // public has(ch: string, style: TextStyle): boolean {
  //   return this.map.has(this.genKey(ch, style));
  // }

  public get(ch: string, style: TextStyle): PIXI.Sprite | null {
    if (TextSpriteCache.ENABLED) {
      const cache: PIXI.Text | undefined = this.map.get(this.genKey(ch, style));
      if (cache == null) {
        return null;
      }
      const sp: PIXI.Sprite = new PIXI.Sprite(cache.texture.clone());
      return sp;
    } else {
      return null;
    }
  }

  public set(ch: string, style: TextStyle, text: PIXI.Text): void {
    if (TextSpriteCache.ENABLED) {
      const key: string = this.genKey(ch, style);
      this.map.set(key, text);
      // キャッシュ数を抑制
      if (this.map.size > TextSpriteCache.MAX_SIZE) {
        this.map.delete(this.map.keys().next().value);
      }
    }
  }
}

const textCache = new TextSpriteCache();

const defaultTextStyle = {
  // for PIXI.TextStyle
  align: "left",
  breakWords: false,
  dropShadow: false,
  dropShadowAlpha: 1,
  dropShadowAngle: Math.PI / 6,
  dropShadowBlur: 0,
  dropShadowColor: "black",
  dropShadowDistance: 5,
  fill: "black",
  fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
  fillGradientStops: [],
  fontFamily: "Arial",
  fontSize: 26,
  fontStyle: "normal",
  fontVariant: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 0,
  lineJoin: "miter",
  miterLimit: 10,
  padding: 0,
  stroke: "black",
  strokeThickness: 0,
  textBaseline: "alphabetic",
  trim: false,
  whiteSpace: "pre",
  wordWrap: false,
  wordWrapWidth: 100,
  leading: 0,
  // for Ponkan
  edgeAlpha: 1.0,
  pitch: 1,
  inEffectTypes: [],
  inEffectTime: 100,
  inEffectEase: "none",
  inEffectOptions: {},
};

/**
 * テキストスタイル
 */
export class TextStyle extends PIXI.TextStyle {
  private _edgeAlpha: number = 1;
  public pitch: number = 0;

  public inEffectTypes: InEffectType[] = [];
  public inEffectTime: number = 100;
  public inEffectEase: "none" | "in" | "out" | "both" = "none";
  public inEffectOptions: any = {};

  constructor() {
    super(defaultTextStyle as any);
    this.edgeAlpha = 1;
  }

  public setGradientType(type: "vertical" | "horizontal"): void {
    if (type === "vertical") {
      this.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_VERTICAL;
    } else {
      this.fillGradientType = PIXI.TEXT_GRADIENT.LINEAR_HORIZONTAL;
    }
  }

  public set edgeWidth(edgeWidth: number) {
    this.strokeThickness = edgeWidth;
  }
  public get edgeWidth(): number {
    return this.strokeThickness;
  }
  public set edgeAlpha(edgeAlpha: number) {
    const edge: number | string = this.stroke;
    let rgb: number[];
    if (typeof edge === "number") {
      rgb = PIXI.utils.hex2rgb(edge);
    } else {
      rgb = PIXI.utils.hex2rgb(PIXI.utils.string2hex(edge));
    }
    this.stroke = `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${edgeAlpha})`;
    this._edgeAlpha = edgeAlpha;
  }
  public get edgeAlpha(): number {
    return this._edgeAlpha;
  }

  public checkOptions(): void {
    if (this.inEffectTypes.includes("move")) {
      if (this.inEffectOptions == null) {
        this.inEffectOptions = {};
      }
      if (this.inEffectOptions.offsetx == null) {
        this.inEffectOptions.offsetx = 0;
      }
      if (this.inEffectOptions.offsety == null) {
        this.inEffectOptions.offsety = 0;
      }
    }
  }

  public clone(): TextStyle {
    const target: any = new TextStyle();
    TextStyle.assign(target, this as any);
    return target;
  }

  public static assign(target: any, source: any): TextStyle {
    for (const prop in defaultTextStyle) {
      if (Array.isArray(source[prop])) {
        target[prop] = source[prop].slice();
      } else if (typeof source[prop] === "object") {
        target[prop] = Object.assign({}, source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }

  public applyConfig(config: any): void {
    if (config != null) {
      Object.assign(this, config);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public store(tick: number): any {
    return TextStyle.assign({}, this as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    TextStyle.assign(this as any, data);
  }

  public toJson(): any {
    return TextStyle.assign({}, this);
  }
}

/**
 * レイヤーに描画する文字の情報。
 * 文字と位置などの情報のみ持ち、canvasなどは持たない。
 */
export class LayerChar {
  public readonly pixiSprite: PIXI.Sprite;
  public readonly fromCache: boolean;
  public readonly ch: string;
  public readonly style: TextStyle;
  private _x: number = 0;
  private _y: number = 0;

  private inEffectState: InEffectState = InEffectState.Stop;
  private inEffectStartTick: number = -1;
  private _offsetX: number = 0;
  private _offsetY: number = 0;

  public set x(x: number) {
    this._x = x;
    this.refreshPosition();
  }
  public get x(): number {
    return this._x;
  }
  public set y(y: number) {
    this._y = y;
    this.refreshPosition();
  }
  public get y(): number {
    return this.pixiSprite.y;
  }
  public set width(width: number) {
    this.pixiSprite.width = width;
  }
  public get width(): number {
    return this.pixiSprite.width;
  }
  public set alpha(alpha: number) {
    this.pixiSprite.alpha = alpha;
  }
  public get alpha(): number {
    return this.pixiSprite.alpha;
  }

  public constructor(ch: string, style: TextStyle, x: number, y: number) {
    this.style = style.clone();
    this.ch = ch;

    const cacheSprite = textCache.get(this.ch, this.style);
    if (cacheSprite != null) {
      this.pixiSprite = cacheSprite;
      this.fromCache = true;
    } else {
      const text: PIXI.Text = new PIXI.Text(ch, this.style);
      textCache.set(this.ch, this.style, text);
      this.pixiSprite = text;
      this.fromCache = false;
    }

    this.x = x;
    this.y = y;
    this.width = this.pixiSprite.width + style.pitch;
    this.style.checkOptions();
    if (this.style.inEffectTypes != null && this.style.inEffectTypes.length > 0) {
      this.inEffectState = InEffectState.Run;
    }
  }

  public addTo(container: PIXI.Container): LayerChar {
    container.addChild(this.pixiSprite);
    return this;
  }

  public static CloneParams = ["inEffectState", "inEffectStartTick", "_offsetX", "_offsetY", "alpha"];

  public clone(): LayerChar {
    const me: any = this as any;
    const c: any = new LayerChar(this.ch, this.style.clone(), this.x, this.y) as any;
    LayerChar.CloneParams.forEach(param => {
      c[param] = me[param];
    });
    return c;
  }

  public destroy(): void {
    if (this.pixiSprite.parent) {
      this.pixiSprite.parent.removeChild(this.pixiSprite);
      if (this.fromCache) {
        this.pixiSprite.destroy();
      }
    }
  }

  /**
   * 描画前の更新
   * @param tick 時刻
   * @return 更新があった場合はtrue
   */
  public beforeDraw(tick: number): boolean {
    if (this.inEffectState === InEffectState.Run) {
      if (this.inEffectStartTick === -1) {
        this.inEffectStartTick = tick;
      }
      const elapsedTime = tick - this.inEffectStartTick;
      let phase = elapsedTime / this.style.inEffectTime;
      if (phase < 0) phase = 0;
      if (phase > 1) phase = 1;
      // easeの処理
      switch (this.style.inEffectEase) {
        case "in":
          phase = Ease.in(phase);
          break;
        case "out":
          phase = Ease.out(phase);
          break;
        case "both":
          phase = Ease.inOut(phase);
          break;
      }
      // エフェクトをかける
      if (this.style.inEffectTypes.includes("alpha")) {
        this.InEffectAlpha(elapsedTime, phase);
      }
      if (this.style.inEffectTypes.includes("move")) {
        this.InEffectMove(elapsedTime, phase);
      }
      if (elapsedTime >= this.style.inEffectTime) {
        this.inEffectState = InEffectState.Stop;
      }
      return true;
    } else {
      return false;
    }
  }

  private refreshPosition(): void {
    this.pixiSprite.x = this._x + this._offsetX;
    this.pixiSprite.y = this._y + this._offsetY;
  }

  private InEffectAlpha(elapsedTime: number, phase: number): void {
    this.alpha = phase;
  }

  private InEffectMove(elapsedTime: number, phase: number): void {
    this._offsetX = Math.floor(this.style.inEffectOptions.offsetx * (1 - phase));
    this._offsetY = Math.floor(this.style.inEffectOptions.offsety * (1 - phase));
    this.refreshPosition();
  }
}

export class LayerTextLine {
  public readonly container: PIXI.Container = new PIXI.Container();
  public lineHeight: number = 0;
  private chList: LayerChar[] = [];
  private rubyList: LayerChar[] = [];

  private _textX: number = 0;

  private rubyText: string = "";
  private rubyFontSize: number = 10;
  private rubyOffset: number = 2;
  private rubyPitch: number = 2;

  public set x(x: number) {
    this.container.x = x;
  }
  public get x(): number {
    return this.container.x;
  }
  public set y(y: number) {
    this.container.y = y;
  }
  public get y(): number {
    return this.container.y;
  }
  public get text(): string {
    return this.chList.map(layerChar => layerChar.ch).join("");
  }
  public get textX(): number {
    return this._textX;
  }
  public get tailChar(): string {
    return this.chList[this.chList.length - 1].ch;
  }
  public get length(): number {
    return this.chList.length;
  }
  public get width(): number {
    if (this.chList.length === 0) {
      return 0;
    }
    let width = 0;
    this.chList.forEach(layerChar => {
      width += layerChar.width;
    });
    width -= this.chList[this.chList.length - 1].style.pitch; // 最後の一文字pitchは幅に含めない
    return width;
  }

  public forEach(func: (ch: LayerChar, index: number) => void): void {
    this.chList.forEach(func);
  }

  public destroy(): void {
    this.clear();
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
      this.container.destroy();
    }
  }

  public addTo(container: PIXI.Container): LayerTextLine {
    container.addChild(this.container);
    return this;
  }

  public clear(): void {
    this.chList.forEach((ch: LayerChar) => {
      ch.destroy();
    });
    this.chList = [];
    this.rubyList.forEach((ruby: LayerChar) => {
      ruby.destroy();
    });
    this.rubyList = [];
    this.container.removeChildren();
    this.lineHeight = 0;
    this.rubyText = "";
    this.rubyFontSize = 10;
    this.rubyOffset = 2;
    this.rubyPitch = 2;
  }

  public addChar(ch: string, style: TextStyle, lineHeight: number): void {
    if (this.lineHeight < lineHeight) {
      // 自動で行の高さを拡張
      this.lineHeight = lineHeight;
    }
    const x = this._textX;
    const y = lineHeight - +style.fontSize;
    const c = new LayerChar(ch, style, x, y).addTo(this.container);
    this._textX += c.width;
    this.chList.push(c);
    // ルビがあったら追加する
    if (this.rubyText !== "") {
      this.addRubyText(c, style);
      this.rubyText = "";
    }
  }

  private addRubyText(targetChar: LayerChar, srcTextStyle: TextStyle): void {
    const rubyStyle = srcTextStyle.clone();
    rubyStyle.fontSize = this.rubyFontSize;
    const rubyText = this.rubyText;
    const pitch = this.rubyPitch;
    const center = targetChar.x + targetChar.width / 2;
    const tmpRubyList: LayerChar[] = [];
    let rubyWidthSum = 0;
    for (let i = 0; i < rubyText.length; i++) {
      const ruby = new LayerChar(rubyText.charAt(i), rubyStyle, 0, 0).addTo(this.container); // 位置は一旦0,0で作る
      tmpRubyList.push(ruby);
      rubyWidthSum += ruby.width + pitch;
    }
    rubyWidthSum -= pitch; // 最後の一文字のpitchは幅に含めない
    // 追加対象の文字に対して中央揃えとなるように配置する
    // const rubyY = targetChar.y - +targetChar.style.fontSize - this.rubyOffset; // 文字位置を基準に配置
    const rubyY = -this.rubyOffset; // 行高を基準に配置
    let rubyX = center - rubyWidthSum / 2;
    tmpRubyList.forEach((ruby: LayerChar) => {
      ruby.y = rubyY;
      ruby.x = rubyX;
      rubyX += ruby.width + pitch;
      this.rubyList.push(ruby);
    });
  }

  public reserveRubyText(rubyText: string, rubyFontSize: number, rubyOffset: number, rubyPitch: number): void {
    this.rubyText = rubyText;
    this.rubyFontSize = rubyFontSize;
    this.rubyOffset = rubyOffset;
    this.rubyPitch = rubyPitch;
  }

  public getCh(index: number): LayerChar {
    return this.chList[index];
  }

  public getTailCh(): LayerChar {
    return this.chList[this.chList.length - 1];
  }

  public backspace(): void {
    this.chList[this.chList.length - 1].destroy();
    this.chList.splice(this.chList.length - 1, 1);
  }

  /**
   * 描画前更新
   * @param tick 時刻
   * @return 更新があった場合はtrue
   */
  public beforeDraw(tick: number): boolean {
    let updated = false;
    this.chList.forEach(ch => {
      if (ch.beforeDraw(tick)) {
        updated = true;
      }
    });
    return updated;
  }

  private static storeParams: string[] = [
    "x",
    "y",
    "lineHeight",
    "_textX",
    "rubyText",
    "rubyFontSize",
    "rubyOffset",
    "rubyPitch",
  ];

  public copyTo(dest: LayerTextLine): void {
    dest.clear();

    const me: any = this as any;
    const you: any = dest as any;
    LayerTextLine.storeParams.forEach(p => (you[p] = me[p]));

    this.chList.forEach((layerChar: LayerChar) => {
      dest.chList.push(layerChar.clone().addTo(dest.container));
    });
    this.rubyList.forEach((layerRuby: LayerChar) => {
      dest.rubyList.push(layerRuby.clone().addTo(dest.container));
    });
  }
}

export class LayerTextCanvas {
  /** 禁則文字（行頭禁則文字） */
  public static headProhibitionChar: string =
    '%),:;]}｡｣ﾞﾟ。，、．：；゛゜ヽヾゝ"ゞ々’”）〕］｝〉》」』】°′″℃￠％‰' +
    "!.?､･ｧｨｩｪｫｬｭｮｯｰ・？！ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ";
  /** 禁則文字（行末禁則文字） */
  public static tailProhibitionChar: string = "\\$([{｢‘“（〔［｛〈《「『【￥＄￡";

  private container: PIXI.Container;
  private _width: number = 32;
  private _height: number = 32;

  private lines: LayerTextLine[] = [];
  private updated: boolean = true; // 描画しなおすかどうかフラグ

  public style: TextStyle = new TextStyle();
  public lineHeight: number = 0;
  public linePitch: number = 5;

  public marginTop: number = 10;
  public marginRight: number = 10;
  public marginBottom: number = 10;
  public marginLeft: number = 10;
  public autoReturn: boolean = true;
  public locatePoint: number | null = null;
  public indentPoint: number | null = null;
  public reservedIndentPoint: number | null = null;
  public reservedIndentClear: boolean = false;
  public align: "left" | "center" | "right" = "left";
  public rubyFontSize: number = 10;
  public rubyOffset: number = 2;
  public rubyPitch: number = 2;

  public get width(): number {
    return this._width;
  }
  public set width(width: number) {
    this._width = width;
    this.clear();
  }

  public get height(): number {
    return this._height;
  }
  public set height(height: number) {
    this._height = height;
    this.clear();
  }

  public get text(): string {
    return this.lines.map(line => line.text).join("\n");
  }

  public constructor() {
    this.lineHeight = +this.style.fontSize;
    this.container = new PIXI.Container();
    // this.container.width = 800;
    // this.container.height = 32;
    this.container.x = 0;
    this.container.y = 0;
    this.clear();
  }

  public addTo(parent: PIXI.Container): LayerTextCanvas {
    parent.addChild(this.container);
    return this;
  }

  public beforeDraw(tick: number): void {
    this.lines.forEach(line => {
      if (line.beforeDraw(tick)) {
        this.updated = true;
      }
    });
  }

  public get currentLine(): LayerTextLine {
    return this.lines[this.lines.length - 1];
  }

  public addText(text: string): void {
    if (text == null || text === "") {
      return;
    }
    for (let i = 0; i < text.length; i++) {
      this.addChar(text.charAt(i));
    }
  }

  public addChar(ch: string): void {
    if (ch == null || ch == "") {
      return;
    }
    if (ch.length > 1) {
      return this.addText(ch);
    }

    this.updated = true; // 更新予約
    const currentLine = this.currentLine;

    // いったん、現在の行に文字を追加する
    const tail = currentLine.getTailCh();
    currentLine.addChar(ch, this.style, this.lineHeight);

    this.alignCurrentTextLine();

    // 自動改行判定
    let newLineFlag = this.autoReturn && this.shouldBeNewTextLine();
    if (newLineFlag && tail != null && LayerTextCanvas.tailProhibitionChar.indexOf(tail.ch) !== -1) {
      // 改行すると行末禁止文字で終わってしまう場合は改行しない。
      newLineFlag = false;
    }
    if (newLineFlag && LayerTextCanvas.headProhibitionChar.indexOf(ch) !== -1) {
      // 改行すると行頭禁止文字から始まってしまう場合は、自動改行しない。
      newLineFlag = false;
    }
    if (newLineFlag) {
      // 一度文字を追加してしまっているので、削除して行揃えし直す。
      currentLine.backspace();
      this.alignCurrentTextLine();
      // 改行して、改めて文字を追加する。
      this.addTextReturn();
      this.currentLine.addChar(ch, this.style, this.lineHeight);
      this.alignCurrentTextLine();
    }
  }

  /**
   * 次の文字の表示位置を取得する
   * @param chWidth 追加しようとしている文字の横幅
   * @return 表示位置
   */
  public getNextTextPos(chWidth: number): { x: number; y: number; newLineFlag: boolean } {
    const currentLine = this.currentLine;
    const right = currentLine.x + currentLine.width;
    let x = 0;
    let y = currentLine.y;
    let newLineFlag = false;
    switch (this.align) {
      case "left":
        if (this.shouldBeNewTextLine(chWidth)) {
          x = this.getTextLineBasePoint();
          y = this.currentLine.y + this.lineHeight + this.linePitch;
          newLineFlag = true;
        } else {
          x = right;
          y = currentLine.y;
        }
        break;
      case "center":
        if (this.shouldBeNewTextLine(chWidth)) {
          x = this.getTextLineBasePoint() - chWidth / 2;
          y = this.currentLine.y + this.lineHeight + this.linePitch;
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
          y = this.currentLine.y + this.lineHeight + this.linePitch;
          newLineFlag = true;
        } else {
          x = right;
          y = currentLine.y;
        }
        break;
    }
    return { x, y, newLineFlag };
  }

  /**
   * 改行が必要かどうかを返す（自動改行の判定用）
   * @param chWidth 追加する文字の幅
   * @return 改行が必要ならtrue
   */
  protected shouldBeNewTextLine(chWidth = 0): boolean {
    const currentLine = this.currentLine;
    const left = currentLine.x;
    const right = currentLine.x + currentLine.width;
    switch (this.align) {
      case "left":
        return right + chWidth > this.width - this.marginRight;
      case "center":
        return left - chWidth / 2 < this.marginLeft || right + chWidth / 2 > this.width - this.marginRight;
      case "right":
        return left - chWidth < this.marginLeft;
    }
  }

  /**
   * テキストを改行する
   */
  public addTextReturn(): void {
    const preLineY = this.currentLine.y;
    this.lines.push(new LayerTextLine().addTo(this.container));
    if (this.reservedIndentPoint != null) {
      this.indentPoint = this.reservedIndentPoint;
    } else if (this.reservedIndentClear) {
      this.indentPoint = null;
      this.reservedIndentClear = false;
    }
    this.locatePoint = null;
    this.alignCurrentTextLine();
    this.currentLine.y = preLineY + this.lineHeight + this.linePitch;
  }

  /**
   * 現在描画中のテキスト行をの位置をtextAlignにそろえる
   */
  public alignCurrentTextLine(): void {
    const currentLine = this.currentLine;
    switch (this.align) {
      case "left":
        currentLine.x = this.getTextLineBasePoint();
        break;
      case "center":
        currentLine.x = this.getTextLineBasePoint() - currentLine.width / 2;
        break;
      case "right":
        currentLine.x = this.getTextLineBasePoint() - currentLine.width;
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
    if (this.locatePoint != null) {
      return this.locatePoint;
    }
    switch (this.align) {
      case "left":
        return this.indentPoint == null ? this.marginLeft : this.indentPoint;
      case "center":
        return this.indentPoint == null
          ? (this.width - this.marginLeft - this.marginRight) / 2
          : (this.width - this.indentPoint - this.marginRight) / 2;
      case "right":
        return this.indentPoint == null ? this.width - this.marginRight : this.indentPoint;
    }
  }

  /**
   * テキストの表示位置を指定する。
   * 内部的には、指定前とは別の行として扱われる。
   * @param x x座標
   * @param y y座標
   */
  public setCharLocate(x: number | null, y: number | null): void {
    const preLine = this.currentLine;
    this.addTextReturn();
    const currentLine = this.currentLine;
    if (x != null) {
      this.locatePoint = x;
    } else {
      // yだけ変えるときのxを自動算出
      switch (this.align) {
        case "left":
          this.locatePoint = preLine.x + preLine.width;
          break;
        case "center":
          this.locatePoint = preLine.x + preLine.width / 2;
          break;
        case "right":
          this.locatePoint = preLine.x;
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
    const currentLine = this.currentLine;
    switch (this.align) {
      case "left":
      case "center":
        this.reservedIndentPoint = currentLine.x + currentLine.width;
        break;
      case "right":
        this.reservedIndentPoint = currentLine.x;
        break;
    }
  }

  /**
   * インデント位置をクリアする
   */
  public clearIndentPoint(): void {
    this.reservedIndentPoint = null;
    this.reservedIndentClear = true;
  }

  /**
   * ルビの設定を予約
   * @param rubyText ルビ文字
   */
  public reserveRubyText(rubyText: string): void {
    this.currentLine.reserveRubyText(rubyText, this.rubyFontSize, this.rubyOffset, this.rubyPitch);
  }

  /**
   * テキストをクリアする。
   * 描画していたテキストは全削除される。
   * テキストの描画開始位置は初期化される。
   * インデント位置は初期化される。
   */
  public clear(): void {
    this.lines.forEach(line => {
      line.destroy();
    });
    this.lines = [];
    this.lines.push(new LayerTextLine().addTo(this.container));
    this.locatePoint = null;
    this.indentPoint = null;
    this.reservedIndentPoint = null;
    this.reservedIndentClear = false;

    this.currentLine.x = this.getTextLineBasePoint();
    this.currentLine.y = this.marginTop;
    this.updated = true;
  }

  private static storeParams: string[] = [
    "lineHeight",
    "linePitch",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "autoReturn",
    "locatePoint",
    "indentPoint",
    "reservedIndentPoint",
    "reservedIndentClear",
    "align",
    "rubyFontSize",
    "rubyOffset",
    "rubyPitch",
  ];

  public copyTo(dest: LayerTextCanvas): void {
    dest.clear();
    dest.width = this.width;
    dest.height = this.height;
    dest.style = this.style.clone();

    const me = this as any;
    const you = dest as any;
    LayerTextCanvas.storeParams.forEach(p => (you[p] = me[p]));

    dest.lines = [];
    this.lines.forEach(line => {
      const destLine = new LayerTextLine().addTo(dest.container);
      line.copyTo(destLine);
      dest.lines.push(destLine);
    });
  }

  public store(tick: number): any {
    const data: any = {};
    const me: any = this as any;
    LayerTextCanvas.storeParams.forEach(p => (data[p] = me[p]));
    // data.lines = [];
    // this.lines.forEach(line => {
    //   data.lines.push(line.store(tick));
    // });
    data.width = this.width;
    data.height = this.height;
    data.style = this.style.store(tick);

    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    const me: any = this as any;
    LayerTextCanvas.storeParams.forEach(p => (me[p] = data[p]));

    if (clear) {
      this.clear();
    }
    // MEMO:
    //   テキストをクリアしない場合でも、キャンバスのサイズが変化しているなら、
    //   しょうがないのでサイズ変更する。
    if (this.width != data.width) {
      this.clear();
      this.width = data.width;
    }
    if (this.height != data.height) {
      this.clear();
      this.height = data.height;
    }
    this.style.restore(data.style, tick, clear);
  }

  /**
   * コンフィグを反映する。
   * このメソッドでは単純に値の設定のみ行うため、
   * 画像読み込みなどの非同期処理が必要なものには対応していない。
   */
  public applyConfig(config: any): void {
    if (config != null) {
      const me = this as any;
      Object.keys(config).forEach(key => {
        if (key in me) {
          me[key] = config[key];
        }
      });
      if (config.styleConfig != null) {
        this.style.applyConfig(config.styleConfig);
      }
    }
  }
}

// 日本語フォントの上部が見切れてしまう問題の対処
PIXI.TextMetrics.BASELINE_SYMBOL += "ぽン甘｜|gq";
