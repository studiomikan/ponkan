import { AsyncTask } from "../base/async-task";
import { BaseLayer } from "../base/base-layer";
import { Logger } from "../base/logger";

// TODO pauseもできるようにする
export class FrameAnimLayer extends BaseLayer {

  protected _frameAnimLoop: boolean = false;
  public get frameAnimLoop(): boolean { return this._frameAnimLoop; }
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
    frames: any[],
  ): void {
    this.stopFrameAnim(false);
    this._frameAnimLoop = loop;
    this.frameAnimTime = time;
    this.frameAnimWidth = this.width = width;
    this.frameAnimHeight = this.height = height;
    this.frameAnimFrames = frames;
  }

  public get hasFrameAnim(): boolean {
    return this.frameAnimFrames.length !== 0;
  }

  public get frameAnimRunning(): boolean {
    return this.frameAnimState === "run";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public startFrameAnim(tick: number): void {
    if (this.frameAnimFrames.length === 0) {
      throw new Error("アニメーション定義が未定義です");
    }
    this.frameAnimState = "run";
    this.frameAnimStartTick = -1; // この時点では-1としておき、初めてのupdate時に設定する
  }

  public stopFrameAnim(triggerEvent = true): void {
    if (this.frameAnimState === "run") {
      this.frameAnimState = "stop";
      this.frameAnimStartTick = -1;
      if (triggerEvent) {
        this.owner.conductor.trigger("frameanim");
      }
    }
  }

  public deleteFrameAnim(): void {
    this.stopFrameAnim();
    this._frameAnimLoop = false;
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
      if (this.frameAnimStartTick === -1) {
        this.frameAnimStartTick = tick;
      }

      const start = this.frameAnimStartTick;
      const time = this.frameAnimTime;
      const frames = this.frameAnimFrames;

      if (!this._frameAnimLoop && tick - start > frames.length * time) {
        const frame = frames[frames.length - 1];
        this.applyFrameAnim(frame);
        this.stopFrameAnim();
      } else {
        const s = Math.floor((tick - start) / time) % frames.length;
        const frame = frames[s];
        this.applyFrameAnim(frame);
        // console.log(this.name, frame);
      }
    }
  }

  private applyFrameAnim(frame: any): void {
    if (frame.x != null) { this.imageX = -(+frame.x); }
    if (frame.y != null) { this.imageY = -(+frame.y); }
    if (frame.alpha != null) { this.alpha = +frame.alpha; }
  }

  public freeImage(): void {
    this.deleteFrameAnim();
    super.freeImage();
  }

  protected static frameAnimLayerStoreParams: string[] = [
    "_frameAnimLoop",
    "frameAnimTime",
    "frameAnimWidth",
    "frameAnimHeight",
    "frameAnimFrames",
    "frameAnimStartTick",
    "frameAnimState",
  ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;

    FrameAnimLayer.frameAnimLayerStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });

    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    this.stopFrameAnim(false);
    super.restore(asyncTask, data, tick, clear);
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    const me: any = this as any;
    // const ignore: string[] = [];
    FrameAnimLayer.frameAnimLayerStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    if (data.frameAnimFrames.length !== 0) {
      if (data.frameAnimState === "run") {
        this.startFrameAnim(tick);
        Logger.debug("data.frameAnimState", data.frameAnimState, this.frameAnimState, this.frameAnimFrames);
      }
    }
  }

  public copyTo(dest: FrameAnimLayer): void {
    super.copyTo(dest);

    // その他のパラメータのコピー
    const me: any = this as any;
    const you: any = dest as any;
    FrameAnimLayer.frameAnimLayerStoreParams.forEach((p) => you[p] = me[p]);
  }

}
