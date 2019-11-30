import { Ponkan3 } from "../ponkan3";
import { TagAction, TagActionResult, TagValue } from "../tag-action";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // レイヤーフィルタ関係
    // ======================================================================
    /// @category レイヤーフィルタ
    /// @description フィルタをクリアする
    /// @details
    ///   指定レイヤーに設定されたすべてのフィルタをクリアします。
    new TagAction(
      ["clearfilters", "clearfilter"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearFilters();
        });
        return "continue";
      },
    ),
    /// @category レイヤーフィルタ
    /// @description ぼかしフィルタ
    /// @details
    ///   レイヤーにぼかしフィルタを設定します。
    new TagAction(
      ["blur"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param x軸方向のぼかし
        new TagValue("blurx", "number", false, 4),
        /// @param y軸方向のぼかし
        new TagValue("blury", "number", false, 4),
        /// @param ぼかしの品質
        new TagValue("quality", "number", false, 4),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.addFilter("blur", {
            blurX: values.blurx,
            blurY: values.blury,
            quality: values.quality,
          });
        });
        return "continue";
      },
    ),
    /// @category レイヤーフィルタ
    /// @description 色補正フィルタ
    /// @details
    ///   レイヤーに色補正フィルタを設定します。
    new TagAction(
      ["colorfilter"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param ガンマ値補正
        new TagValue("gamma", "number", false, null),
        /// @param 彩度
        new TagValue("saturation", "number", false, null),
        /// @param コントラスト
        new TagValue("contrast", "number", false, null),
        /// @param 輝度
        new TagValue("brightness", "number", false, null),
        /// @param 色調（赤）
        new TagValue("red", "number", false, null),
        /// @param 色調（緑）
        new TagValue("green", "number", false, null),
        /// @param 色調（青）
        new TagValue("blue", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.addFilter("color", values);
        });
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
