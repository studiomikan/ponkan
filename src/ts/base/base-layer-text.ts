import * as PIXI from "pixi.js";
import { Ease } from "./util";

export type InEffectType = "alpha" | "move" | "alphamove";

enum InEffectState {
  Stop = 0,
  Run,
}

/**
 * テキストスタイル
 */
export class TextStyle {
  public static METRICS_STRING = "ぽン甘｜|gq";

  public fontFamily: string[] = ["GenShinGothic", "monospace"];
  public fontSize: number = 24;
  public fontWeight: string | number = "normal";
  public fontStyle: "normal" | "italic" = "normal";
  public color: string[] = ["#ffffff"];
  public textBaseline: CanvasTextBaseline = "alphabetic";
  public shadow: boolean = false;
  public _shadowAlpha: number = 1.0;
  public _shadowColor: string = "#000000";
  public shadowAngle: number = Math.PI / 6;
  public shadowBlur: number = 5;
  public shadowDistance: number = 2;
  public edgeWidth: number = 0;
  public _edgeColor: string = "#000000";
  public _edgeAlpha: number = 1.0;
  public pitch: number = 0;
  public fillGradientStops: number[] = [];
  public fillGradientType: "vertical" | "horizontal" = "vertical";
  public inEffectTypes: InEffectType[] = [];
  public inEffectTime: number = 100;
  public inEffectEase: "none" | "in" | "out" | "both" = "none";
  public inEffectOptions: any = {};

  private gradient: CanvasGradient | null = null;
  private shadowColorStrBuf: string = "";
  private edgeColorStrBuf: string = "";

  public setColor(color: number | string | any[]): void {
    if (color == null) {
      this.color = ["#ffffff"];
    } else if (typeof color === "number") {
      this.color = [PIXI.utils.hex2string(color)];
    } else if (typeof color === "string") {
      this.color = [color];
    } else {
      this.color = color.map(c => (typeof c === "number" ? PIXI.utils.hex2string(c) : "" + c));
    }
  }

  public get shadowColor(): string {
    return this._shadowColor;
  }
  public setShadowColor(c: number | string): void {
    this._shadowColor = typeof c == "number" ? PIXI.utils.hex2string(c) : c;
    this.shadowColorStrBuf = this.shadowColorStr;
  }

  public get shadowAlpha(): number {
    return this._shadowAlpha;
  }
  public set shadowAlpha(shadowAlpha: number) {
    this._shadowAlpha = shadowAlpha;
    this.shadowColorStrBuf = this.shadowColorStr;
  }

  public get edgeColor(): string {
    return this._edgeColor;
  }
  public setEdgeColor(c: number | string): void {
    this._edgeColor = typeof c == "number" ? PIXI.utils.hex2string(c) : c;
    this.edgeColorStrBuf = this.edgeColorStr;
  }

  public get edgeAlpha(): number {
    return this._edgeAlpha;
  }
  public set edgeAlpha(edgeAlpha: number) {
    this._edgeAlpha = edgeAlpha;
    this.edgeColorStrBuf = this.edgeColorStr;
  }

  public get fontFamilyStr(): string {
    return this.fontFamily.map(ff => `"${ff}"`).join(",");
  }

  public get font(): string {
    return `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamilyStr}`;
  }

  public get shadowColorStr(): string {
    const rgb: number[] = PIXI.utils.hex2rgb(PIXI.utils.string2hex(this._shadowColor));
    return `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${this._shadowAlpha})`;
  }

  public get edgeColorStr(): string {
    const rgb: number[] = PIXI.utils.hex2rgb(PIXI.utils.string2hex(this._edgeColor));
    return `rgba(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255},${this._edgeAlpha})`;
  }

  private genGradient(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): CanvasGradient {
    const textMetrix: TextMetrics = context.measureText(TextStyle.METRICS_STRING);
    const x1 = offsetX;
    const y1 = offsetY - textMetrix.actualBoundingBoxAscent;
    const x2 = offsetX;
    const y2 = offsetY + textMetrix.actualBoundingBoxDescent;
    const g = context.createLinearGradient(x1, y1, x2, y2);
    const length = this.color.length;
    for (let i = 0; i < length; i++) {
      let stop = this.fillGradientStops[i];
      if (stop == null) {
        stop = i / (length - 1);
      }
      g.addColorStop(stop, this.color[i]);
    }
    return g;
  }

  public getChWidth(context: CanvasRenderingContext2D, ch: string): number {
    context.font = this.font;
    context.strokeStyle = this.edgeColor;
    context.lineWidth = this.edgeWidth;
    context.fillStyle = "#FFFFFF";
    context.textBaseline = this.textBaseline;
    return context.measureText(ch).width;
  }

  public applyStyleTo(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    if (this.edgeColorStrBuf === "") {
      this.edgeColorStrBuf = this.edgeColorStr;
    }
    context.font = this.font;
    context.strokeStyle = this.edgeColorStrBuf;
    context.lineWidth = this.edgeWidth;
    context.textBaseline = this.textBaseline;
    if (this.color.length > 1) {
      if (this.gradient == null) {
        this.gradient = this.genGradient(context, offsetX, offsetY);
      }
      context.fillStyle = this.gradient;
    } else {
      context.fillStyle = this.color[0];
    }
  }

