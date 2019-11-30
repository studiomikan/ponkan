import { Ponkan3 } from "../ponkan3";
import { TagAction, TagActionResult, TagValue } from "../tag-action";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // メッセージ履歴関係
    // ======================================================================
    /// @category メッセージ履歴
    /// @description メッセージ履歴を設定する
    /// @details
    ///   メッセージ履歴に関して設定します。
    new TagAction(
      ["historyopt"],
      [
        /// @param メッセージレイヤに文字を出力するかどうか
        new TagValue("output", "boolean", false, null),
        /// @param メッセージレイヤを表示できるかどうか
        new TagValue("enabled", "boolean", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.output != null) {
          p.historyLayer.outputFlag = values.output;
        }
        if (values.enabled != null) {
          p.enabledHistory = values.enabled;
        }
        return "continue";
      },
    ),
    /// @category メッセージ履歴
    /// @description メッセージ履歴を表示する
    /// @details
    ///   メッセージ履歴を表示します。
    new TagAction(
      ["showhistory", "history"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.showHistoryLayer();
        return "continue";
      },
    ),
    /// @category メッセージ履歴
    /// @description メッセージ履歴にテキストを出力する
    /// @details
    ///   メッセージ履歴に指定のテキストを出力します。
    new TagAction(
      ["historych", "hch"],
      [
        /// @param 出力する文字
        new TagValue("text", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.addTextToHistory(values.text);
        return "continue";
      },
    ),
    /// @category メッセージ履歴
    /// @description メッセージ履歴を改行する
    /// @details
    ///   メッセージ履歴のテキストを改行します。
    new TagAction(
      ["hbr"],
      [],
      (values: any, tick: number): TagActionResult => {
        p.historyTextReturn();
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
