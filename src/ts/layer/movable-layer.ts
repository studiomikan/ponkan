import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { BaseLayer } from "../base/base-layer";
import { PonGame } from "../base/pon-game";
import { Resource } from "../base/resource";
import { Ponkan3 } from "../ponkan3";
import { SliderLayer } from "./slider-layer";

export interface IMovePos {
  x: number;
  y: number;
  alpha: number;
  scalex: number;
  scaley: number;
}

export class MovableLayer extends SliderLayer {

  protected _isMoving: boolean = false;
  protected moveType: "linear" | "bezier2" | "bezier3" | "catmullrom" = "linear";
  protected moveEase: "none" | "in" | "out" | "both" = "none";
  protected movePosList: IMovePos[] = [];
  protected movePoint: number = 0;
  protected moveTime: number = 0;
  protected moveDelay: number = 0;
  protected moveLoop: boolean = false;
  protected moveTotalTime: number = 0;
  protected moveStartTick: number = -1;
  protected moveDelayStartTick: number = -1;
  public get isMoving(): boolean { return this._isMoving; }
  public get isLoopMoving(): boolean { return this.moveLoop; }

  public constructor(name: string, resource: Resource, owner: Ponkan3) {
    super(name, resource, owner);
  }

  public startMove(
    tick: number,
    time: number,
    delay: number,
    path: IMovePos[],
    type: "linear" | "bezier2" | "bezier3" | "catmullrom",
    ease: "none" | "in" | "out" | "both",
    loop: boolean,
  ): void {

    if (type === "bezier2" && path.length !== 2) {
      throw new Error("bezier2ではpathを2点指定する必要があります。");
    }
    if (type === "bezier3" && path.length !== 3) {
      throw new Error("bezier3ではpathを3点指定する必要があります。");
    }
    if (type === "catmullrom" && path.length < 2) {
      throw new Error("catmullromではpathを2点以上指定する必要があります。");
    }
    if (loop && !(type === "linear" || type === "catmullrom")) {
      throw new Error("自動移動をループできるのはlinearまたはcatmullromの場合のみです。");
    }

    this._isMoving = true;
    this.moveType = type;
    this.moveEase = ease;
    this.movePoint = 0;
    this.moveTime = time;
    this.moveDelay = delay;
    this.moveLoop = loop;
    this.moveTotalTime = time * (path.length - 1);
    this.moveStartTick = -1; // この時点では-1としておき、初めてのupdate時に設定する

    // this.movePosList = this.clonePath(path);
    // this.movePosList.unshift({ x: this.x, y: this.y, alpha: this.alpha });
    let posList = this.clonePath(path);
    posList.unshift({ x: this.x, y: this.y, alpha: this.alpha, scalex: this.scaleX, scaley: this.scaleY });
    for (let i = 1; i < posList.length; i++) {
      const p0 = posList[i - 1];
      const p = posList[i];
      if (p.x == null) { p.x = p0.x; }
      if (p.y == null) { p.y = p0.y; }
      if (p.alpha == null) { p.y = p0.y; }
      if (p.scalex == null) { p.scalex = p0.scalex; }
      if (p.scaley == null) { p.scaley = p0.scaley; }
    }
    this.movePosList = posList;


    // bezier2、bezier3のときはmoveTime == moveTotalTimeとする
    if (type === "bezier2" || type === "bezier3") {
      this.moveTime = this.moveTotalTime;
    }
  }

  public stopMove(triggerEvent: boolean = true): void {
    if (this._isMoving) {
      const lastPos: IMovePos = this.movePosList[this.movePosList.length - 1];
      this.x = lastPos.x;
      this.y = lastPos.y;
      this.alpha = lastPos.alpha;
      this.scaleX = lastPos.scalex;
      this.scaleY = lastPos.scaley;
      this._isMoving = false;
      this.movePosList = [];
      this.moveLoop = false;
      if (triggerEvent) {
        this.owner.conductor.trigger("move");
      }
    }
  }

  private clonePath(orgPath: IMovePos[]): IMovePos[] {
    const path: IMovePos[] = [];
    orgPath.forEach((p: any) => {
      const obj: any = {};
      Object.keys(p).forEach((key) => {
        obj[key] = p[key];
      })
      path.push(obj);
    });
    return path;
  }