  public applyShadowTo(context: CanvasRenderingContext2D): void {
    if (this.shadow) {
      if (this.shadowColorStrBuf === "") {
        this.shadowColorStrBuf = this.shadowColorStr;
      }
      context.shadowColor = this.shadowColorStrBuf;
      context.shadowBlur = this.shadowBlur;
      context.shadowOffsetX = this.shadowDistance;
      context.shadowOffsetY = this.shadowDistance;
    } else {
      this.clearShadowFrom(context);
    }
  }

  public clearShadowFrom(context: CanvasRenderingContext2D): void {
    context.shadowColor = "rgba(0,0,0,0)";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
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
    return Object.assign(new TextStyle(), this);
  }

  public resetGradientBuffer(): void {
    this.gradient = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public store(tick: number): any {
    const data: any = {};
    Object.assign(data, this.clone());
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    Object.assign(this, data);
  }
}

/**
 * レイヤーに描画する文字の情報。
 * 文字と位置などの情報のみ持ち、canvasなどは持たない。
 */
export class LayerChar {
  public readonly ch: string;
  public readonly style: TextStyle;
  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  public alpha: number = 1.0;

  private inEffectState: InEffectState = InEffectState.Stop;
  private inEffectStartTick: number = -1;
  private _offsetX: number = 0;
  private _offsetY: number = 0;

  public constructor(context: CanvasRenderingContext2D, ch: string, style: TextStyle, x: number, y: number) {
    this.ch = ch;
    this.style = style.clone();
    this.x = x;
    this.y = y;
    this.width = style.getChWidth(context, ch) + style.pitch;
    this.style.checkOptions();
    this.style.resetGradientBuffer();
    if (this.style.inEffectTypes != null && this.style.inEffectTypes.length > 0) {
      this.inEffectState = InEffectState.Run;
    }
  }

  public clone(context: CanvasRenderingContext2D): LayerChar {
    // const c = new LayerChar(context, this.ch, this.style, this.x, this.y);
    // c.width = this.width;
    // c.alpha = this.alpha;
    // c.inEffectState = this.inEffectState;
    // c.inEffectStartTick = this.inEffectStartTick;
    // c._offsetX = this._offsetX;
    // c._offsetY = this._offsetY;
    // return c;
    return Object.assign(new LayerChar(context, this.ch, this.style, this.x, this.y), this);
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

  private InEffectAlpha(elapsedTime: number, phase: number): void {
    this.alpha = phase;
  }

  private InEffectMove(elapsedTime: number, phase: number): void {
    this._offsetX = Math.floor(this.style.inEffectOptions.offsetx * (1 - phase));
    this._offsetY = Math.floor(this.style.inEffectOptions.offsety * (1 - phase));
  }

  public draw(context: CanvasRenderingContext2D, tick: number, offsetX: number, offsetY: number): void {
    const x = Math.floor(this.x + this._offsetX + offsetX) + 0.5;
    const y = Math.floor(this.y + this._offsetY + offsetY) + 0.5;
    context.globalAlpha = this.alpha;
    if (this.style.edgeWidth > 0) {
      // 縁取りする場合：縁取りと影を描画->本体描画
      this.style.applyStyleTo(context, x, y);
      this.style.applyShadowTo(context);
      context.strokeText(this.ch, x, y);
      this.style.clearShadowFrom(context);
      // this.style.applyStyleTo(context, x, y);
      context.fillText(this.ch, x, y); // 影なし
    } else {
      // 縁取りしない場合：本体と影を描画
      this.style.applyStyleTo(context, x, y);
      this.style.applyShadowTo(context);
      context.fillText(this.ch, x, y); // 影あり
    }
    // console.log("draw layerChar", this.x, this.y, this.ch, this.style.font);
  }
}

export class LayerTextLine {
  public x: number = 0;
  public y: number = 0;
  public lineHeight: number = 0;
  public readonly chList: LayerChar[] = [];
  public readonly rubyList: LayerChar[] = [];

  private _textX: number = 0;

  private rubyText: string = "";
  private rubyFontSize: number = 10;
  private rubyOffset: number = 2;
  private rubyPitch: number = 2;

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
  }

  public clear(): void {
    this.chList.splice(0, this.chList.length);
    this.rubyList.splice(0, this.rubyList.length);
    this.lineHeight = 0;
    this.rubyText = "";
    this.rubyFontSize = 10;
    this.rubyOffset = 2;
    this.rubyPitch = 2;
  }

  public addChar(context: CanvasRenderingContext2D, ch: string, style: TextStyle, lineHeight: number): void {
    // if (this.lineHeight < lineHeight) {
    //   // 自動で行の高さを拡張
    //   this.lineHeight = lineHeight;
    // }
    const x = this._textX;
    const y = lineHeight;
    const c = new LayerChar(context, ch, style, x, y);
    this._textX += c.width;
    this.chList.push(c);
    // ルビがあったら追加する
    if (this.rubyText !== "") {
      this.addRubyText(context, c, style);
      this.rubyText = "";
    }
  }

