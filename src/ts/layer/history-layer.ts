import { AsyncTask } from "../base/async-task";
import { BaseLayer } from "../base/base-layer";
import { Logger } from "../base/logger";
import { PonEventHandler } from "../base/pon-event-handler";
import { PonGame } from "../base/pon-game";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { PonWheelEvent } from "../base/pon-wheel-event";
import { Resource } from "../base/resource";
import * as Util from "../base/util";
import { Ponkan3 } from "../ponkan3";

class SimpleButton extends BaseLayer {
  protected bgColors: number[] = [0xFF0000, 0x00FF00, 0x0000FF];
  protected bgAlphas: number[] = [1.0, 1.0, 1.0];
  protected status: "normal" | "over" | "on" = "normal";
  public mouseEnter: (sender: SimpleButton) => void = () => {
    return;
  }
  public mouseLeave: (sender: SimpleButton) => void = () => {
    return;
  }
  public mouseMove: (sender: SimpleButton) => void = () => {
    return;
  }
  public mouseDown: (sender: SimpleButton) => void = () => {
    return;
  }
  public mouseUp: (sender: SimpleButton) => void = () => {
    return;
  }

  public initButton(
    bgColors: number[],
    bgAlphas: number[],
  ) {
    this.bgColors = bgColors;
    this.bgAlphas = bgAlphas;

    this.setStatus("normal");
    this.visible = true;
  }

  public setStatus(status: "normal" | "over" | "on") {
    this.status = status;
    const c = { normal: 0, over: 1, on: 2 }[status];
    this.setBackgroundColor(this.bgColors[c], this.bgAlphas[c]);
    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor[status];
  }

  public onMouseEnter(e: PonMouseEvent): void {
    super.onMouseEnter(e);

    this.setStatus("over");
    this.mouseEnter(this);
  }

  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);

    this.setStatus("normal");
    this.mouseLeave(this);
  }

  public onMouseMove(e: PonMouseEvent): void {
    super.onMouseMove(e);

    if (this.isInsideEvent(e)) {
      this.mouseMove(this);
    }
  }

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);

    if (this.isInsideEvent(e)) {
      this.setStatus("on");
      this.mouseDown(this);
    }
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);

    if (this.isInsideEvent(e)) {
      if (this.status !== "on") { return; }
      if (!e.isLeft) { return; }
      this.mouseUp(this);
      this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
    }
  }
}

class ScrollBarButton extends SimpleButton {
  public down: boolean = false;
  public downX: number = 0;
  public downY: number = 0;

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);

    this.down = true;
    this.downX = e.y;
    this.downY = e.y;
  }

  public onMouseMove(e: PonMouseEvent): void {
    super.onMouseMove(e);
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);

    if (!e.isLeft) { return; }
    this.down = false;
  }
}

class ScrollBar extends BaseLayer {

  protected minHeight: number = 16;
  protected bar: ScrollBarButton;
  public onChangeCallback: (sender: ScrollBar) => void = () => {
    return;
  }

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.bar = new ScrollBarButton("ScrollBarButton", resource, owner);
  }

  public initScrollBar(
    config: any,
    buttonColors: number[],
    buttonAlphas: number[],
    minHeight: number,
  ): void {
    // super.initButton(bgColors, bgAlphas);
    this.minHeight = minHeight;
    this.visible = true;
    this.applyConfig(config);

    this.bar.initButton(buttonColors, buttonAlphas);
    this.bar.x = 0;
    this.bar.y = 0;
    this.bar.width = this.width;
    this.bar.height = this.width;
    this.addChild(this.bar);
  }

  public setValues(
    currentPoint: number,
    maxPoint: number,
    linesCount: number,
    screenLineCount: number,
  ) {
    if (linesCount <= screenLineCount) {
      this.bar.visible = false;
      return;
    }

    let height: number = Math.floor(this.height * screenLineCount / linesCount);
    if (height < this.minHeight) { height = this.minHeight; }
    if (height > this.height) { height = this.height; }

    let y: number;
    if (currentPoint === 0) {
      y = 0;
    } else if (currentPoint === maxPoint) {
      y = this.height - height;
    } else {
      y = Math.floor((this.height - height) * (currentPoint / maxPoint));
    }

    this.bar.height = height;
    this.bar.y = y;
    this.bar.visible = true;
  }

  public onMouseEnter(e: PonMouseEvent): void {
    super.onMouseEnter(e);

    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.over;
    e.stopPropagation();
  }

  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);

    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
    e.stopPropagation();
  }

  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);
    e.stopPropagation();
  }

  public onMouseMove(e: PonMouseEvent): void {
    super.onMouseMove(e);

    this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.over;
    if (this.bar.down) {
      this.setBarY(e.y - this.bar.downY);
      this.onChangeCallback(this);
    }
    e.stopPropagation();
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);

    if (!e.isLeft) { return; }
    this.setBarY(e.y - (this.bar.height / 2));
    this.onChangeCallback(this);
    // FIXME eの中身がおかしいが、現状使ってないのでこのまま
    this.bar.onMouseUp(new PonMouseEvent(0, 0, 0));
    e.stopPropagation();
  }

  protected setBarY(y: number): void {
    const maxY: number = this.height - this.bar.height;
    if (y < 0) { y = 0; }
    if (y > maxY) { y = maxY; }
    this.bar.y = y;
  }

  public getBarPoint(): number {
    const y: number = this.bar.y;
    const maxY: number = this.height - this.bar.height;
    if (y === 0) {
      return 0.0;
    } else if (y === maxY) {
      return 1.0;
    } else {
      return y / maxY;
    }
  }

  public get dragging(): boolean {
    return this.bar.down;
  }

}

