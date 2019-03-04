import { Logger } from "../base/logger";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";
import { PonMouseEvent } from "../base/pon-mouse-event";
import { PonEventHandler } from "../base/pon-event-handler";
import { Ponkan3 } from "../ponkan3";

/**
 * 履歴レイヤ
 */
export class HistoryLayer extends BaseLayer {

  public init(config: any = {}) {
    this.x = 0;
    this.y = 0;

    this.width = config.width;
    this.height = config.height;
    this.setBackgroundColor(0x000000, 0.5);

    // TODO フォント設定など
    this.textAutoReturn = false;

    let hc: any = config.history != null ? config.history : {}; 
  }

  public addHistoryChar(ch: string): void {
    // TODO 実装
  }

  public addHistoryTextReturn(): void {
    // TODO 実装
  }

  public clearHistory(): void {
    // TODO 実装
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
