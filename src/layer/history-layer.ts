import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { PonEventHandler } from "../base/pon-event-handler";
import { PonGame } from "../base/pon-game";
import { Ponkan3 } from "../ponkan3";

class HistoryTextLayer extends BaseLayer {

  protected lines: string[][] = [[]];
  public get currentLine(): string[] { return this.lines[this.lines.length - 1]; }

  protected point: number = 0;

  // public constructor(name: string, resource: Resource, owner: PonGame) {
  // }

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

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.textLayer = new HistoryTextLayer("HistoryText", resource, owner);
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



    let hc: any = config.history != null ? config.history : {}; 
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
    return false;
  }
  public onMouseLeave(e: PonMouseEvent): boolean  {
    return false;
  }
  public onMouseMove(e: PonMouseEvent): boolean  {
    return false;
  }
  public onMouseDown(e: PonMouseEvent): boolean  {
    return false;
  }
  public onMouseUp(e: PonMouseEvent): boolean  {
    return false;
  }

}