class HistoryTextLayer extends BaseLayer {

  protected lines: string[][] = [[]];
  protected indentPoints: number[] = [-1];
  protected clearIndentPoints: number[] = [-1];
  public get currentLine(): string[] { return this.lines[this.lines.length - 1]; }
  public scrollOffLines: number = 3;
  protected point: number = 0;
  protected lazyRedrawFlag: boolean = false;

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.visible = true;
  }

  public init(config: any): void {
    this.width = config.width;
    this.height = config.height;
    this.textAutoReturn = true;

    if (config.history != null && config.history.text) {
      this.applyConfig(config.history.text);
    }

    this.point = 0;
    this.clear();
  }

  public clear(): void {
    this.lines = [[]];
    this.indentPoints = [-1];
    this.clearIndentPoints = [-1];
  }

  public add(ch: string): void {
    this.currentLine.push(ch);
  }

  public textReturn(): void {
    this.lines.push([]);
    this.indentPoints.push(-1);
    this.clearIndentPoints.push(-1);
  }

  public setHistoryIndentPoint(): void {
    this.indentPoints[this.indentPoints.length - 1] = this.currentLine.length - 1;
  }

  public clearHistoryIndentPoint(): void {
    this.clearIndentPoints[this.clearIndentPoints.length - 1] = this.currentLine.length - 1;
  }

  public scrollUp(count: number = 1): void {
    this.point -= count;
    this.fixPoint();
  }

  public scrollDown(count: number = 1): void {
    this.point += count;
    this.fixPoint();
  }

  public scrollUpPage(): void {
    this.scrollUp(this.screenLineCount - this.scrollOffLines);
  }

  public scrollDownPage(): void {
    this.scrollDown(this.screenLineCount - this.scrollOffLines);
  }

  public goTo(point: number): void {
    this.point = point;
    this.fixPoint();
  }

  public goToEnd(): void {
    this.point = this.maxPoint;
  }

  private fixPoint() {
    if (this.point < 0) { this.point = 0; }
    if (this.point > this.maxPoint) { this.point = this.maxPoint; }
  }

  public redraw(): void {
    this.clearText();

    const max = this.point + this.screenLineCount;
    for (let i = this.point; i < max && i < this.lines.length; i++) {
      const indentPoint = this.indentPoints[i];
      const clearIndentPoint = this.clearIndentPoints[i];
      this.lines[i].forEach((ch, index) => {
        this.addChar(ch);
        if (index === indentPoint) {
          this.setIndentPoint();
        }
        if (index === clearIndentPoint) {
          this.clearIndentPoint();
        }
      });
      this.addTextReturn();
    }
    // this.clearIndentPoint();
  }

  public redrawLazy(): void {
    this.lazyRedrawFlag = true;
  }

  public update(tick: number): void {
    super.update(tick);

    if (this.lazyRedrawFlag) {
      this.redraw();
      this.lazyRedrawFlag = false;
    }
  }

  public get screenLineCount(): number {
    const lineHeight = (this.textLineHeight + this.textLinePitch);
    const areaHeight = this.height - this.textMarginTop - this.textMarginBottom + this.textLinePitch;
    return Math.floor(areaHeight / lineHeight);
  }

  public get maxPoint(): number {
    const max = this.lines.length - 1 - this.screenLineCount;
    if (max < 0) {
      return 0;
    } else {
      return max;
    }
  }

  public get currentPoint(): number {
    return this.point;
  }

  public get linesCount(): number {
    return this.lines.length;
  }
}

