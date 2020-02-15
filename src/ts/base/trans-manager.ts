import { PonGame } from "./pon-game";
import { Resource } from "./resource";

class CrossFadeFilter extends PIXI.Filter {
  public constructor() {
    const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float alpha;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = color * alpha;
}`;
    super(
      undefined, // vertex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        alpha: { type: "float", value: 1.0 },
      },
    );
  }
}

class UnivTransFilter extends PIXI.Filter {
  public constructor() {
    const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D ruleSampler;
uniform float vague;
uniform float phaseMax;
uniform float phase;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec4 rcolor = texture2D(ruleSampler, vTextureCoord);

  float a = (rcolor.r + rcolor.g + rcolor.b) / 3.0;
  if (a < phase) {
    gl_FragColor = vec4(0);
  } else if (a >= phaseMax) {
    gl_FragColor = color;
  } else {
    // float tmp = 1.0 - ((a - phase) * 1.0 / vague);
    float tmp = (a - phase) * 1.0 / vague;
    if (tmp < 0.0) { tmp = 0.0; }
    if (tmp > 1.0) { tmp = 1.0; }
    gl_FragColor = color * tmp;
  }
}`;
    super(
      undefined, // vertex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        ruleSampler: { type: "sampler2D", value: 1 },
        vague: { type: "float", value: 1 },
        phase: { type: "float", value: 1 },
        phaseMax: { type: "float", value: 1 },
      },
    );
  }
}

export class TransManager {
  private game: PonGame;
  private resource: Resource;

  private startTick: number = -1;
  private time: number = 1000;
  private method: "univ" | "scroll-to-right" | "scroll-to-left" | "scroll-to-top" | "scroll-to-bottom" | "crossfade" =
    "crossfade";
  private ruleImage: HTMLImageElement | null = null;
  private ruleSprite: PIXI.Sprite | null = null;
  private vague: number = 0.25;
  private status: "stop" | "run" = "stop";

  private filters: any;
  private filter: PIXI.Filter;

  public constructor(game: PonGame, resource: Resource) {
    this.game = game;
    this.resource = resource;

    this.filters = {
      "scroll-to-right": null,
      "scroll-to-left": null,
      "scroll-to-top": null,
      "scroll-to-bottom": null,
      univ: new UnivTransFilter(),
      crossfade: new CrossFadeFilter(),
    };
    this.filter = this.filters.crossfade;
  }

  public async initTrans(
    time: number,
    method: "scroll-to-right" | "scroll-to-left" | "scroll-to-top" | "scroll-to-bottom" | "univ" | "crossfade",
  ): Promise<void> {
    if (this.isRunning) {
      this.stop();
    }

    this.startTick = -1;
    this.time = time;
    this.method = method;

    if (this.filters[this.method] === undefined) {
      throw new Error(`存在しないmethodです(${this.method})`);
    }

    // TODO: return Promise.resolveでも問題ないのか調べる
    return new Promise((resolve): void => {
      setTimeout(() => {
        resolve();
      }, 0);
    });
  }

  public async initUnivTrans(time: number, ruleFilePath: string, vague = 0.25): Promise<void> {
    this.initTrans(time, "univ");

    if (vague < 0) {
      vague = 0;
    }
    if (vague > 1.0) {
      vague = 1.0;
    }
    this.vague = vague;

    const width = this.game.width;
    const height = this.game.height;

    this.ruleImage = await this.resource.loadImage(ruleFilePath);
    this.ruleSprite = new PIXI.Sprite(PIXI.Texture.from(this.ruleImage));
    this.ruleSprite.width = width;
    this.ruleSprite.height = height;

    const maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    maskSprite.width = width;
    maskSprite.height = height;
    this.ruleSprite.mask = maskSprite;
  }

  public get isRunning(): boolean {
    return this.status === "run";
  }