  // [override]
  public update(tick: number): void {
    super.update(tick);
    if (this._isMoving) {
      if (this.moveDelayStartTick === -1) { this.moveDelayStartTick = tick; }
      if (tick - this.moveDelayStartTick < this.moveDelay) { return; }

      if (this.moveStartTick === -1) {
        this.moveStartTick = tick;
      }
      let phase: number = (tick - this.moveStartTick) / this.moveTime;

      // easeの処理
      switch (this.moveEase) {
        case "in": phase = this.moveEaseIn(phase); break;
        case "out": phase = this.moveEaseOut(phase); break;
        case "both": phase = this.moveEaseInOut(phase); break;
        // case 'none': phase = phase; break;
      }
      if (phase > 1) {
        phase = 1;
      }
      // 移動
      switch (this.moveType) {
        case "bezier2": this.moveBezierCurve2(tick, phase); break;
        case "bezier3": this.moveBezierCurve3(tick, phase); break;
        case "catmullrom": this.moveCatmullRom(tick, phase); break;
        default: this.moveLinear(tick, phase); break;
      }
    }
  }

  /**
   * 緩やかに開始する（2次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  protected moveEaseIn(phase: number): number {
    return phase * phase;
  }

  /**
   * 緩やかに停止する（2次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  protected moveEaseOut(phase: number): number {
    return phase * (2 - phase);
  }

  /**
   * 緩やかに開始・終了する（3次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  protected moveEaseInOut(phase: number): number {
    // v(t) = -2t^3 + 3t^2 = t^2(3-2t)
    return (phase * phase) * (3 - (2 * phase));
  }

  /**
   * 直線移動する
   * @param tick 時刻
   * @param phase フェーズ（0～1の値）
   */
  protected moveLinear(tick: number, phase: number): void {
    // 移動
    const startPos: IMovePos = this.movePosList[this.movePoint];
    let endPos: IMovePos;
    if (this.movePoint + 1 < this.movePosList.length) {
      endPos = this.movePosList[this.movePoint + 1];
    } else {
      endPos = this.movePosList[0];
    }
    this.x = Math.floor(startPos.x + (endPos.x - startPos.x) * phase);
    this.y = Math.floor(startPos.y + (endPos.y - startPos.y) * phase);
    this.alpha = startPos.alpha + (endPos.alpha - startPos.alpha) * phase;
    this.scaleX = startPos.scalex + (endPos.scalex - startPos.scalex) * phase;
    this.scaleY = startPos.scaley + (endPos.scaley - startPos.scaley) * phase;
    // 終了判定
    if (tick - this.moveStartTick >= this.moveTime) {
      this.movePoint++;
      if (this.moveLoop) {
        if (this.movePoint >= this.movePosList.length) {
          this.movePoint = 0;
        }
        this.moveStartTick += this.moveTime;
        const nextStartPos: IMovePos = this.movePosList[this.movePoint];
        this.x = nextStartPos.x;
        this.y = nextStartPos.y;
      } else {
        if (this.movePoint + 1 < this.movePosList.length) {
          this.moveStartTick += this.moveTime;
          const nextStartPos: IMovePos = this.movePosList[this.movePoint];
          this.x = nextStartPos.x;
          this.y = nextStartPos.y;
        } else {
          this.stopMove();
        }
      }
    }
  }

  /**
   * 2次ベジエ曲線で移動する
   * @param tick 時刻
   * @param phase フェーズ（0～1の値）
   */
  protected moveBezierCurve2(tick: number, phase: number): void {
    // 移動
    const p0: IMovePos = this.movePosList[0];
    const p1: IMovePos = this.movePosList[1];
    const p2: IMovePos = this.movePosList[2];
    const t = phase;
    this.x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    this.y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    this.alpha = p0.alpha + (p2.alpha - p0.alpha) * phase;
    this.scaleX = p0.scalex + (p2.scalex - p0.scalex) * phase;
    this.scaleY = p0.scaley + (p2.scaley - p0.scaley) * phase;
    // 終了判定
    if (tick - this.moveStartTick >= this.moveTime) {
      this.stopMove();
    }
  }

  /**
   * 3次ベジエ曲線で移動する
   * @param tick 時刻
   * @param phase フェーズ（0～1の値）
   */
  protected moveBezierCurve3(tick: number, phase: number): void {
    // 移動
    const p0: IMovePos = this.movePosList[0];
    const p1: IMovePos = this.movePosList[1];
    const p2: IMovePos = this.movePosList[2];
    const p3: IMovePos = this.movePosList[3];
    const t = phase;
    // tslint:disable
    this.x = (1 - t) * (1 - t) * (1 - t) * p0.x + 3 * (1 - t) * (1 - t) * t * p1.x + 3 * (1 - t) * t * t * p2.x + t * t * t * p3.x;
    this.y = (1 - t) * (1 - t) * (1 - t) * p0.y + 3 * (1 - t) * (1 - t) * t * p1.y + 3 * (1 - t) * t * t * p2.y + t * t * t * p3.y;
    // tslint:enable
    this.alpha = p0.alpha + (p3.alpha - p0.alpha) * phase;
    this.scaleX = p0.scalex + (p3.scalex - p0.scalex) * phase;
    this.scaleY = p0.scaley + (p3.scaley - p0.scaley) * phase;
    // 終了判定
    if (tick - this.moveStartTick >= this.moveTime) {
      this.stopMove();
    }
  }

