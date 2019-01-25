import { Logger } from "../base/logger";
import { Resource } from "../base/resource";
import { BaseLayer } from "../base/base-layer";

// TODO pauseもできるようにする
export class FrameAnimLayer extends BaseLayer {

  protected frameAnimLoop: boolean = false;
  protected frameAnimTime: number = 50;
  protected frameAnimWidth: number = 32;
  protected frameAnimHeight: number = 32;
  protected frameAnimFrames: any[] = [];
  protected frameAnimStartTick: number = -1;
  protected frameAnimState: "stop" | "run"  = "stop"; 

  public initFrameAnim(
    loop: boolean,
    time: number,
    width: number,
    height: number,
    frames: any[]
  ): void {
    this.stopFrameAnim();
    this.frameAnimLoop = loop;
    this.frameAnimTime = time;
    this.frameAnimWidth = this.width = width;
    // this.frameAnimHeight = this.height = height;
    this.frameAnimFrames = frames;
  }

  public get hasFrameAnim(): boolean {
    return this.frameAnimFrames.length !== 0;
  }

  public get frameAnimRunning(): boolean {
    return this.frameAnimState === "run";
  }

  public startFrameAnim(tick: number): void {
    if (this.frameAnimFrames.length === 0) {
      throw new Error("アニメーション定義が未定義です");
    }
    this.frameAnimState = "run";
    this.frameAnimStartTick = tick;
  }

  public stopFrameAnim(): void {
    this.frameAnimState = "stop";
    this.frameAnimStartTick = -1;
  }

  public deleteFrameAnim(): void {
    this.stopFrameAnim();
    this.frameAnimLoop = false;
    this.frameAnimTime = 50;
    this.frameAnimWidth = 32;
    this.frameAnimHeight = 32;
    this.frameAnimFrames = [];
  }

  /**
   * [override]
   */
  public update(tick: number): void {
    super.update(tick);
    if (this.frameAnimRunning) {
      let start = this.frameAnimStartTick;
      let time = this.frameAnimTime;
      let frames = this.frameAnimFrames;
      
      if (!this.frameAnimLoop && tick - start > frames.length * time) {
        let frame = frames[frames.length - 1]
        this.applyFrameAnim(frame);
        this.stopFrameAnim();
      } else {
        let s = Math.floor((tick - start) / time) % frames.length;
        let frame = frames[s];
        this.applyFrameAnim(frame);
      }
    }
  }

  private applyFrameAnim(frame: any) {
    if (frame.x != null) { this.imageX = -(+frame.x); }
    if (frame.y != null) { this.imageY = -(+frame.y); }
    if (frame.alpha != null) { this.alpha = +frame.alpha; }
  }

}
