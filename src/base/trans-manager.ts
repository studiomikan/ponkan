import { Logger } from "./logger";
import { AsyncTask } from "./async-task";
import { AsyncCallbacks } from "./async-callbacks";
import { Resource } from "./resource";
import { PonGame } from "./pon-game";

class CrossFadeFilter extends PIXI.Filter<any> {
  public constructor() {
    var fragmentShader = `
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform sampler2D subSampler;
      uniform float foreAlpha;
      uniform float backAlpha;

      void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);
        vec4 scolor = texture2D(subSampler, vTextureCoord);
        gl_FragColor = color * backAlpha + scolor * foreAlpha;
      }
    `;
    super(
      undefined, // vertex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        subSampler: { type: "sampler2D", value: 1 },
        foreAlpha: { type: "float", value: 1.0 },
        backAlpha: { type: "float", value: 1.0 },
      }
    );
  }
}

class UnivTransFilter extends PIXI.Filter<any> {
  public constructor() {
    var fragmentShader = `
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform sampler2D subSampler;
      uniform sampler2D ruleSampler;
      uniform float time;
      uniform float elapsedTime;
      uniform float vague;
      uniform float phaseMax;
      uniform float phase;

      void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);
        vec4 scolor = texture2D(subSampler, vTextureCoord);
        vec4 rcolor = texture2D(ruleSampler, vTextureCoord);

        float a = (rcolor.r + rcolor.g + rcolor.b) / 3.0;
        if (a < phase) {
          gl_FragColor = scolor;
        } else if (a >= phaseMax) {
          gl_FragColor = color;
        } else {
          float tmp = 1.0 - ((a - phase) * 1.0 / vague);
          if (tmp < 0.0) { tmp = 0.0; }
          if (tmp > 1.0) { tmp = 1.0; }
          gl_FragColor = scolor * tmp + color * (1.0 - tmp);
        }
        // float a = 255.0 * (rcolor.r + rcolor.g + rcolor.b) / 3.0;
        // if (a < phase) {
        //   gl_FragColor = bcolor;
        // } else if (a >= phaseMax) {
        //   gl_FragColor = fcolor;
        // } else {
        //   float tmp = 255.0 - ((a - phase) * 255.0 / vague);
        //   if (tmp < 0.0) { tmp = 0.0; }
        //   if (tmp > 255.0) { tmp = 255.0; }
        //   float alpha = tmp / 255.0;
        //   gl_FragColor = bcolor * alpha + fcolor * (1.0 - alpha);
        // }
      }

    `;
    super(
      undefined, // vertex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        subSampler: { type: "sampler2D", value: 1 },
        ruleSampler: { type: "sampler2D", value: 1 },
        time: { type: "float", value: 1 },
        elapsedTime: { type: "float", value: 1 },
        vague: { type: "float", value: 1 },
        phase: { type: "float", value: 1 },
        phaseMax: { type: "float", value: 1 },
      }
    );
  }
}

export class TransManager {
  private game: PonGame;
  private resource : Resource;

  private startTick: number = -1;
  private time: number = 1000;
  private method: "univ" |
                  "scroll-to-right" |
                  "scroll-to-left" |
                  "scroll-to-top" |
                  "scroll-to-bottom" |
                  "crossfade"
                  = "crossfade";
  private ruleFilePath: string | null = null;
  private ruleImage: HTMLImageElement | null = null;
  private ruleSprite: PIXI.Sprite | null = null;
  private vague: number = 0.25;
  private table: number[] = [];
  private status: "stop" | "run" = "stop"

  private filters: any;
  private filter: PIXI.Filter<any>;

  public constructor(game: PonGame, resource: Resource) {
    this.game = game;
    this.resource = resource;

    this.filters = {
      "scroll-to-right": null,
      "scroll-to-left": null,
      "scroll-to-top": null,
      "scroll-to-bottom": null,
      "univ": new UnivTransFilter(),
      "crossfade": new CrossFadeFilter()
    };
    this.filter = this.filters["crossfade"];
  }

  public initTrans (
    time: number,
    method: "scroll-to-right" |
            "scroll-to-left" |
            "scroll-to-top" |
            "scroll-to-bottom" |
            "univ" |
            "crossfade"
  ) {
    if (this.isRunning) {
      this.stop();
    }

    this.startTick = -1;
    this.time = time;
    this.method = method;
    this.ruleFilePath = null;

    if (this.filters[this.method] === undefined) {
      throw new Error(`存在しないmethodです(${this.method})`);
    }
  }