  /**
   * CatmullRomスプラインで移動する
   * @param tick 時刻
   * @param phase フェーズ（0～1の値）
   */
  protected moveCatmullRom(tick: number, phase: number) {
    const n: number = this.movePoint;
    const p: IMovePos[] = this.movePosList;
    let p0: IMovePos;
    let p1: IMovePos;
    let p2: IMovePos;
    let p3: IMovePos;
    // let t = phase

    if (this.moveLoop) {
      p0 = (n - 1) < 0 ? p[p.length - 1] : p[n - 1];
      p1 = p[n];
      p2 = p[((n + 1) % p.length)];
      p3 = p[((n + 2) % p.length)];
    } else {
      if (n === 0) {
        // 始点
        p0 = p[n];
        p1 = p[n];
        p2 = p[n + 1];
        p3 = p[n + 2];
      } else if (n + 2 >= p.length) {
        // 終点
        p0 = p[n - 1];
        p1 = p[n];
        p2 = p[n + 1];
        p3 = p[n + 1];
      } else {
        p0 = p[n - 1];
        p1 = p[n];
        p2 = p[n + 1];
        p3 = p[n + 2];
      }
    }

    this.x = this.catmullRom(p0.x, p1.x, p2.x, p3.x, phase);
    this.y = this.catmullRom(p0.y, p1.y, p2.y, p3.y, phase);
    this.alpha = p1.alpha + (p2.alpha - p1.alpha) * phase;
    this.scaleX = p1.scalex + (p2.scalex - p1.scalex) * phase;
    this.scaleY = p1.scaley + (p2.scaley - p1.scaley) * phase;

    if (tick - this.moveStartTick >= this.moveTime) {
      this.movePoint++;
      if (this.moveLoop) {
        if (this.movePoint >= this.movePosList.length) {
          this.movePoint = 0;
        }
        this.moveStartTick += this.moveTime;
        const startPos: IMovePos = this.movePosList[this.movePoint];
        this.x = startPos.x;
        this.y = startPos.y;
      } else {
        if (this.movePoint + 1 < this.movePosList.length) {
          this.moveStartTick += this.moveTime;
          const startPos: IMovePos = this.movePosList[this.movePoint];
          this.x = startPos.x;
          this.y = startPos.y;
        } else {
          this.stopMove();
        }
      }
    }
  }

  /**
   * CatmullRom補間
   * @param p0 点0
   * @param p1 点1
   * @param p2 点2
   * @param p3 点3
   * @param t 時間
   * @return 補間後の点
   */
  protected catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const v0 = (p2 - p0) / 2;
    const v1 = (p3 - p1) / 2;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
           (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  protected static movableLayerStoreParams: string[] = [
    "_isMoving",
    "moveType",
    "moveEase",
    "movePosList",
    "movePoint",
    "moveTime",
    "moveDelay",
    "moveLoop",
    "moveTotalTime",
    "moveStartTick",
    "moveDelayStartTick",
  ];

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;

    if (this.isMoving) {
      if (this.moveLoop) {
        // ループする場合、保存する
        MovableLayer.movableLayerStoreParams.forEach((param: string) => {
          data[param] = me[param];
        });
      } else {
        // ループしない場合、自動移動が終わったものとして保存する。
        const endPos = this.movePosList[this.movePosList.length - 1];
        data.x = endPos.x;
        data.y = endPos.y;
        data.alpha = endPos.alpha;
      }
    }
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    this.stopMove(false);
    super.restore(asyncTask, data, tick, clear);

    if (data.moveLoop) {
      const me: any = this as any;
      MovableLayer.movableLayerStoreParams.forEach((param: string) => {
        me[param] = data[param];
      });
      this.moveDelay = 0; // delayは不要。いきなり始める。
      this.moveDelayStartTick = -1;
      this.moveStartTick = -1;
    }
  }

  public copyTo(dest: MovableLayer): void {
    super.copyTo(dest);
    const me: any = this as any;
    const you: any = dest as any;
    MovableLayer.movableLayerStoreParams.forEach((p) => you[p] = me[p]);
  }

}
