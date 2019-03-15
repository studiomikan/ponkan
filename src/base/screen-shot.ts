import { Logger } from "./logger";
import { Resource } from "./resource";
import { Script } from "./script";
import * as Util from "./util";

export class ScreenShot {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  public constructor(config: any) {
    this.canvas = document.createElement("canvas");

    if (config == null) { config = {} }
    if (config.screenShot == null) {
      config.screenShot = { width: 320, height: 180 };
    }

    this.canvas.width = config.screenShot.width;
    this.canvas.height = config.screenShot.height;

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

}