  /**
   * トランジションを停止する。
   * PonGameのonCompleteTransも呼び出される。
   */
  public stop(): void {
    if (this.status !== "run") {
      return;
    }
    this.status = "stop";

    // 裏ページの描画をやめる
    this.game.renderer.setBackVisible(false);
    // レンダラーの入れ替え
    this.game.resetPrimaryLayersRenderer();
    // フィルタをクリア
    this.game.renderer.foreContainer.filters = [];
    this.game.renderer.backContainer.filters = [];
    // 位置をクリア
    this.game.renderer.foreContainer.x = 0;
    this.game.renderer.foreContainer.y = 0;
    this.game.renderer.backContainer.x = 0;
    this.game.renderer.backContainer.y = 0;

    // 完了イベント
    this.game.onCompleteTrans();
  }

  public start(): void {
    this.status = "run";
    // 開始時に、表と裏は入れ替えておく
    this.game.flipPrimaryLayers();
    // フィルター関連の初期化
    this.filter = this.filters[this.method];
    if (this.filter === null) {
      // フィルターが無い場合は普通に描画する
      this.game.renderer.setBackVisible(true);
    } else {
      // フィルターを利用して合成する
      this.game.renderer.setBackVisible(true);
      this.game.renderer.foreContainer.filters = [this.filter];
    }
  }

  public draw(tick: number): void {
    if (this.startTick === -1) {
      this.startTick = tick;
    }

    // 終了判定
    const elapsedTime = tick - this.startTick;
    if (elapsedTime > this.time) {
      this.stop();
      // this.game.foreRenderer.draw(tick);
      this.game.renderer.draw();
      return;
    }

    // フィルターの更新（パラメータ設定）
    switch (this.method) {
      case "scroll-to-right":
        this.drawScrollHorizontal(tick, elapsedTime, "right");
        break;
      case "scroll-to-left":
        this.drawScrollHorizontal(tick, elapsedTime, "left");
        break;
      case "scroll-to-top":
        this.drawScrollVertical(tick, elapsedTime, "top");
        break;
      case "scroll-to-bottom":
        this.drawScrollVertical(tick, elapsedTime, "bottom");
        break;
      case "univ":
        this.drawUniv(tick, elapsedTime);
        break;
      case "crossfade":
        this.drawCrossFade(tick, elapsedTime);
        break;
      default:
        this.drawCrossFade(tick, elapsedTime);
        break;
    }
    this.game.renderer.draw();
  }

  public drawScrollHorizontal(tick: number, elapsedTime: number, to: "left" | "right"): void {
    const width: number = this.game.width;
    let d: number = width * (elapsedTime / this.time);
    if (d < 0) {
      d = 0;
    }
    if (d > width) {
      d = width;
    }
    this.game.renderer.foreContainer.x = to === "right" ? d : -d;
  }

  public drawScrollVertical(tick: number, elapsedTime: number, to: "top" | "bottom"): void {
    const height: number = this.game.height;
    let d: number = height * (elapsedTime / this.time);
    if (d < 0) {
      d = 0;
    }
    if (d > height) {
      d = height;
    }
    this.game.renderer.foreContainer.y = to === "bottom" ? d : -d;
  }

  public drawCrossFade(tick: number, elapsedTime: number): void {
    let alpha: number = 1.0 - elapsedTime / this.time;
    if (alpha < 0) {
      alpha = 0;
    }
    if (alpha > 1.0) {
      alpha = 1.0;
    }

    const uniforms = this.filter.uniforms as any;
    uniforms.alpha = alpha;
  }

  public drawUniv(tick: number, elapsedTime: number): void {
    const uniforms = this.filter.uniforms as any;

    uniforms.ruleSampler = (this.ruleSprite as PIXI.Sprite).texture;
    uniforms.vague = this.vague;
    uniforms.phaseMax = 1.0 + this.vague;
    uniforms.phase = (elapsedTime * uniforms.phaseMax) / this.time - this.vague;
  }
}