  private addRubyText(context: CanvasRenderingContext2D, targetChar: LayerChar, srcTextStyle: TextStyle): void {
    const rubyStyle = srcTextStyle.clone();
    rubyStyle.fontSize = this.rubyFontSize;
    const rubyText = this.rubyText;
    const pitch = this.rubyPitch;
    const center = targetChar.x + targetChar.width / 2;
    const tmpRubyList: LayerChar[] = [];
    let rubyWidthSum = 0;
    for (let i = 0; i < rubyText.length; i++) {
      const ruby = new LayerChar(context, rubyText.charAt(i), rubyStyle, 0, 0); // 位置は一旦0,0で作る
      tmpRubyList.push(ruby);
      rubyWidthSum += ruby.width;
    }
    rubyWidthSum -= pitch; // 最後の一文字のpitchは幅に含めない
    // 追加対象の文字に対して中央揃えとなるように配置する
    // const rubyY = targetChar.y - targetChar.style.fontSize - this.rubyOffset;
    const rubyY = -this.rubyOffset;
    let rubyX = center - rubyWidthSum / 2;
    tmpRubyList.forEach((ruby: LayerChar) => {
      ruby.y = rubyY;
      ruby.x = rubyX;
      rubyX += ruby.width;
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
    // this.chList[this.chList.length - 1].destroy();
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

  public draw(context: CanvasRenderingContext2D, tick: number): void {
    this.chList.forEach((layerChar: LayerChar) => {
      layerChar.draw(context, tick, this.x, this.y);
    });
    this.rubyList.forEach((layerChar: LayerChar) => {
      layerChar.draw(context, tick, this.x, this.y);
    });
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

  public copyTo(context: CanvasRenderingContext2D, dest: LayerTextLine): void {
    dest.clear();

    const me: any = this as any;
    const you: any = dest as any;
    LayerTextLine.storeParams.forEach(p => (you[p] = me[p]));

    this.chList.forEach((layerChar: LayerChar) => {
      dest.chList.push(layerChar.clone(context));
    });
    this.rubyList.forEach((layerRuby: LayerChar) => {
      dest.rubyList.push(layerRuby.clone(context));
    });
  }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // public store(tick: number): any {
  //   const data: any = {};
  //   const me: any = this as any;
  //   LayerTextLine.storeParams.forEach(p => (data[p] = me[p]));
  //   return data;
  // }

  // public async restore(data: any, tick: number, clear: boolean): Promise<void> {
  //   if (clear) {
  //     this.clear();
  //   }
  //   const me: any = this as any;
  //   LayerTextLine.storeParams.forEach(p => (me[p] = data[p]));
  // }
}

export class LayerTextCanvas {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;
  public readonly sprite: PIXI.Sprite;

  /** 禁則文字（行頭禁則文字） */
  public static headProhibitionChar: string =
    '%),:;]}｡｣ﾞﾟ。，、．：；゛゜ヽヾゝ"ゞ々’”）〕］｝〉》」』】°′″℃￠％‰' +
    "!.?､･ｧｨｩｪｫｬｭｮｯｰ・？！ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ";
  /** 禁則文字（行末禁則文字） */
  public static tailProhibitionChar: string = "\\$([{｢‘“（〔［｛〈《「『【￥＄￡";

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
    return this.canvas.width;
  }
  public set width(width: number) {
    this.canvas.width = width;
    this.clear();
  }

  public get height(): number {
    return this.canvas.height;
  }
  public set height(height: number) {
    this.canvas.height = height;
    this.clear();
  }

  public get text(): string {
    return this.lines.map(line => line.text).join("\n");
  }

  public constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    this.lineHeight = this.style.fontSize;

    this.canvas.width = 800;
    this.canvas.height = 32;
    this.clear();

    this.sprite = new PIXI.Sprite(PIXI.Texture.from(this.canvas));
    this.sprite.anchor.set(0);
    this.sprite.x = 0;
    this.sprite.y = 0;
  }

  public beforeDraw(tick: number): void {
    this.lines.forEach(line => {
      if (line.beforeDraw(tick)) {
        this.updated = true;
      }
    });
  }

  public draw(tick: number): void {
    // if (this.updated) {
    const context = this.context;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.lines.forEach(line => {
      line.draw(context, tick);
    });
    this.sprite.texture.update();
    this.updated = false;
    // }
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
    currentLine.addChar(this.context, ch, this.style, this.lineHeight);

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
      this.currentLine.addChar(this.context, ch, this.style, this.lineHeight);
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
    this.lines.push(new LayerTextLine());
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
    this.lines.forEach(line => line.clear());
    this.lines.splice(0, this.lines.length);
    this.lines.push(new LayerTextLine());
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
      const destLine = new LayerTextLine();
      line.copyTo(this.context, destLine);
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
  }
}
