import { Ponkan3 } from "../ponkan3";
import { TagAction, TagActionResult, TagValue } from "../tag-action";
import { PonEventHandler } from "../base/pon-event-handler";
import { PonLayer } from "../layer/pon-layer";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // メッセージ関係
    // ======================================================================
    /// @category メッセージ操作
    /// @description テキストの設定
    /// @details
    ///   テキストに関する設定を行います。
    new TagAction(
      ["messageopt", "mesopt"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param フォント名の配列
        new TagValue("fontfamily", "array", false, null),
        /// @param フォントサイズ(px)
        new TagValue("fontsize", "number", false, null),
        /// @param フォントウェイト
        new TagValue("fontweight", "string", false, null),
        /// @param フォントスタイル。"normal" | "italic"
        new TagValue("fontstyle", "string", false, null),
        /// @param 文字色。0xRRGGBBで指定すると単色、[0xRRGGBB, 0xRRGGBB, ...]のように配列で指定するとグラデーションになります。
        new TagValue("color", "number|array", false, null),
        /// @param 文字色グラデーションの色の位置。0.0～1.0の数値の配列。([0.0, 0.5, ...])
        new TagValue("gradientstops", "array", false, null),
        /// @param 文字色グラデーションのタイプ（方向）。"vertical" | "horizontal"。初期値は"vertical"
        new TagValue("gradienttype", "string", false, null),
        /// @param テキスト描画のマージン 上
        new TagValue("margint", "number", false, null),
        /// @param テキスト描画のマージン 右
        new TagValue("marginr", "number", false, null),
        /// @param テキスト描画のマージン 下
        new TagValue("marginb", "number", false, null),
        /// @param テキスト描画のマージン 左
        new TagValue("marginl", "number", false, null),
        /// @param テキストの文字間(px)
        new TagValue("pitch", "number", false, null),
        /// @param テキストの行の高さ(px)
        new TagValue("lineheight", "number", false, null),
        /// @param テキストの行間(px)
        new TagValue("linepitch", "number", false, null),
        /// @param テキスト寄せの方向。"left" | "center" | "right"
        new TagValue("align", "string", false, null),
        /// @param 影の表示非表示
        new TagValue("shadow", "boolean", false, null),
        /// @param 影のAlpha(0.0〜1.0)
        new TagValue("shadowalpha", "number", false, null),
        /// @param 影の角度(ラジアン)
        new TagValue("shadowangle", "number", false, null),
        /// @param 影のBlur
        new TagValue("shadowblur", "number", false, null),
        /// @param 影の色(0xRRGGBB)
        new TagValue("shadowcolor ", "number", false, null),
        /// @param 影の距離(px)
        new TagValue("shadowdistance", "number", false, null),
        /// @param 縁取りの太さ(px)。0で非表示になる
        new TagValue("edgewidth", "number", false, null),
        /// @param 縁取りの色(0xRRGGBB)
        new TagValue("edgecolor", "number", false, null),
        /// @param 縁取りのAlpha(0.0～1.0)
        new TagValue("edgealpha", "number", false, null),
        /// @param ルビのフォントファイズ(px)
        new TagValue("rubysize", "number", false, null),
        /// @param ルビの文字間(px)
        new TagValue("rubypitch", "number", false, null),
        /// @param ルビのオフセット(px)
        new TagValue("rubyoffset", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach((layer: PonLayer) => {
          if (values.fontfamily != null) {
            layer.textCanvas.style.fontFamily = values.fontfamily;
          }
          if (values.fontsize != null) {
            layer.textCanvas.style.fontSize = values.fontsize;
          }
          if (values.fontweight != null) {
            layer.textCanvas.style.fontWeight = values.fontweight;
          }
          if (values.fontstyle != null) {
            layer.textCanvas.style.fontStyle = values.fontstyle;
          }
          if (values.color != null) {
            layer.textCanvas.style.fill = values.color;
          }
          if (values.gradientstops != null) {
            layer.textCanvas.style.fillGradientStops = values.gradientstops;
          }
          if (values.gradienttype != null) {
            layer.textCanvas.style.setGradientType(values.gradienttype);
          }
          if (values.margint != null) {
            layer.textCanvas.marginTop = values.margint;
          }
          if (values.marginr != null) {
            layer.textCanvas.marginRight = values.marginr;
          }
          if (values.marginb != null) {
            layer.textCanvas.marginBottom = values.marginb;
          }
          if (values.marginl != null) {
            layer.textCanvas.marginLeft = values.marginl;
          }
          if (values.pitch != null) {
            layer.textCanvas.style.pitch = values.pitch;
          }
          if (values.lineheight != null) {
            layer.textCanvas.lineHeight = values.lineheight;
          }
          if (values.linepitch != null) {
            layer.textCanvas.linePitch = values.linepitch;
          }
          if (values.align != null) {
            layer.textCanvas.align = values.align;
          }
          if (values.shadow != null) {
            layer.textCanvas.style.dropShadow = values.shadow;
          }
          if (values.shadowalpha != null) {
            layer.textCanvas.style.dropShadowAlpha = values.shadowalpha;
          }
          if (values.shadowangle != null) {
            layer.textCanvas.style.dropShadowAngle = values.shadowangle;
          }
          if (values.shadowblur != null) {
            layer.textCanvas.style.dropShadowBlur = values.shadowblur;
          }
          if (values.shadowcolor != null) {
            layer.textCanvas.style.dropShadowColor = values.shadowcolor;
          }
          if (values.shadowdistance != null) {
            layer.textCanvas.style.dropShadowDistance = values.shadowdistance;
          }
          if (values.edgewidth != null) {
            layer.textCanvas.style.strokeThickness = values.edgewidth;
          }
          if (values.edgecolor != null) {
            layer.textCanvas.style.stroke = values.edgecolor;
          }
          if (values.edgealpha != null) {
            layer.textCanvas.style.edgeAlpha = values.edgealpha;
          }
          if (values.rubysize != null) {
            layer.textCanvas.rubyFontSize = values.rubysize;
          }
          if (values.rubypitch != null) {
            layer.textCanvas.rubyPitch = values.rubypitch;
          }
          if (values.rubyoffset != null) {
            layer.textCanvas.rubyOffset = values.rubyoffset;
          }
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字表示時エフェクトの設定
    /// @details
    ///   文字を表示する際のエフェクトを設定します。\n
    ///   ゲーム起動時には、何もエフェクトをかけない（none）設定になっています。
    ///
    ///   `type` に設定した値によって、文字を表示する際にエフェクトがかかります。
    ///
    ///    - `alpha` ： alpha値をフェードしながら表示（フェードイン）
    ///    - `move` ：  移動しながら表示
    ///
    ///   複数のエフェクトを設定することもできます。
    ///   たとえば `type: ["alpha", "move"]` と設定すると、移動とフェードを同時に実行します。
    new TagAction(
      ["chineffect"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param エフェクトの種類の配列。"alpha" | "move"。例：["alpha", "move"]
        new TagValue("type", "string|array", false, null),
        /// @param エフェクトにかける時間(ms)。ゲーム起動時には120msに設定されています。
        new TagValue("time", "number", false, null),
        /// @param エフェクトの入り・抜きの指定。"none" | "in" | "out" | "both"
        new TagValue("ease", "string", false, "none"),
        /// @param type: "move"の場合のみ有効。x方向の移動量
        new TagValue("offsetx", "number", false, null),
        /// @param type: "move"の場合のみ有効。y方向の移動量
        new TagValue("offsety", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach((layer: PonLayer) => {
          if (values.type != null) {
            layer.textCanvas.style.inEffectTypes = values.type;
          }
          if (values.time != null) {
            layer.textCanvas.style.inEffectTime = values.time;
          }
          if (values.ease != null) {
            layer.textCanvas.style.inEffectEase = values.ease;
          }
          layer.textCanvas.style.inEffectOptions = {
            offsetx: values.offsetx,
            offsety: values.offsety,
          };
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字を出力する
    /// @details
    ///   指定したレイヤーに文字を出力します。\n
    ///   デフォルトではカレントメッセージレイヤーが操作対象です。
    new TagAction(
      ["ch"],
      [
        /// @param 出力する先のレイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 出力する文字
        new TagValue("text", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.addChar(values.text);
        });
        if (values.page === "fore" && p.addCharWithBackFlag) {
          values.page = "back";
          p.getLayers(values).forEach(layer => {
            layer.addChar(values.text);
          });
        }
        if (p.isSkipping || p.textSpeed === 0) {
          return "continue";
        } else {
          return p.conductor.sleep(tick, p.textSpeed, "ch");
        }
      },
    ),
    /// @category メッセージ操作
    /// @description 改行する
    /// @details
    ///   次に出力する文字にルビ（ふりがな）を設定します。
    new TagAction(
      ["ruby"],
      [
        /// @param 出力する先のレイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param ルビ
        new TagValue("text", "string", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.text != null) {
          p.getLayers(values).forEach(layer => {
            layer.reserveRubyText(values.text);
          });
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 改行する
    /// @details
    ///   指定したレイヤーのテキストを改行します。
    ///   デフォルトではカレントメッセージレイヤーが操作対象です。
    new TagAction(
      ["br"],
      [
        /// @param 出力する先のレイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.addTextReturn();
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description テキストをクリアする
    /// @details
    ///   指定したレイヤーのテキストをクリアします。
    ///   デフォルトでは全レイヤーが対象です。
    new TagAction(
      ["clear", "c"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearText();
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字出力のインターバルを設定
    /// @details
    ///   文字出力の、1文字表示するごとのインターバルについて設定します。
    ///
    ///   通常、インターバル時間は user モードで動作しています。
    ///   user モード時は、ユーザー（プレイヤー）が設定画面等から設定した値が利用されます。\n
    ///   イベントシーンなど、ユーザーの設定した時間ではなく、
    ///   常に一定の間隔で表示したい場合は system モードに設定し、
    ///   イベントシーンが終わったときに user モードに戻します。
    ///
    ///   このコマンドとは別に、一時的にインターバル時間を 0 にする [`nowait`](#nowait) コマンドがあります。
    new TagAction(
      ["textspeed"],
      [
        /// @param インターバルのモード。"user" | "system"
        new TagValue("mode", "string", false, null),
        /// @param ユーザーモードでの未読文章のインターバル時間(ms)
        new TagValue("unread", "number", false, null),
        /// @param ユーザーモードでの既読文章のインターバル時間(ms)
        new TagValue("read", "number", false, null),
        /// @param システムモードでの未読文章のインターバル時間(ms)
        new TagValue("sysunread", "number", false, null),
        /// @param システムモードでの既読文章のインターバル時間(ms)
        new TagValue("sysread", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.move != null) {
          p.textSpeedMode = values.mode;
        }
        if (values.unread != null) {
          p.userUnreadTextSpeed = values.unread;
        }
        if (values.read != null) {
          p.userReadTextSpeed = values.read;
        }
        if (values.sysunread != null) {
          p.unreadTextSpeed = values.sysunread;
        }
        if (values.sysread != null) {
          p.readTextSpeed = values.sysread;
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 一時的に文字出力インターバルを0にする
    /// @details
    ///   このコマンド実行直後から、文字出力のインターバル時間を一時的に 0 にします。
    ///   もとに戻すときは `endnowait` コマンドを使用します。
    new TagAction(
      ["nowait"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.nowaitModeFlag = true;
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description nowaitを終了する
    /// @details
    ///   `nowait` の効果を終了します。j
    new TagAction(
      ["endnowait"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.nowaitModeFlag = false;
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字表示位置を指定する
    /// @details
    ///   テキスト表示で、次の文字を表示する位置を変更します。
    ///   以後のテキストは指定された位置からの表示となります。
    new TagAction(
      ["textlocate", "locate"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param x座標
        new TagValue("x", "number", false, null),
        /// @param x座標
        new TagValue("y", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.setCharLocate(values.x, values.y);
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description インデント位置を設定する
    /// @details
    ///   現在の文字描画位置でインデントするように設定します。
    ///   インデント位置は `endindent` または `clear` でクリアされます。
    new TagAction(
      ["indent"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param メッセージ履歴もインデントするかどうか
        new TagValue("history", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.setIndentPoint();
        });
        if (values.history) {
          p.historyLayer.setHistoryIndentPoint();
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description インデント位置をクリアする
    /// @details
    ///   `indent` で設定したインデント位置をクリアします。
    new TagAction(
      ["endindent"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param メッセージ履歴もインデント解除するか
        new TagValue("history", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearIndentPoint();
        });
        if (values.history) {
          p.historyLayer.clearHistoryIndentPoint();
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 行末クリック待ちで停止する
    /// @details
    new TagAction(
      ["linebreak", "lb", "l"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.stopUntilClickSkip(); // クリック待ちまでのスキップを停止
        if (p.isSkipping) {
          // UNTIL_CLICK_WAITが終わってもなおスキップ中なら、クリック待ちはしない
          // ただし改行条件等を通常と揃えるために一度グリフを表示して、すぐに非表示にする
          p.showLineBreakGlyph(tick);
          p.hideBreakGlyph();
          return "break"; // クリック待ちはしないが、一回描画する
        } else {
          // クリック待ちへ移行
          p.showLineBreakGlyph(tick);
          p.conductor.addEventHandler(
            new PonEventHandler(
              "click",
              (): void => {
                p.conductor.start();
                p.hideBreakGlyph();
              },
              "lb",
            ),
          );
          p.reserveAutoClick(tick); // オートモード時の自動クリックを予約
          return p.conductor.stop();
        }
      },
    ),
    /// @category メッセージ操作
    /// @description 行末クリック待ちで停止する
    /// @details
    new TagAction(
      ["pagebreak", "pb", "p"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.stopUntilClickSkip(); // クリック待ちまでのスキップを停止
        p.historyTextReturn();
        if (p.isSkipping) {
          // UNTIL_CLICK_WAITが終わってもなおスキップ中なら、クリック待ちはしない
          // ただし改行条件等を通常と揃えるために一度グリフを表示して、すぐに非表示にする
          p.showPageBreakGlyph(tick);
          p.hideBreakGlyph();
          return "break"; // クリック待ちはしないが、一回描画する
        } else {
          p.showPageBreakGlyph(tick);
          p.conductor.addEventHandler(
            new PonEventHandler(
              "click",
              (): void => {
                p.conductor.start();
                p.hideBreakGlyph();
              },
              "pb",
            ),
          );
          p.reserveAutoClick(tick); // オートモード時の自動クリックを予約
          return p.conductor.stop();
        }
      },
    ),
    /// @category メッセージ操作
    /// @description メッセージレイヤを一時的に隠す
    /// @details
    ///   メッセージレイヤを一時的に非表示にします。\
    ///   非表示中はスクリプトの実行が停止します。クリック等の操作で再開します。
    new TagAction(
      ["hidemessages"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.hideMessages();
        p.conductor.addEventHandler(
          new PonEventHandler(
            "click",
            (): void => {
              p.conductor.start();
              p.showMessages();
            },
            "hidemessages",
          ),
        );
        return p.conductor.stop();
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
