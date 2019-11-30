import { Ponkan3 } from "../ponkan3";
import { TagAction, TagActionResult, TagValue } from "../tag-action";
import { PonEventHandler } from "../base/pon-event-handler";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // スクリプト制御
    // ======================================================================
    /// @category スクリプト制御
    /// @description スクリプトの実行を停止する
    /// @details
    ///   スクリプトの実行を停止します。
    ///   ボタン（選択肢）の押下待ちなどで使用します。
    new TagAction(
      ["s"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.conductor.passLatestSaveMark();
        p.conductor.stop();
        p.stopSkip();
        return "break";
      },
    ),
    /// @category スクリプト制御
    /// @description スクリプトファイルを移動する
    /// @details
    ///   指定したファイルの、指定したラベルの位置に移動します。
    ///
    ///   実行中のスクリプトファイルから別のシナリオファイルへ移動する場合、
    ///   ファイルの読み込みや解析処理が発生するため、処理に時間がかかる場合があります。\n
    ///   同じスクリプトファイル内の移動は問題ありません。
    new TagAction(
      ["jump"],
      [
        /// @param 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する
        new TagValue("file", "string", false, null),
        /// @param 移動先のラベル名。省略時はファイルの先頭
        new TagValue("label", "string", false, null),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.file == null && values.label == null) {
          return "continue";
        } else {
          p.conductor.jump(values.file, values.label, values.countpage).then(() => {
            p.conductor.start();
          });
          return p.conductor.stop();
        }
      },
    ),
    /// @category スクリプト制御
    /// @description サブルーチンを呼び出す
    /// @details
    ///   指定したファイルの、指定したラベルの位置をサブルーチンとして呼び出します。
    ///
    ///   実行中のスクリプトファイルから別のシナリオファイルへ移動する場合、
    ///   ファイルの読み込みや解析処理が発生するため、処理に時間がかかる場合があります。\n
    ///   同じスクリプトファイル内の移動は問題ありません。
    new TagAction(
      ["call"],
      [
        /// @param 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する
        new TagValue("file", "string", false, null),
        /// @param 移動先のラベル名。省略時はファイルの先頭
        new TagValue("label", "string", false, null),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, false),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.file == null && values.label == null) {
          return "continue";
        } else {
          p.callSubroutine(values.file, values.label, values.countpage).then(() => {
            p.conductor.start();
          });
          return p.conductor.stop();
        }
      },
    ),
    /// @category スクリプト制御
    /// @description サブルーチンをから戻る
    /// @details
    ///   `call` コマンドで呼び出したサブルーチンから、呼び出し元に戻ります。
    ///
    ///   `forcestart` は、システムボタンを作成する際に使用します。
    ///   システムボタンで呼び出したサブルーチンで `skip` や `auto` を実行しても、通常はサブルーチンから戻るとスクリプトは停止してしまいます。
    ///   `forcestart` を `true` にした時は、呼び出し元へ戻ると同時に、`lb` `pb` コマンドなどで停止していたとしても、強制的に再開されます。
    ///   ただし `s` コマンドでスクリプトが完全に停止していた場合は停止したままです。
    new TagAction(
      ["return"],
      [
        /// @param 戻った後、強制的にシナリオを再開する
        new TagValue("forcestart", "boolean", false, false),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        return p.returnSubroutine(values.forcestart, values.countpage);
      },
    ),
    /// @category スクリプト制御
    /// @description 条件によって分岐する
    /// @details
    new TagAction(
      ["if"],
      [
        /// @param 条件式(JavaScript)
        new TagValue("exp", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.conductor.script.ifJump(values.exp, p.tagActions);
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 条件によって分岐する
    /// @details
    new TagAction(
      ["elseif", "elsif"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.conductor.script.elsifJump();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 条件によって分岐する
    /// @details
    new TagAction(
      ["else"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.conductor.script.elseJump();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 条件分岐の終了
    /// @details
    new TagAction(
      ["endif"],
      [],
      (values: any, tick: number): TagActionResult => {
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 指定回数繰り返す
    /// @details
    ///   `for` コマンドと `endfor` コマンドの間を指定回数繰り返します。\n
    ///   `indexvar` で指定した名前の一時変数にループ回数が格納されます。
    ///   ループ回数は `0` から始まるため、 `0` 〜 `loops - 1` の値をとります。
    new TagAction(
      ["for"],
      [
        /// @param 繰り替えし回数
        new TagValue("loops", "number", true, null),
        /// @param ループ中のインデックスを格納する変数名
        new TagValue("indexvar", "string", false, "__index__"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.conductor.script.startForLoop(values.loops, values.indexvar);
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description forループの終端
    /// @details
    new TagAction(
      ["endfor"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.conductor.script.endForLoop();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description forループから抜ける
    /// @details
    ///   現在実行中の `for` ループから抜け、 `endfor` の位置まで移動します。\n
    ///   `if` コマンドなどと組み合わせて、条件によってループを抜けるときに使います。
    new TagAction(
      ["breakfor"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.conductor.script.breakForLoop();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description スキップを開始する
    /// @details
    ///   スキップ処理を開始します。
    new TagAction(
      ["startskip", "skip"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.startSkipByTag();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description スキップを停止する
    /// @details
    ///   スキップ処理を停止します。
    new TagAction(
      ["stopskip"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.stopSkip();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description オートモードを開始する
    /// @details
    ///   オートモードを開始します。
    new TagAction(
      ["startautomode", "startauto", "auto"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.startAutoMode();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description オートモードを停止する
    /// @details
    ///   オートモードを停止します。
    new TagAction(
      ["stopautomode", "stopauto"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.stopAutoMode();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description オートモードの設定
    /// @details
    ///   オートモードに関する設定を行います。
    ///
    ///   `lay` では、オートモード中かどうかを表示するためのレイヤーを指定します。
    ///   オートモード中は、ここで指定したレイヤーが強制的に表示状態になります。
    new TagAction(
      ["automodeopt", "autoopt"],
      [
        /// @param オートモード状態表示に使用するレイヤー
        new TagValue("lay", "number", false, null),
        /// @param オートモードのインターバル時間(ms)
        new TagValue("time", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.lay) {
          p.autoModeLayerNum = values.lay;
        }
        if (values.time) {
          p.autoModeInterval = values.time;
        }
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 指定時間を待つ
    /// @details
    ///   指定した時間だけ、スクリプトの動作を停止します。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///    イベントシーンなどでは `false` にしたほうが良いでしょう。
    new TagAction(
      ["wait"],
      [
        /// @param 停止時間(ms)
        new TagValue("time", "number", true, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        if (p.isSkipping && values.canskip) {
          return "continue";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.conductor.start();
                  p.stopUntilClickSkip(); // 次のlb,pbまで飛ばされるのを防ぐ
                },
                "wait",
              ),
            );
          }
          return p.conductor.sleep(tick, values.time, "wait");
        }
      },
    ),
    /// @category スクリプト制御
    /// @description クリック待ちで停止する
    /// @details
    ///   マウスのクリック・画面のタップなどの操作待ちでスクリプトを停止します。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///    イベントシーンなどでは `false` にしたほうが良いでしょう。
    new TagAction(
      ["waitclick"],
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        p.stopUntilClickSkip(); // クリック待ちまでのスキップを停止
        if (p.isSkipping && values.canskip) {
          // UNTIL_CLICK_WAITが終わってもなおスキップ中なら、クリック待ちはしない
          // ただし改行条件等を通常と揃えるために一度グリフを表示して、すぐに非表示にする
          return "continue";
        } else {
          p.conductor.addEventHandler(
            new PonEventHandler(
              "click",
              (): void => {
                p.conductor.start();
              },
              "waitclick",
            ),
          );
          if (p.autoModeFlag && values.canskip) {
            p.reserveAutoClick(tick); // オートモード時の自動クリックを予約
          }
          return p.conductor.stop();
        }
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
