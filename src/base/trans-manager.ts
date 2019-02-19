import { Logger } from "./logger";
import { AsyncTask } from "./async-task";
import { AsyncCallbacks } from "./async-callbacks";
import { Resource } from "./resource";
import { PonGame } from "./pon-game";

// export interface ITransEvent {
// }

class CrossFadeFilter extends PIXI.Filter<any> {
  public constructor() {
    var fragmentShader = `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform sampler2D backSampler;
      uniform float foreAlpha;
      uniform float backAlpha;

      void main(void) {
        vec4 fcolor = texture2D(uSampler, vTextureCoord);
        vec4 bcolor = texture2D(backSampler, vTextureCoord);

        // fcolor.r = fcolor.r * foreAlpha + bcolor.r * backAlpha;
        // fcolor.g = fcolor.g * foreAlpha + bcolor.g * backAlpha;
        // fcolor.b = fcolor.b * foreAlpha + bcolor.b * backAlpha;
        fcolor = fcolor * foreAlpha + bcolor * backAlpha;
        gl_FragColor = fcolor;
      }
    `;
    super(
      undefined, // vartex shader
      fragmentShader, // fragment shader
      {
        // uniforms
        backSampler: { type: "sampler2D", value: 1 },
        foreAlpha: { type: "1f", value: 1.0 },
        backAlpha: { type: "1f", value: 1.0 },
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
                  "crossfade"  |
                  "scroll-left-to-right"
                  = "crossfade";
  private ruleFilePath: string | null = null;
  private ruleData: ImageData | null = null;
  private vague: number = 64;
  private status: "stop" | "run" = "stop"

  private filters: any;
  private filter: PIXI.Filter<any>;

  public constructor(game: PonGame, resource: Resource) {
    this.game = game;
    this.resource = resource;

    this.filters = {
      "crossfade": new CrossFadeFilter()
    };
    this.filter = this.filters["crossfade"];
  }

  public initTrans (
    time: number,
    method: "univ" | 
            "crossfade" | 
            "scroll-left-to-right"
  ) {
    this.startTick = -1;
    this.time = time;
    this.method = method;
    this.ruleFilePath = null;
  }

  public initUnivTrans (
    time: number,
    ruleFilePath: string,
    vague: number = 64,
  ) {

    this.initTrans(time, "univ");
    this.ruleFilePath = ruleFilePath;
    this.vague = vague;

    let cb = this.resource.loadTransRule(ruleFilePath).done((ruleData: ImageData) => {
      this.ruleData = ruleData;
      cb.callDone();
    });

    return cb;
  }

  public get isRunning(): boolean {
    return this.status === "run";
  }

  public stop(): void {
    this.status = "stop";
    this.ruleFilePath = null;
    // TODO 最終位置への移動など
    
    // フィルタをクリア
    this.game.backRenderer.container.filters = [];
    // 表レイヤと裏レイヤを入れ替え
    this.game.flipPrimaryLayers();
  }

  public start(): void {
    this.status = "run";
  }

  public draw(tick: number): void {
    if (this.startTick === -1) {
      this.startTick = tick;
      this.game.foreRenderer.container.filters = [this.filters[this.method]];
    }

    // 終了判定
    let elapsedTime = tick - this.startTick;
    if (elapsedTime > this.time) {
      this.stop();
      return;
    }

    // 合成する裏レイヤを描画
    this.game.backRenderer.draw(tick);
    this.game.backRenderer.texture.update();

    // フィルターの更新（パラメータ設定）
    switch (this.method) {
      case "crossfade":
      default:
        this.updateCrossFade(elapsedTime);
        break;
    }

    // 裏レイヤと合成した表レイヤを描画
    this.game.foreRenderer.draw(tick);
  }

  public updateCrossFade(elapsedTime: number): void {
    let alpha: number = 1.0 * (elapsedTime / this.time);
    if (alpha < 0) { alpha = 0; }
    if (alpha > 1.0) { alpha = 1.0; }

    let uniforms = (this.filter.uniforms as any);
    uniforms.foreAlpha = 1.0 - alpha;
    uniforms.backAlpha = alpha;
    uniforms.backSampler = this.game.backRenderer.texture;
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

