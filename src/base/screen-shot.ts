import { Logger } from "./logger";
import { Resource } from "./resource";
import { Script } from "./script";
import * as Util from "./util";

export class ScreenShot {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private dataType: string = "image/jpeg";
  private quality: number | null = 0.85;
  public readonly nodata: string = "image/nodata.png";

  public constructor(config: any) {
    this.canvas = document.createElement("canvas");

    if (config == null) { config = {} }
    if (config.screenShot == null) { config.screenShot = {}; }

    let cfg = config.screenShot;
    if (cfg.width != null) { this.canvas.width = cfg.width; }
    else { this.canvas.width = 320; }
    if (cfg.height != null) { this.canvas.height = cfg.height; }
    else { this.canvas.height = 180; }
    if (cfg.dataType != null) { this.dataType = cfg.dataType; }
    if (cfg.quality != null) { this.quality = cfg.quality; }
    if (cfg.nodata != null) { this.nodata = cfg.nodata; }

    let context: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
    if (context == null) { throw new Error("Canvasの初期化に失敗しました"); }
    this.context = context;

    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // TODO テストのためbodyに追加
    let body = document.querySelector("body");
    if (body != null) {
      body.appendChild(this.canvas);
    }
  }

  public draw(mainCanvas: HTMLCanvasElement): void {
    this.context.drawImage(mainCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  public getDataUrl(): string {
    if (this.quality != null) {
      return this.canvas.toDataURL(this.dataType, this.quality);
    } else {
      return this.canvas.toDataURL(this.dataType);
    }
  }

}