  public initUnivTrans (
    time: number,
    ruleFilePath: string,
    vague: number = 0.25,
  ) {

    this.initTrans(time, "univ");
    this.ruleFilePath = ruleFilePath;

    if (vague < 0) { vague = 0; }
    if (vague > 1.0) { vague = 1.0; }
    this.vague = vague;

    let width = this.game.width;
    let height = this.game.height;

    let cb = this.resource.loadImage(ruleFilePath);
    cb.done((ruleImage: HTMLImageElement) => {
      this.ruleImage = ruleImage;
      this.ruleSprite = PIXI.Sprite.from(ruleImage);
      this.ruleSprite.width = width;
      this.ruleSprite.height = height;

      let maskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      maskSprite.width = width;
      maskSprite.height = height;
      this.ruleSprite.mask = maskSprite;
    });

    return cb;
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
    this.ruleFilePath = null;
    // 表レイヤと一緒に描画するのをやめる
    this.game.foreRenderer.delOtherRenderer();
    this.game.backRenderer.delOtherRenderer();
    // レンダラーの入れ替え
    this.game.resetPrimaryLayersRenderer();
    // フィルタをクリア
    this.game.foreRenderer.container.filters = null;
    this.game.backRenderer.container.filters = null;

    // 完了イベント
    this.game.onCompleteTrans();
  }

  public start(): void {
    this.status = "run";
    // 開始時に、表と裏は入れ替えておく
    this.game.flipPrimaryLayers();
  }

  public draw(tick: number): void {
    if (this.startTick === -1) {
      this.startTick = tick;
      this.filter = this.filters[this.method];
      if (this.filter === null) {
        // フィルターが無い場合は普通に描画する
        this.game.foreRenderer.setOtherRenderer(this.game.backRenderer);
      } else {
        // フィルターを利用して合成する
        this.game.foreRenderer.container.filters = [this.filter];
      }
    }

    // 終了判定
    let elapsedTime = tick - this.startTick;
    if (elapsedTime > this.time) {
      this.stop();
      this.game.foreRenderer.draw(tick);
      return;
    }

    // フィルターの更新（パラメータ設定）
    this.game.backRenderer.draw(tick);
    this.game.backRenderer.texture.update();
    switch (this.method) {
      case "scroll-to-right":  this.drawScrollHorizontal(tick, elapsedTime, "right"); break;
      case "scroll-to-left":   this.drawScrollHorizontal(tick, elapsedTime, "left"); break;
      case "scroll-to-top":    this.drawScrollVertical(tick, elapsedTime, "top"); break;
      case "scroll-to-bottom": this.drawScrollVertical(tick, elapsedTime, "bottom"); break;
      case "univ":             this.drawUniv(tick, elapsedTime); break;
      case "crossfade":        this.drawCrossFade(tick, elapsedTime); break;
      default:                 this.drawCrossFade(tick, elapsedTime); break;
    }
    this.game.foreRenderer.draw(tick);
  }

  public drawScrollHorizontal(tick: number, elapsedTime: number, to: "left" | "right"): void {
    let width: number = this.game.width;
    let d: number = width * (elapsedTime / this.time);
    if (d < 0) { d = 0; }
    if (d > width) { d = width; }

    this.game.backRenderer.sprite.x = (to === "right") ? (d - width) : (width - d)
  }

  public drawScrollVertical(tick: number, elapsedTime: number, to: "top" | "bottom"): void {
    let height: number = this.game.height;
    let d: number = height * (elapsedTime / this.time);
    if (d < 0) { d = 0; }
    if (d > height) { d = height; }

    this.game.backRenderer.sprite.y = (to === "bottom") ? (d - height) : (height - d)
  }

  public drawCrossFade(tick: number, elapsedTime: number): void {
    let alpha: number = 1.0 * (elapsedTime / this.time);
    if (alpha < 0) { alpha = 0; }
    if (alpha > 1.0) { alpha = 1.0; }

    let uniforms = (this.filter.uniforms as any);
    uniforms.backAlpha = 1.0 - alpha;
    uniforms.foreAlpha = alpha;
    uniforms.subSampler = this.game.backRenderer.texture;
  }

  public drawUniv(tick: number, elapsedTime: number): void {
    let uniforms = (this.filter.uniforms as any);

    uniforms.subSampler = this.game.backRenderer.texture;
    uniforms.ruleSampler = (this.ruleSprite as PIXI.Sprite).texture;
    uniforms.table = this.table;
    uniforms.time = this.time;
    uniforms.elapsedTime = elapsedTime;
    uniforms.vague = this.vague;

    // uniforms.phaseMax = 255 + this.vague;
    // uniforms.phase = Math.floor(elapsedTime * uniforms.phaseMax / this.time) - this.vague;
    uniforms.phaseMax = 1.0 + this.vague;
    uniforms.phase = (elapsedTime * uniforms.phaseMax / this.time) - this.vague;
  }
}

