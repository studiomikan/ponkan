import { BaseLayer } from "../base/base-layer";
import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { PonGame } from "../base/pon-game";
import { ToggleButtonLayer } from "./toggle-button-layer";
import { Ponkan3 } from "../ponkan3";

export interface IMovePos {
  x: number;
  y: number;
  alpha: number;
}

export class MovableLayer extends ToggleButtonLayer {

  protected _isMoving: boolean = false;
  public get isMoving(): boolean { return this._isMoving; }
  protected moveType: "linear" | "bezier2" | "bezier3" | "catmullrom" = "linear";
  protected moveEase: "none" | "in" | "out" | "both" = "none";
  protected movePosList: IMovePos[] = [];
  protected movePoint: number = 0;
  protected moveTime: number = 0;
  protected moveTotalTime: number = 0;
  protected moveStartTick: number = -1;

  public constructor(name: string, resource: Resource, owner: Ponkan3) {
    super(name, resource, owner);
  }

  public startMove(
    tick: number,
    time: number,
    path: IMovePos[],
    type: "linear" | "bezier2" | "bezier3" | "catmullrom",
    ease: "none" | "in" | "out" | "both",
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

    path.unshift({ x: this.x, y: this.y, alpha: this.alpha });

    this._isMoving = true;
    this.moveType = type;
    this.moveEase = ease;
    this.movePosList = path;
    this.movePoint = 0;
    this.moveTime = time;
    this.moveTotalTime = time * (path.length - 1);
    this.moveStartTick = -1; // この時点では-1としておき、初めてのupdate時に設定する

    // bezier2、bezier3のときはmoveTime == moveTotalTimeとする
    if (type === "bezier2" || type === "bezier3") {
      this.moveTime = this.moveTotalTime;
    }
  }

  public stopMove(): void {
    if (this._isMoving) {
      let lastPos: IMovePos = this.movePosList[this.movePosList.length - 1];
      this.x = lastPos.x;
      this.y = lastPos.y;
      this.alpha = lastPos.alpha;
      this._isMoving = false;
      this.movePosList = [];
      this.owner.conductor.trigger("move");
    }
  }

  // [override]
  public update(tick: number): void {
    super.update(tick)
    if (this._isMoving) {
      if (this.moveStartTick === -1) {
        this.moveStartTick = tick;
      }

      let phase: number = (tick - this.moveStartTick) / this.moveTime;

      // easeの処理
      switch (this.moveEase) {
        case 'in': phase = this.moveEaseIn(phase); break;
        case 'out': phase = this.moveEaseOut(phase); break;
        case 'both': phase = this.moveEaseInOut(phase); break;
        // case 'none': phase = phase; break;
      }
      if (phase > 1) {
        phase = 1;
      }
      // 移動
      switch (this.moveType) {
        case 'bezier2': this.moveBezierCurve2(tick, phase); break;
        case 'bezier3': this.moveBezierCurve3(tick, phase); break;
        case 'catmullrom': this.moveCatmullRom(tick, phase); break;
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
    return phase * phase
  }

  /**
   * 緩やかに停止する（2次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  protected moveEaseOut(phase: number): number {
    return phase * (2 - phase)
  }

  /**
   * 緩やかに開始・終了する（3次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  protected moveEaseInOut(phase: number): number {
    // v(t) = -2t^3 + 3t^2 = t^2(3-2t)
    return (phase * phase) * (3 - (2 * phase))
  }

  /**
   * 直線移動する
   * @param tick 時刻
   * @param phase フェーズ（0～1の値）
   */
  protected moveLinear(tick: number, phase: number): void {
    // 移動
    let startPos: IMovePos = this.movePosList[this.movePoint];
    let endPos: IMovePos = this.movePosList[this.movePoint + 1]
    this.x = Math.floor(startPos.x + (endPos.x - startPos.x) * phase)
    this.y = Math.floor(startPos.y + (endPos.y - startPos.y) * phase)
    this.alpha = startPos.alpha + (endPos.alpha - startPos.alpha) * phase
    // 終了判定
    if (tick - this.moveStartTick >= this.moveTime) {
      this.movePoint++;
      if (this.movePoint + 1 < this.movePosList.length) {
        this.moveStartTick += this.moveTime
        let startPos: IMovePos = this.movePosList[this.movePoint];
        this.x = startPos.x;
        this.y = startPos.y;
      } else {
        this.stopMove();
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
    let p0: IMovePos = this.movePosList[0];
    let p1: IMovePos = this.movePosList[1];
    let p2: IMovePos = this.movePosList[2];
    let t = phase;
    this.x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    this.y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    this.alpha = p0.alpha + (p2.alpha - p0.alpha) * phase;
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
  protected moveBezierCurve3 (tick: number, phase: number): void {
    // 移動
    let p0: IMovePos = this.movePosList[0];
    let p1: IMovePos = this.movePosList[1];
    let p2: IMovePos = this.movePosList[2];
    let p3: IMovePos = this.movePosList[3];
    let t = phase;
    this.x = (1 - t) * (1 - t) * (1 - t) * p0.x + 3 * (1 - t) * (1 - t) * t * p1.x + 3 * (1 - t) * t * t * p2.x + t * t * t * p3.x;
    this.y = (1 - t) * (1 - t) * (1 - t) * p0.y + 3 * (1 - t) * (1 - t) * t * p1.y + 3 * (1 - t) * t * t * p2.y + t * t * t * p3.y;
    this.alpha = p0.alpha + (p3.alpha - p0.alpha) * phase;
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
  protected moveCatmullRom (tick: number, phase: number) {
    let n: number = this.movePoint;
    let p: IMovePos[] = this.movePosList;
    let p0: IMovePos, p1: IMovePos, p2: IMovePos, p3: IMovePos;
    // let t = phase

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

    this.x = this.catmullRom(p0.x, p1.x, p2.x, p3.x, phase);
    this.y = this.catmullRom(p0.y, p1.y, p2.y, p3.y, phase);
    this.alpha = p1.alpha + (p2.alpha - p1.alpha) * phase;

    if (tick - this.moveStartTick >= this.moveTime) {
      this.movePoint++;
      if (this.movePoint + 1 < this.movePosList.length) {
        this.moveStartTick += this.moveTime;
        let startPos: IMovePos= this.movePosList[this.movePoint];
        this.x = startPos.x;
        this.y = startPos.y;
      } else {
        this.stopMove();
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
  protected catmullRom (p0: number, p1: number, p2: number, p3: number, t: number): number {
    let v0 = (p2 - p0) / 2;
    let v1 = (p3 - p1) / 2;
    let t2 = t * t;
    let t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
           (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  public store(tick: number): any {
    let data: any = super.store(tick);
    // 自動移動中だった場合、自動移動が終わったものとして保存する。
    if (this.isMoving) {
      let endPos = this.movePosList[this.movePosList.length - 1];
      data.x = endPos.x;
      data.y = endPos.y;
      data.alpha = endPos.alpha;
    }
    return data;
  }

  protected static movableLayerCopyParams: string[] = [
    "_isMoving",
    "moveType",
    "moveEase",
    "movePosList",
    "movePoint",
    "moveTime",
    "moveTotalTime",
    "moveStartTick",
  ];

  public copyTo(dest: MovableLayer): void {
    super.copyTo(dest);
    let me: any = this as any;
    let you: any = dest as any;
    MovableLayer.movableLayerCopyParams.forEach(p => you[p] = me[p]);
  }

}
