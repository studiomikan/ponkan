import { Ponkan } from "../ponkan";
import { TagAction, TagActionResult, TagValue } from "../tag-action";
import { PonEventHandler } from "../base/pon-event-handler";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan): TagAction[] {
  return [
    // ======================================================================
    // システム
    // ======================================================================
    /// @category システム
    /// @description レイヤーの数を変更する
    /// @details
    ///   レイヤーの総数を変更します。
    ///
    ///   Ponkan初期化時のレイヤー数は40です。40では多すぎる場合・足りない場合は、
    ///   このコマンドでレイヤー数を変更してください。
    ///
    ///   レイヤー数の変更は頻繁には行わないでください。
    ///   ゲーム開始時に必要なレイヤー数に設定し、以後は変更しないという使い方をしてください。
    new TagAction(
      ["laycount"],
      [
        /// @param レイヤー数
        new TagValue("count", "number", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.layerCount = values.count;
        return "continue";
      },
    ),
    /// @category システム
    /// @description エラーを発生させるかどうかの設定
    /// @details
    ///   各種エラーを発生させるか・無視するかの設定を行います。
    new TagAction(
      ["raiseerror"],
      [
        /// @param `true` の場合、存在しないコマンドを実行したときにエラーにする
        new TagValue("unknowncommand", "boolean", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        values.unknowncommand != null && (p.raiseError.unknowncommand = values.unknowncommand);
        return "continue";
      },
    ),
    /// @category システム
    /// @description デバッグ情報をダンプ
    /// @details
    ///   デバッグ情報をブラウザのコンソールに出力します。
    new TagAction(
      ["dumpdebuginfo"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.dumpDebugInfo();
        return "continue";
      },
    ),
    /// @category システム
    /// @description Ponkanのイベント処理を一時的にロックする
    /// @details
    ///   Ponkanが行うマウス・タップ・キーボードイベント処理を一時的にロックします。
    ///   HTMLで作成したコンフィグ画面などを表示するときなどは、このコマンドで
    ///   イベント処理をロックするようにしてください。
    new TagAction(
      ["lockgame"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.lock();
        return "break";
      },
    ),
    /// @category システム
    /// @description Ponkanのイベント処理ロックを解除する
    /// @details
    ///   `lockgame` によるロックを解除します。
    new TagAction(
      ["unlockgame"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.unlock();
        return "break";
      },
    ),
    /// @category システム
    /// @description システム変数をクリア
    /// @details
    ///   システム変数を初期化します。すべてのシステム変数が削除されます。
    ///
    ///   システム変数はゲーム全体を通して使用される変数です。\n
    ///   ゲーム変数はセーブデータごとに別々の値を保存しますが、システム変数はゲーム全体で一つの値を保存します。
    ///
    ///   システム変数は、セーブ時やゲーム終了時に自動で保存され、ゲーム起動時に自動で復元されます。
    new TagAction(
      ["clearsysvar"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.resource.systemVar = {};
        return "continue";
      },
    ),
    /// @category システム
    /// @description ゲーム変数をクリア
    /// @details
    ///   ゲーム変数を初期化します。すべてのゲーム変数が削除されます。
    ///
    ///   ゲーム変数はセーブデータごとに保存させる変数です。シナリオの進行管理などに利用します。
    new TagAction(
      ["cleargamevar"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.resource.gameVar = {};
        return "continue";
      },
    ),
    /// @category システム
    /// @description 一時変数をクリア
    /// @details
    ///   一時変数を初期化します。すべての一時変数が削除されます。
    ///
    ///   一時変数はセーブデータ等に保存されません。一時的な値（計算の途中の値など）を保持するのに利用します。
    new TagAction(
      ["cleartmpvar"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.resource.tmpVar = {};
        return "continue";
      },
    ),
    /// @category システム
    /// @description システム変数を保存する
    /// @details
    ///   システム変数を保存します。\n
    ///   システム変数は普通、ゲーム終了時に自動的に保存されますが、
    ///   このコマンドを利用して明示的に保存することもできます。
    new TagAction(
      ["savesysvar"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.saveSystemData();
        return "continue";
      },
    ),
    /// @category システム
    /// @description クリックスキップの設定
    /// @details
    ///   クリックスキップの有効無効を設定します。\n
    ///   クリックスキップとは、テキスト表示途中にクリックすると行末・ページ末までスキップする機能のことです。
    new TagAction(
      ["clickskipopt", "clickskip"],
      [
        /// @param 有効ならtrue、無効ならfalseを指定
        new TagValue("enabled", "boolean", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.clickSkipEnabled = values.enabled;
        return "continue";
      },
    ),
    /// @category システム
    /// @description 画面揺れ効果の開始
    /// @details
    ///   画面を揺らす効果を実行します。\n
    ///   このコマンドは画面揺れが終わるのを待ちません。
    ///   画面揺れ効果が終わるまで処理を止めたい場合は、`waitquake` を使用してください。
    new TagAction(
      ["quake"],
      [
        /// @param 画面揺れの時間
        new TagValue("time", "number", true, null),
        /// @param 横方向の揺れの最大値
        new TagValue("x", "number", false, 20),
        /// @param 縦方向の揺れの最大値
        new TagValue("y", "number", false, 20),
      ],
      (values: any, tick: number): TagActionResult => {
        p.startQuake(tick, values.time, values.x, values.y);
        return "continue";
      },
    ),
    /// @category システム
    /// @description 画面揺れ効果の停止
    /// @details
    ///   `quake` で開始した画面揺れ効果を即座に停止します。
    ///   画面揺れ効果が実行されていない場合には何もしません。
    new TagAction(
      ["stopquake"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.stopQuake();
        return "continue";
      },
    ),
    /// @category システム
    /// @description 画面揺れ効果の終了待ち
    /// @details
    ///   `quake` で開始した画面揺れ効果の終了を待ちます。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///    イベントシーンなどでは `false` にしたほうが良いでしょう。
    new TagAction(
      ["waitquake"],
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        if (!p.isQuaking) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.stopQuake();
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.stopQuake();
                  p.conductor.start();
                },
                "waitquake",
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              "quake",
              (): void => {
                p.conductor.start();
              },
              "waitquake",
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
    /// @category システム
    /// @description 右クリック時の動作を設定する
    /// @details
    ///   右クリックまたは ESC キーを押下時の動作を設定します。
    ///
    ///   jump と call の両方を false に設定した場合、デフォルトの動作（メッセージレイヤーを隠す）になります。\n
    ///   jump を true に設定した場合、file と label で指定した場所へジャンプします。\n
    ///   call を true に設定した場合、file と label で指定した場所でサブルーチンを呼び出します。\n
    new TagAction(
      ["rightclick", "rclick"],
      [
        /// @param 右クリック時にjumpする場合はtrue
        new TagValue("jump", "boolean", false, null),
        /// @param 右クリック時にcallする場合はtrue
        new TagValue("call", "boolean", false, null),
        /// @param jumpまたはcallするスクリプトファイル名
        new TagValue("file", "string", false, null),
        /// @param jumpまたはcallするラベル名
        new TagValue("label", "string", false, null),
        /// @param 右クリックの有効無効
        new TagValue("enabled", "boolean", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.jump != null) {
          p.rightClickJump = values.jump;
        }
        if (values.call != null) {
          p.rightClickCall = values.call;
        }
        if (values.file != null) {
          p.rightClickFilePath = values.file;
        }
        if (values.label != null) {
          p.rightClickLabel = values.label;
        }
        if (values.enabled != null) {
          p.rightClickEnabled = values.enabled;
        }
        return "continue";
      },
    ),
    /// @category システム
    /// @description コマンドショートカットを設定する
    /// @details
    ///   コマンドショートカットを設定します。
    new TagAction(
      ["commandshortcut", "cmdsc"],
      [
        /// @param ショートカットの文字
        new TagValue("ch", "string", true, null),
        /// @param コマンドの名前
        new TagValue("command", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.addCommandShortcut(values.ch, values.command);
        return "continue";
      },
    ),
    /// @category システム
    /// @description コマンドショートカットを削除する
    /// @details
    ///   コマンドショートカットを削除します。
    new TagAction(
      ["delcommandshortcut", "delcmdsc"],
      [
        /// @param ショートカットの文字
        new TagValue("ch", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.delCommandShortcut(values.ch);
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
