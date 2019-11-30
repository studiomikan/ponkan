import { Ponkan3 } from "../ponkan3";
import { TagAction, TagActionResult, TagValue } from "../tag-action";
import { PonEventHandler } from "../base/pon-event-handler";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // トランジション
    // ======================================================================
    /// @category トランジション
    /// @description 表ページを裏ページにコピーする
    /// @details
    ///   表ページの状態を裏ページにコピーします。
    new TagAction(
      ["backlay"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.backlay(values.lay);
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description レイヤ情報をコピーする
    /// @details
    ///   `srclay` のレイヤーの状態を `destlay` のレイヤーにコピーします。
    new TagAction(
      ["copylay"],
      [
        /// @param コピー元レイヤー
        new TagValue("srclay", "number", true, null),
        /// @param コピー先レイヤー
        new TagValue("destlay", "number", true, null),
        /// @param コピー元ページ
        new TagValue("srcpage", "string", false, "fore"),
        /// @param コピー先ページ
        new TagValue("destpage", "string", false, "fore"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.copylay(values.srclay, values.destlay, values.srcpage, values.destpage);
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description 操作対象ページを変更する
    /// @details
    ///   操作対象ページを変更します。
    ///
    ///   通常、操作対象ページは表ページ（画面に見えている側）になっていますが、
    ///   トランジションを利用する場合は裏ページを操作します。
    ///   その際に各コマンドで `page: "back"` と指定しても良いですが、
    ///   このコマンドで操作対象ページを `"back"` に設定すれば、
    ///   以後 `trans` コマンドが実行されるまで裏ページが操作対象になります。
    new TagAction(
      ["currentpage"],
      [
        /// @param 操作対象ページ（"fore" | "back" ）を指定
        new TagValue("page", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.currentPage = values.page;
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description トランジションの前準備
    /// @details
    ///   表ページの情報を裏ページにコピーし、操作対象を裏ページに変更します。\n
    ///   `backlay` コマンドと `currentpage page: "back"` コマンドを実行したのと同じ状態となります。
    new TagAction(
      ["preparetrans", "pretrans"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.backlay("all");
        p.currentPage = "back";
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description トランジションを実行する
    /// @details
    ///   トランジションを実行します。\n
    ///   トランジションの詳細は [トランジション](../transition) のページを参照してください。
    ///
    ///   このコマンドはトランジションの完了を待ちません。終了するまで待つ場合は `waittrans` コマンドを使用してください。
    new TagAction(
      ["trans"],
      [
        /// @param トランジションの時間(ms)
        new TagValue("time", "number", true, null),
        /// @param トランジションの種類
        new TagValue("method", "string", false, "crossfade"),
        /// @param 自動移動をループさせるかどうか。タイプが "linear" か "catmullrom" の場合のみ有効
        new TagValue("rule", "string", false, ""),
        /// @param あいまい値
        new TagValue("vague", "number", false, 0.25),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.time <= 0) {
          p.flip();
          p.onCompleteTrans();
          return "continue";
        } else {
          if (values.method === "univ") {
            p.transManager
              .initUnivTrans(values.time, values.rule, values.vague)
              .then(() => {
                p.transManager.start();
                p.conductor.start();
              })
              .catch(() => {
                throw new Error(`トランジションの処理に失敗しました。(${values.method}, ${values.rule})`);
              });
            return p.conductor.stop();
          } else {
            p.transManager
              .initTrans(values.time, values.method)
              .then(() => {
                p.transManager.start();
                p.conductor.start();
              })
              .catch(() => {
                throw new Error(`トランジションの処理に失敗しました。(${values.method})`);
              });
            return p.conductor.stop();
          }
        }
      },
    ),
    /// @category トランジション
    /// @description トランジションを停止する
    /// @details
    ///   トランジションを即座に停止します。
    ///   各レイヤーの状態は、通常通りトランジションが完了したのと同じ状態になります。
    new TagAction(
      ["stoptrans"],
      [],
      (values: any, tick: number): TagActionResult => {
        if (!p.transManager.isRunning) {
          return "continue";
        } else {
          p.transManager.stop();
          return "continue";
        }
      },
    ),
    /// @category トランジション
    /// @description トランジションの終了を待つ
    /// @details
    ///   トランジションが完了するのを待ちます。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///   イベントシーンなどでは `false` にしたほうが良いでしょう。
    new TagAction(
      ["waittrans", "wt"],
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        if (!p.transManager.isRunning) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitTransClickCallback();
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.waitTransClickCallback();
                },
                "waittrans",
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              "trans",
              (): void => {
                p.waitTransCompleteCallback();
              },
              "waittrans",
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
    /// @category トランジション
    /// @description 表ページを裏ページを即座に入れ替える
    /// @details
    ///   表ページと裏ページを即座に入れ替えます。\n
    ///   トランジションとは違い、なんの効果（演出）も無しで即適用されます。
    new TagAction(
      ["flip"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.flip();
        p.onCompleteTrans();
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
