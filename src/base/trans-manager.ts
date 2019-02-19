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
      uniform sampler2D backSampler;
      uniform float foreAlpha;
      uniform float backAlpha;

      void main(void) {
        vec4 fcolor = texture2D(uSampler, vTextureCoord);
        vec4 bcolor = texture2D(backSampler, vTextureCoord);
        fcolor = fcolor * foreAlpha + bcolor * backAlpha;
        gl_FragColor = fcolor;
        // gl_FragColor = vec4(vec2(vTextureCoord.xy), 1.0, 1.0);
      }
    `;
    super(
      undefined, // vertex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        backSampler: { type: "sampler2D", value: 1 },
        foreAlpha: { type: "float", value: 1.0 },
        backAlpha: { type: "float", value: 1.0 },
      }
    );
  }
}

  // univ (ponCanvas, tick, elapsedTime, fore, back, hidingMessageFlag, qx, qy) {
  //   ponCanvas.changeBuffer(1)
  //
  //   this.calcUnivAlphaTable(elapsedTime)
  //
  //   let ruleData = this.ruleImageData.data
  //   let table = this.table
  //
  //   back.update(tick, ponCanvas)
  //   back.draw(ponCanvas, 0, 0, 1.0, hidingMessageFlag, qx, qy)
  //   let imageData = ponCanvas.getBufImageData()
  //   let data = imageData.data
  //   let length = data.length
  //
  //   let i = 0
  //   while (i < length) {
  //     data[i + 3] = table[ruleData[i]]
  //     i += 4
  //   }
  //
  //   ponCanvas.changeBuffer(0)
  //   ponCanvas.putImageDataToBuf(imageData)
  // }

  // public calcUnivAlphaTable(elapsedTime: number): void {
  //   let vague = this.vague;
  //   let table = this.table;
  //
  //   let phaseMax = 255 + vague
  //   let phase = Math.floor(elapsedTime * phaseMax / this.time) - vague
  //
  //   let i = 0
  //   while (i < 256) {
  //     if (i < phase) {
  //       table[i] = 255
  //     } else if (i >= phaseMax) {
  //       table[i] = 0
  //     } else {
  //       let tmp = 255 - ((i - phase) * 255 / vague)
  //       if (tmp < 0) tmp = 0
  //       if (tmp > 255) tmp = 255
  //       table[i] = tmp
  //     }
  //     i++
  //   }
  // }

class UnivTransFilter extends PIXI.Filter<any> {
  public constructor() {
    var fragmentShader = `
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform sampler2D backSampler;
      uniform sampler2D ruleSampler;
      uniform float time;
      uniform float elapsedTime;
      uniform float vague;
      uniform float phaseMax;
      uniform float phase;

      void main(void) {
        vec4 fcolor = texture2D(uSampler, vTextureCoord);
        vec4 bcolor = texture2D(backSampler, vTextureCoord);
        vec4 rcolor = texture2D(ruleSampler, vTextureCoord);

        // float phaseMax = 255.0 + vague;
        // float phase = floor(elapsedTime * phaseMax / time) - vague;

        float a = 255.0 * (rcolor.r + rcolor.g + rcolor.b) / 3.0;
        if (a < phase) {
          gl_FragColor = bcolor;
        } else if (a >= phaseMax) {
          gl_FragColor = fcolor;
        } else {
          float tmp = 255.0 - ((a - phase) * 255.0 / vague);
          if (tmp < 0.0) { tmp = 0.0; }
          if (tmp > 255.0) { tmp = 255.0; }
          float alpha = tmp / 255.0;
          gl_FragColor = bcolor * alpha + fcolor * (1.0 - alpha);
        }

        // gl_FragColor = fcolor;
        // gl_FragColor = rcolor;
        // gl_FragColor = vec4(vec2(vTextureCoord.xy), 1.0, 1.0);
      }

    `;
    super(
      undefined, // vertex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        backSampler: { type: "sampler2D", value: 1 },
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
  private vague: number = 64;
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
    vague: number = 64,
  ) {

    this.initTrans(time, "univ");
    this.ruleFilePath = ruleFilePath;
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

  public stop(): void {
    this.status = "stop";
    this.ruleFilePath = null;
    // 表レイヤと一緒に描画するのをやめる
    this.game.foreRenderer.delOtherRenderer();
    this.game.backRenderer.delOtherRenderer();
    // フィルタをクリア
    this.game.foreRenderer.container.filters = null; 
    this.game.backRenderer.container.filters = null; 
    // 表レイヤと裏レイヤを入れ替え
    this.game.flipPrimaryLayers();

    console.log("endtrans");
  }

  public start(): void {
    this.status = "run";
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
      // this.game.foreRenderer.draw(tick);
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
    uniforms.foreAlpha = 1.0 - alpha;
    uniforms.backAlpha = alpha;
    uniforms.backSampler = this.game.backRenderer.texture;
  }

  public drawUniv(tick: number, elapsedTime: number): void {
    this.calcUnivAlphaTable(elapsedTime);

    let uniforms = (this.filter.uniforms as any);
    uniforms.backSampler = this.game.backRenderer.texture;
    uniforms.ruleSampler = (this.ruleSprite as PIXI.Sprite).texture;
    uniforms.table = this.table;
    uniforms.time = this.time;
    uniforms.elapsedTime = elapsedTime;
    uniforms.vague = this.vague;

    let phaseMax = 255 + this.vague;
    let phase = Math.floor(elapsedTime * phaseMax / this.time) - this.vague;
    // let phase = elapsedTime * phaseMax / this.time - this.vague;
    uniforms.phaseMax = phaseMax;
    uniforms.phase = phase;
    console.log(phase, phaseMax);
  }

  // univ (ponCanvas, tick, elapsedTime, fore, back, hidingMessageFlag, qx, qy) {
  //   ponCanvas.changeBuffer(1)
  //
  //   this.calcUnivAlphaTable(elapsedTime)
  //
  //   let ruleData = this.ruleImageData.data
  //   let table = this.table
  //
  //   back.update(tick, ponCanvas)
  //   back.draw(ponCanvas, 0, 0, 1.0, hidingMessageFlag, qx, qy)
  //   let imageData = ponCanvas.getBufImageData()
  //   let data = imageData.data
  //   let length = data.length
  //
  //   let i = 0
  //   while (i < length) {
  //     data[i + 3] = table[ruleData[i]]
  //     i += 4
  //   }
  //
  //   ponCanvas.changeBuffer(0)
  //   ponCanvas.putImageDataToBuf(imageData)
  // }

  /**
   * ユニバーサルトランジション用のアルファ値テーブルを算出し、
   * 結果を this.table に格納する。
   */
  public calcUnivAlphaTable(elapsedTime: number): void {
    let vague = this.vague;
    let table = this.table;

    let phaseMax = 255 + vague
    let phase = Math.floor(elapsedTime * phaseMax / this.time) - vague

    let i = 0
    while (i < 256) {
      if (i < phase) {
        table[i] = 255
      } else if (i >= phaseMax) {
        table[i] = 0
      } else {
        let tmp = 255 - ((i - phase) * 255 / vague)
        if (tmp < 0) tmp = 0
        if (tmp > 255) tmp = 255
        table[i] = tmp
      }
      i++
    }
  }


  // 以下、Ponkan2のソース
  // /**
  //  * TODO 動作確認
  //  * トランジションを描画
  //  * @param {PonCanvas} ponCanvas キャンバス
  //  * @param {number} tick 時刻j
  //  * @param {PonLayer} forePrimaryLayer 表プライマリレイヤ
  //  * @param {PonLayer} backPrimaryLayer 裏プライマリレイヤ
  //  * @param {HistoryLayer} historyLayer 履歴レイヤ
  //  * @param {boolean} hidingMessageFlag メッセージレイヤを隠すかどうか
  //  * @param {number} qx 画面揺れx
  //  * @param {number} qy 画面揺れy
  //  */
  // draw (ponCanvas, tick, forePrimaryLayer, backPrimaryLayer, historyLayer, hidingMessageFlag, qx = 0, qy = 0) {
  //   if (!this.playing) {
  //     return
  //   }
  //
  //   if (this.startTick === -1) {
  //     this.startTick = tick
  //   }
  //   let elapsedTime = tick - this.startTick
  //
  //   let fore = forePrimaryLayer
  //   let back = backPrimaryLayer
  //
  //   // TODO 画面揺れをちゃんとする
  //   // 表レイヤを描画する
  //   fore.update(tick, ponCanvas)
  //   fore.draw(ponCanvas, 0, 0, 1.0, hidingMessageFlag, qx, qy)
  //
  //   // 表レイヤの上から裏レイヤを描画する
  //   switch (this.method) {
  //     case 'crossfade':
  //       this.crossfade(ponCanvas, tick, elapsedTime, fore, back, hidingMessageFlag, qx, qy)
  //       break
  //     case 'univ':
  //       this.univ(ponCanvas, tick, elapsedTime, fore, back, hidingMessageFlag, qx, qy)
  //       break
  //   }
  //
  //   // TODO 履歴レイヤを描画
  //
  //   // 終了判定
  //   if (elapsedTime > this.time) {
  //     this.stop()
  //     this.onComplete()
  //   }
  // }
  //
  // /**
  //  * TODO 動作確認
  //  */
  // stop () {
  //   this.time = -1
  //   this.startTick = -1
  //   this.method = ''
  //   this.playing = false
  //   this.ruleImageData = null
  // }
  //
  // /**
  //  * クロスフェードで描画する
  //  * @param {PonCanvas} ponCanvas キャンバス
  //  * @param {number} tick 時刻j
  //  * @param {number} elapsedTime 経過時間
  //  * @param {PonLayer} fore 表プライマリレイヤ
  //  * @param {PonLayer} back 裏プライマリレイヤ
  //  * @param {boolean} hidingMessageFlag メッセージレイヤを隠すかどうか
  //  * @param {number} qx 画面揺れx
  //  * @param {number} qy 画面揺れy
  //  */
  // crossfade (ponCanvas, tick, elapsedTime, fore, back, hidingMessageFlag, qx, qy) {
  //   ponCanvas.changeBuffer(1)
  //
  //   let alpha = Math.floor(255 * (elapsedTime / this.time))
  //   if (alpha < 0) alpha = 0
  //   if (alpha > 255) alpha = 255
  //
  //   back.update()
  //   back.draw(ponCanvas, 0, 0, 1.0, hidingMessageFlag, qx, qy)
  //   let imageData = ponCanvas.getBufImageData()
  //   let data = imageData.data
  //   let length = data.length
  //
  //   let i = 3
  //   while (i < length) {
  //     data[i] = alpha
  //     i += 4
  //   }
  //
  //   ponCanvas.changeBuffer(0)
  //   ponCanvas.putImageDataToBuf(imageData)
  // }
  //
  // /**
  //  * ユニバーサルトランジションで描画する
  //  * @param {PonCanvas} ponCanvas キャンバス
  //  * @param {number} tick 時刻j
  //  * @param {number} elapsedTime 経過時間
  //  * @param {PonLayer} fore 表プライマリレイヤ
  //  * @param {PonLayer} back 裏プライマリレイヤ
  //  * @param {boolean} hidingMessageFlag メッセージレイヤを隠すかどうか
  //  * @param {number} qx 画面揺れx
  //  * @param {number} qy 画面揺れy
  //  */
  // univ (ponCanvas, tick, elapsedTime, fore, back, hidingMessageFlag, qx, qy) {
  //   ponCanvas.changeBuffer(1)
  //
  //   this.calcUnivAlphaTable(elapsedTime)
  //
  //   let ruleData = this.ruleImageData.data
  //   let table = this.table
  //
  //   back.update(tick, ponCanvas)
  //   back.draw(ponCanvas, 0, 0, 1.0, hidingMessageFlag, qx, qy)
  //   let imageData = ponCanvas.getBufImageData()
  //   let data = imageData.data
  //   let length = data.length
  //
  //   let i = 0
  //   while (i < length) {
  //     data[i + 3] = table[ruleData[i]]
  //     i += 4
  //   }
  //
  //   ponCanvas.changeBuffer(0)
  //   ponCanvas.putImageDataToBuf(imageData)
  // }
  //
  // /**
  //  * ユニバーサルトランジション用のアルファ値テーブルを算出し、
  //  * 結果を this.table に格納する。
  //  * @param {number} elapsedTime 経過時間
  //  */
  // calcUnivAlphaTable (elapsedTime) {
  //   let vague = this.vague
  //   let table = this.table
  //
  //   let phaseMax = 255 + vague
  //   let phase = Math.floor(elapsedTime * phaseMax / this.time) - vague
  //
  //   let i = 0
  //   while (i < 256) {
  //     if (i < phase) {
  //       table[i] = 255
  //     } else if (i >= phaseMax) {
  //       table[i] = 0
  //     } else {
  //       let tmp = 255 - ((i - phase) * 255 / vague)
  //       if (tmp < 0) tmp = 0
  //       if (tmp > 255) tmp = 255
  //       table[i] = tmp
  //     }
  //     i++
  //   }
  // }
  //
}