/**
 * 履歴レイヤ
 */
export class HistoryLayer extends BaseLayer {

  protected config: any;
  protected textLayer: HistoryTextLayer;
  protected upButton: SimpleButton;
  protected downButton: SimpleButton;
  protected scrollBar: ScrollBar;
  protected closeButton: SimpleButton;
  public wheelScrollCount: number = 3;
  public outputFlag: boolean = true;

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.textLayer = new HistoryTextLayer("HistoryText", resource, owner);
    this.upButton = new SimpleButton("ScrollUpButton", resource, owner);
    this.downButton = new SimpleButton("ScrollDownButton", resource, owner);
    this.scrollBar = new ScrollBar("ScrollBar", resource, owner);
    this.closeButton = new SimpleButton("CloseButton", resource, owner);
  }

  public init(config: any = {}, asyncTask: AsyncTask) {
    if (config.history == null) { config.history = {}; }
    if (config.history.text == null) { config.history.text = {}; }
    if (config.history.upButton == null) { config.history.upButton = {}; }
    if (config.history.downButton == null) { config.history.downButton = {}; }
    if (config.history.scrollBar == null) { config.history.scrollBar = {}; }
    if (config.history.closeButton == null) { config.history.closeButton = {}; }

    this.x = 0;
    this.y = 0;
    this.width = config.width;
    this.height = config.height;
    this.wheelScrollCount = config.history.wheelScrollCount || 3;

    // 背景
    if (config.history.backgroundImage != null) {
      asyncTask.add(() => {
        return this.loadImage(config.history.backgroundImage);
      });
    }

    // テキスト
    this.textLayer.init(config);
    this.textLayer.visible = true;
    this.addChild(this.textLayer);

    // ボタン
    this.initScrollButtons(config);

    // スクロールバー
    this.initScrollBar(config);

    // 閉じるボタン
    this.initCloseButton(config);

    const hc: any = config.history != null ? config.history : {};
  }

  protected initScrollButtons(config: any): void {
    // TODO サイズ等を設定できるように
    const init = (button: SimpleButton, conf: any) => {
      if (conf.bgColors == null) { conf.bgColors = [0x4286f4, 0x4286f4, 0x4286f4]; }
      if (conf.bgAlphas == null) { conf.bgAlphas = [0.7, 0.8, 0.9]; }
      button.visible = true;
      button.width = 32;
      button.height = 32;
      button.initButton(conf.bgColors, conf.bgAlphas);
      button.textColor = 0xFFFFFF;
      button.textFontFamily = ["GenShinGothic", "monospace"];
      button.textFontSize = 16;
      button.textLineHeight = 16;
      button.textMarginLeft = 0;
      button.textMarginRight = 0;
      button.textMarginTop = 6;
      button.textAlign = "center";
      this.addChild(button);
    };
    init(this.upButton, config.history.upButton); // ;
    init(this.downButton, config.history.downButton);

    this.upButton.x = config.width - 32 - 20;
    this.upButton.y = 20;
    this.upButton.mouseUp = () => { this.scrollUpPage(); };
    this.upButton.applyConfig(config.history.upButton);
    if (config.history.upButton.text == null) { config.history.upButton.text = "▲"; }
    this.upButton.addChar(config.history.upButton.text);

    this.downButton.x = config.width - 32 - 20;
    this.downButton.y = config.height - 32 - 20;
    this.downButton.mouseUp = () => { this.scrollDownPage(); };
    this.downButton.applyConfig(config.history.downButton);
    if (config.history.downButton.text == null) { config.history.downButton.text = "▼"; }
    this.downButton.addChar(config.history.downButton.text);
  }

  protected initScrollBar(config: any): void {
    let c: any = Util.objClone(config.history.scrollBar);
    c = Util.objExtend({
      x: config.width - 32 - 20,
      y: 20 + 32,
      width: 32,
      height: config.height - (32 + 20) * 2,
      backgroundColor: 0x4286f4,
      backgroundAlpha: 0.1,
      bgColors: [0x4286f4, 0x4286f4, 0x4286f4],
      bgAlphas: [0.4, 0.5, 0.6],
      minHeight: 16,
    }, c);

    const sb = this.scrollBar;
    sb.initScrollBar(
      c,
      c.bgColors,
      c.bgAlphas,
      c.minHeight,
    );

    sb.onChangeCallback = () => {
      const p: number = Math.floor(this.textLayer.maxPoint * sb.getBarPoint());
      if (this.textLayer.currentPoint !== p) {
        this.textLayer.goTo(p);
        this.textLayer.redrawLazy();
      }
    };

    this.addChild(sb);
  }

  protected initCloseButton(config: any): void {
    let c: any = Util.objClone(config.history.closeButton);
    c = Util.objExtend({
      x: config.width - 40 - 30,
      y: 15,
      width: 40,
      height: 40,
      textFontFamily: ["GenShinGothic", "monospace"],
      textFontSize: 36,
      textLineHeight: 36,
      textAlign: "center",
      textColor: 0xFFFFFF,
      textMarginTop: 0,
      textMarginRight: 0,
      textMarginBottom: 0,
      textMarginLeft: 0,
      bgColors: [0x000000, 0x000000, 0x000000],
      bgAlphas: [0.0, 0.0, 0.0],
    }, c);
    this.closeButton.initButton(c.bgColors, c.bgAlphas);
    this.closeButton.applyConfig(c);
    this.closeButton.addChar("×");
    this.closeButton.mouseUp = () => { this.hide(); };

    this.addChild(this.closeButton);
  }

  public addHistoryChar(ch: string): void {
    if (this.outputFlag) {
      this.textLayer.add(ch);
      if (this.visible) {
        this.textLayer.redraw();
        this.resetScrollBar();
      }
    }
  }

  public addHistoryTextReturn(): void {
    if (this.outputFlag) {
      this.textLayer.textReturn();
      if (this.visible) {
        this.textLayer.redraw();
        this.resetScrollBar();
      }
    }
  }

  public clearHistory(): void {
    this.textLayer.clear();
  }

  public show(): void {
    // this.textLayer.goToEnd();
    this.textLayer.redraw();
    this.resetScrollBar();
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
    // this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
  }

  public scrollUp(count: number = 1): void {
    this.textLayer.scrollUp(count);
    this.textLayer.redraw();
    this.resetScrollBar();
  }

  public scrollUpPage(): void {
    this.textLayer.scrollUpPage();
    this.textLayer.redraw();
    this.resetScrollBar();
  }

  public scrollDown(count: number = 1): void {
    this.textLayer.scrollDown(count);
    this.textLayer.redraw();
    this.resetScrollBar();
  }

  public scrollDownPage(): void {
    this.textLayer.scrollDownPage();
    this.textLayer.redraw();
    this.resetScrollBar();
  }

  public resetScrollBar(): void {
    this.scrollBar.setValues(
      this.textLayer.currentPoint,
      this.textLayer.maxPoint,
      this.textLayer.linesCount,
      this.textLayer.screenLineCount,
    );
  }

  public setHistoryIndentPoint(): void {
    this.textLayer.setHistoryIndentPoint();
  }

  public clearHistoryIndentPoint(): void {
    this.textLayer.clearHistoryIndentPoint();
  }

  public goToEnd(): void {
    this.textLayer.goToEnd();
  }

  public onMouseEnter(e: PonMouseEvent): void  {
    super.onMouseEnter(e);
    e.stopPropagation();
  }
  public onMouseLeave(e: PonMouseEvent): void {
    super.onMouseLeave(e);
    e.stopPropagation();
  }
  public onMouseMove(e: PonMouseEvent): void {
    super.onMouseMove(e);
    e.stopPropagation();

    // スクロール操作中ははみ出ても操作できるようにする
    const sb = this.scrollBar;
    if (sb.dragging) {
      const e2 = new PonMouseEvent(e.x - sb.x, e.y - sb.y, e.button);
      this.scrollBar.onMouseMove(e2);
    }
  }
  public onMouseDown(e: PonMouseEvent): void {
    super.onMouseDown(e);
    e.stopPropagation();
  }

  public onMouseUp(e: PonMouseEvent): void {
    super.onMouseUp(e);
    e.stopPropagation();

    if (e.isLeft) {
      const sb = this.scrollBar;
      if (sb.dragging) {
        // スクロール操作中ははみ出ても操作できるようにする
        const e2 = new PonMouseEvent(e.x - sb.x, e.y - sb.y, e.button);
        this.scrollBar.onMouseUp(e2);
        this.resource.getForeCanvasElm().style.cursor = this.resource.cursor.normal;
      }
    }
    if (e.isRight) {
      // 右クリックで閉じる
      this.hide();
    }
  }
  public onMouseWheel(e: PonWheelEvent): boolean {
    if (e.isUp) {
      this.scrollUp(this.wheelScrollCount);
    } else {
      this.scrollDown(this.wheelScrollCount);
    }
    return false;
  }
}
