import { Ponkan } from "../ponkan";
import { TagAction, TagActionResult, TagValue } from "../tag-action";
import { PonEventHandler } from "../base/pon-event-handler";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan): TagAction[] {
  return [
    // ======================================================================
    // アニメーション関係
    // ======================================================================
    /// @category アニメーション
    /// @description フレームアニメーションを設定する
    /// @details
    ///   指定レイヤーにフレームアニメーションを設定します。\n
    ///   フレームアニメーションの詳細については [フレームアニメーション]("../frameanim/") を参照してください。
    new TagAction(
      ["frameanim", "fanim"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象外レイヤー
        new TagValue("exclude", "string", false, null),
        /// @param アニメーションをループさせるかどうか
        new TagValue("loop", "boolean", false, false),
        /// @param 1フレームの時間
        new TagValue("time", "number", true, null),
        /// @param 1フレームの幅
        new TagValue("width", "number", true, null),
        /// @param 1フレームの高さ
        new TagValue("height", "number", true, null),
        /// @param フレーム指定
        new TagValue("frames", "array", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.initFrameAnim(values.loop, values.time, values.width, values.height, values.frames);
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description フレームアニメーションを開始する
    /// @details
    ///   指定レイヤーに読み込まれたフレームアニメーションを再生開始します。
    new TagAction(
      ["startframeanim", "startfanim"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象外レイヤー
        new TagValue("exclude", "string", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.startFrameAnim(tick);
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description フレームアニメーションを停止する
    /// @details
    ///   指定レイヤーのフレームアニメーションを停止します。\n
    ///   停止したアニメーションをもう一度再生したい場合は、
    ///   改めて `frameanim` コマンドで設定してから `startframeanim` コマンドを実行てください。
    new TagAction(
      ["stopframeanim", "stopfanim"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象外レイヤー
        new TagValue("exclude", "string", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.deleteFrameAnim();
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description フレームアニメーションの終了を待つ
    /// @details
    ///   指定レイヤーのフレームアニメーションの終了を待ちます。\n
    ///   実行されているフレームアニメーションが無い場合やループ再生の場合は何もしません。
    new TagAction(
      ["waitframeanim", "waitfanim"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象外レイヤー
        new TagValue("exclude", "string", false, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        const layers = p.getLayers(values).filter(l => l.frameAnimRunning && !l.frameAnimLoop);
        if (layers.length === 0) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitFrameAnimClickCallback(layers);
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.waitFrameAnimClickCallback(layers);
                },
                "waitframeanim",
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              "frameanim",
              (): void => {
                p.waitFrameAnimCompleteCallback(layers);
              },
              "waitframeanim",
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
    /// @category アニメーション
    /// @description 自動移動を開始する
    /// @details
    ///   レイヤーの自動移動を開始します。
    ///   自動移動に関しては [自動移動](../automove/) のページを参照してください。
    new TagAction(
      ["startmove", "move"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象外レイヤー
        new TagValue("exclude", "string", false, null),
        /// @param 自動移動させる時間
        new TagValue("time", "number", true, null),
        /// @param 開始までの遅延時間(ms)
        new TagValue("delay", "number", false, 0),
        /// @param 自動移動させる位置を指定
        new TagValue("path", "array", true, null),
        /// @param 自動移動のタイプ。"linear" | "bezier2" | "bezier3" | "catmullrom"
        new TagValue("type", "string", false, "linear"),
        /// @param 自動移動の入り・抜きの指定。"none" | "in" | "out" | "both"
        new TagValue("ease", "string", false, "none"),
        /// @param 自動移動をループさせるかどうか。タイプが "linear" か "catmullrom" の場合のみ有効
        new TagValue("loop", "boolean", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.startMove(tick, values.time, values.delay, values.path, values.type, values.ease, values.loop);
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description 自動移動を停止する
    /// @details
    ///   レイヤーの自動移動を停止します。\n
    ///   停止後、レイヤーの状態は自動移動が終わった時点の状態になります。
    new TagAction(
      ["stopmove"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象外レイヤー
        new TagValue("exclude", "string", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.stopMove();
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description 自動移動の終了を待つ
    /// @details
    ///   レイヤーの自動移動の終了を待ちます。\n
    ///   自動移動中のレイヤーが無い場合やループ再生の場合はなにもしません。
    new TagAction(
      ["waitmove", "wm"],
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        if (!p.hasMovingLayer) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitMoveClickCallback();
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.waitMoveClickCallback();
                },
                "waitmove",
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              "move",
              (): void => {
                p.waitMoveCompleteCallback();
              },
              "waitmove",
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
