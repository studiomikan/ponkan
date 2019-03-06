import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { PonEventHandler } from "../base/pon-event-handler";
import { PonGame } from "../base/pon-game";
import { Ponkan3 } from "../ponkan3";
import { Button } from "./button";

class SimpleButton extends Button {
  protected color: number = 0xFFFFFF;
  protected bgColors: number[] = [0xFF0000, 0x00FF00, 0x0000FF];
  protected bgAlphas: number[] = [1.0, 1.0, 1.0];
  protected callback: (sender: SimpleButton) => void = function(){};
  protected status: "normal" | "over" | "on" = "normal";

  public init(
    color: number,
    bgColors: number[],
    bgAlphas: number[],
    callback: (sender: SimpleButton) => void
  ) {
    this.color= color;
    this.bgColors = bgColors;
    this.bgAlphas = bgAlphas;
    this.callback = callback;

    this.setStatus("normal");
  }

  public setStatus(status: "normal" | "over" | "on") {
    this.status = status;
    const c = { normal: 0, over: 1, on: 2, }[status];
    this.setBackgroundColor(this.bgColors[c], this.bgAlphas[c]);
    this.resource.getForeCanvasElm().style.cursor = {
      normal: "auto", over: "pointer", on: "pointer"
    }[status];
    console.log(this.status);
  }

  public onMouseEnter(e: PonMouseEvent): boolean {
    // if (!super.onMouseEnter(e)) { return false; }
    this.setStatus("over");
    return true;
  }

  public onMouseLeave(e: PonMouseEvent): boolean {
    // if (!super.onMouseLeave(e)) { return false; }
    this.setStatus("normal");
    return true;
  }

  public onMouseDown(e: PonMouseEvent): boolean {
    // if (!super.onMouseDown(e)) { return false; }
    this.setStatus("on");
    return true;
  }

  public onMouseUp(e: PonMouseEvent): boolean {
    if (this.status !== "on") { return true; }

    alert("onMouseUp");
    return false;
  }
}

class HistoryTextLayer extends BaseLayer {

  protected lines: string[][] = [[]];
  public get currentLine(): string[] { return this.lines[this.lines.length - 1]; }

  protected point: number = 0;

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
  }

  public init(config: any): void {
    let hc: any = config.history != null ? config.history : {};

    this.width = config.width;
    this.height = config.height;
    this.setBackgroundColor(0x000000, 0.5);
    this.textAutoReturn = false;


    this.point = 0;
    this.clear();
  }

  public clear(): void {
    this.lines = [[]];
  }

  public add(ch: string): void {
    // this.addChar(ch);
    this.currentLine.push(ch);
  }

  public textReturn(): void {
    // this.addTextReturn();
    this.lines.push([]);
  }

  public scrollUp(count: number = 1): void {
    this.point -= count;
    if (this.point < 0) { this.point = 0; }
    if (this.point > this.maxPoint) { this.point = 0; }
  }

  public scrollDown(count: number = 1): void {
    this.point += count;
    if (this.point < 0) { this.point = 0; }
    if (this.point > this.maxPoint) { this.point = 0; }
  }

  public goToEnd(): void {
    this.point = this.maxPoint;
  }

  public get screenLineCount(): number {
    let lineHeight = (this.textLineHeight + this.textLinePitch);
    let areaHeight = this.height- this.textMarginTop - this.textMarginBottom + this.textLinePitch;
    return Math.floor(areaHeight / lineHeight)
  }

  protected get maxPoint(): number {
    let max = this.lines.length - 1 - this.screenLineCount;
    if (max < 0) {
      return 0;
    } else {
      return max;
    }
  }

  public reDraw(): void {
    this.clearText();

    let max = this.point + this.screenLineCount;
    for (let i = this.point; i < max; i++) {
      this.lines[i].forEach(ch => this.addChar(ch));
      this.addTextReturn();
    }
  }

}

/**
 * 履歴レイヤ
 */
export class HistoryLayer extends BaseLayer {

  protected textLayer: HistoryTextLayer;
  protected upButton: SimpleButton;
  protected downButton: SimpleButton;

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.textLayer = new HistoryTextLayer("HistoryText", resource, owner);
    this.upButton = new SimpleButton("ScrollUpButton", resource, owner);
    this.downButton = new SimpleButton("ScrollDownButton", resource, owner);
  }

  public init(config: any = {}) {
    this.x = 0;
    this.y = 0;

    this.width = config.width;
    this.height = config.height;

    // テキスト
    this.textLayer.init(config);
    this.textLayer.visible = true;
    this.addChild(this.textLayer);

    // ボタン
    this.initScrollButtons(config);

    let hc: any = config.history != null ? config.history : {}; 
  }

  protected initScrollButtons(config: any): void {
    [this.upButton, this.downButton].forEach((button: SimpleButton) => {
      button.visible = true;
      button.width = 32;
      button.height = 32;
      button.init(
        0xFFFFFF, 
        [0xFF0000, 0x00FF00, 0x0000FF],
        [1.0, 1.0, 1.0],
        () => alert());
      button.textFontFamily = ["mplus-1p-regular", "monospace"];
      button.textFontSize = 16;
      button.textLineHeight = 16;
      button.textMarginLeft = 0;
      button.textMarginRight = 0;
      button.textMarginTop = 6;
      button.textAlign = "center";
      this.addChild(button);
    });
    this.upButton.x = config.width - 32 - 20;
    this.upButton.y = 20;
    this.upButton.addChar("▲");

    this.downButton.x = config.width - 32 - 20;
    this.downButton.y = config.height - 32 - 20;
    this.downButton.addChar("▼");
  }


  public addHistoryChar(ch: string): void {
    this.textLayer.add(ch);
  }

  public addHistoryTextReturn(): void {
    this.textLayer.textReturn();
  }

  public clearHistory(): void {
    this.textLayer.clear();
  }

  public show(): void {
    // this.textLayer.goToEnd();
    this.textLayer.reDraw();
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public onMouseEnter(e: PonMouseEvent): boolean  {
    super.onMouseEnter(e);
    return false;
  }
  public onMouseLeave(e: PonMouseEvent): boolean  {
    super.onMouseLeave(e);
    return false;
  }
  public onMouseMove(e: PonMouseEvent): boolean  {
    super.onMouseMove(e);
    return false;
  }
  public onMouseDown(e: PonMouseEvent): boolean  {
    super.onMouseDown(e);
    return false;
  }
  public onMouseUp(e: PonMouseEvent): boolean  {
    super.onMouseUp(e);
    return false;
  }

}
