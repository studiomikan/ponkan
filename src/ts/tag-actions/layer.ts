import { Ponkan3 } from "../ponkan3";
import { TagAction, TagActionResult, TagValue } from "../tag-action";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // レイヤー関係
    // ======================================================================
    /// @category レイヤー操作
    /// @description レイヤー名エイリアスを作成する
    /// @details
    ///   レイヤー名のエイリアス（別名）を作成します。
    ///   エイリアスを作成すると、レイヤーを指定するコマンドでレイヤー番号のかわりにエイリアス名を使用することができるようになります。
    ///   たとえば以下のように、背景画像を表示するレイヤーに base というようなエイリアスを作成することで、
    ///   スクリプト作成時の可読性が向上します。
    ///   ```
    ///   # 背景画像はレイヤー 0 に作成するので、エイリアスを作成する
    ///   ;layalias name: "base", lay: "0"
    ///   # 以後、背景画像は以下のように読み込める
    ///   ;image lay: "base", file: "image/bg0.png", x: 0, y: 0
    ///   ```
    new TagAction(
      ["layalias"],
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.layerAlias[values.name] = values.lay;
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤー名エイリアスを削除する
    /// @details
    ///   [`layalias`](#layalias) で設定したレイヤー名エイリアスを削除します。
    new TagAction(
      ["dellayalias"],
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        delete p.layerAlias[values.name];
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description メッセージレイヤーを指定する
    /// @details
    ///   メッセージレイヤーとして使用するレイヤーを指定します。
    ///
    ///   スクリプトに書かれたテキストは、メッセージレイヤーに出力されます。\n
    ///   出力先のレイヤーを切り替えたい場合は、このコマンドで切り替えるか、
    ///   もしくは [`ch`](#ch) コマンドなどを使用して出力してください。
    new TagAction(
      ["messagelayer", "messagelay", "meslay"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "number", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        const lay: number = +values.lay;
        if (lay < 0 || p.layerCount <= lay) {
          throw new Error("メッセージレイヤーの指定が範囲外です");
        }
        p.messageLayerNum = lay;
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description 行末グリフに関して設定する
    /// @details
    ///   行末クリック待ち中に表示されるグリフに関して設定します。\n
    new TagAction(
      ["linebreakglyph", "lbglyph"],
      [
        /// @param グリフとして使用するレイヤー
        new TagValue("lay", "number", false, null),
        /// @param グリフの表示位置。
        ///        "eol"を指定すると文章の末尾に表示。
        ///        "relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
        ///        "absolute"を指定すると画面上の絶対位置で固定表示。
        new TagValue("pos", "string", false, null),
        /// @param グリフの縦方向の揃え位置。
        ///        "top"を指定すると行の上端に揃えて表示。
        ///        "middle"を指定すると行の中央に揃えて表示。
        ///        "bottom"を指定すると行の下端に揃えて表示。
        ///        "text-top"を指定すると直前の一文字の上端に揃えて表示。
        ///        "text-middle"を指定すると直前の一文字の中央に揃えて表示。
        new TagValue("verticalalign", "string", false, null),
        /// @param グリフの表示位置。`pos: "relative"` または `pos: "absolute"` の場合のみ有効。
        new TagValue("x", "number", false, null),
        /// @param グリフの表示位置。`pos: "relative"` または `pos: "absolute"` の場合のみ有効。
        new TagValue("y", "number", false, null),
        /// @param グリフの表示位置のマージン。`pos: "relative"` の場合のみ有効。この値分だけ、本来の位置から補正されます。
        new TagValue("marginx", "number", false, null),
        /// @param グリフの表示位置のマージン。`pos: "relative"` の場合のみ有効。この値分だけ、本来の位置から補正されます。
        new TagValue("marginy", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.lay != null) {
          p.lineBreakGlyphLayerNum = values.lay;
        }
        if (values.pos != null) {
          p.lineBreakGlyphPos = values.pos;
        }
        if (values.verticalalign != null) {
          p.lineBreakGlyphVerticalAlign = values.verticalalign;
        }
        if (values.x != null) {
          p.lineBreakGlyphX = values.x;
        }
        if (values.y != null) {
          p.lineBreakGlyphY = values.y;
        }
        if (values.marginx != null) {
          p.lineBreakGlyphMarginX = values.marginx;
        }
        if (values.marginy != null) {
          p.lineBreakGlyphMarginY = values.marginy;
        }
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description ページ末グリフに関して設定する
    /// @details
    ///   ページ末クリック待ち中に表示されるグリフに関して設定します。\n
    new TagAction(
      ["pagebreakglyph", "pbglyph"],
      [
        /// @param グリフとして使用するレイヤー
        new TagValue("lay", "number", false, null),
        /// @param グリフの表示位置。
        ///        "eol"を指定すると文章の末尾に表示。
        ///        "relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
        ///        "absolute"を指定すると画面上の絶対位置で固定表示。
        new TagValue("pos", "string", false, null),
        /// @param グリフの縦方向の揃え位置。
        ///        "top"を指定すると行の上端に揃えて表示。
        ///        "middle"を指定すると行の中央に揃えて表示。
        ///        "bottom"を指定すると行の下端に揃えて表示。
        ///        "text-top"を指定すると直前の一文字の上端に揃えて表示。
        ///        "text-middle"を指定すると直前の一文字の中央に揃えて表示。
        new TagValue("verticalalign", "string", false, null),
        /// @param グリフの表示位置。`pos: "relative"` または `pos: "absolute"` の場合のみ有効。
        new TagValue("x", "number", false, null),
        /// @param グリフの表示位置。`pos: "relative"` または `pos: "absolute"` の場合のみ有効。
        new TagValue("y", "number", false, null),
        /// @param グリフの表示位置のマージン。ここで指定した分だけ、本来の位置から補正されます。
        new TagValue("marginx", "number", false, null),
        /// @param グリフの表示位置のマージン。ここで指定した分だけ、本来の位置から補正されます。
        new TagValue("marginy", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (values.lay != null) {
          p.pageBreakGlyphLayerNum = values.lay;
        }
        if (values.pos != null) {
          p.pageBreakGlyphPos = values.pos;
        }
        if (values.verticalalign != null) {
          p.pageBreakGlyphVerticalAlign = values.verticalalign;
        }
        if (values.x != null) {
          p.pageBreakGlyphX = values.x;
        }
        if (values.y != null) {
          p.pageBreakGlyphY = values.y;
        }
        if (values.marginx != null) {
          p.pageBreakGlyphMarginX = values.marginx;
        }
        if (values.marginy != null) {
          p.pageBreakGlyphMarginY = values.marginy;
        }
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーを塗りつぶす
    /// @details
    ///   指定されたレイヤーを単色で塗りつぶします。
    new TagAction(
      ["fillcolor", "fill"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 塗りつぶし色(0xRRGGBB)
        new TagValue("color", "number", true, null),
        /// @param 塗りつぶしのAlpha(0.0〜1.0)
        new TagValue("alpha", "number", false, 1.0),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.setBackgroundColor(values.color, values.alpha);
        });
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤー塗りつぶしをクリアする
    /// @details
    ///  [`fillcolor`](#fillcolor-fill) コマンドでのレイヤー塗りつぶしをクリアします。
    new TagAction(
      ["clearcolor"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearBackgroundColor();
        });
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーの設定
    /// @details
    ///   レイヤーに関して設定します。
    new TagAction(
      ["layopt"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 表示非表示
        new TagValue("visible", "boolean", false, null),
        /// @param x座標(px)
        new TagValue("x", "number", false, null),
        /// @param y座標(px)
        new TagValue("y", "number", false, null),
        /// @param 幅(px)
        new TagValue("width", "number", false, null),
        /// @param 高さ(px)
        new TagValue("height", "number", false, null),
        /// @param レイヤーのAlpha(0.0〜1.0)
        new TagValue("alpha", "number", false, 1.0),
        /// @param hidemessagesで同時に隠すかどうか
        new TagValue("autohide", "boolean", false, null),
        /// @param x軸方向のスケール。1.0で等倍
        new TagValue("scalex", "number", false, null),
        /// @param y軸方向のスケール。1.0で等倍
        new TagValue("scaley", "number", false, null),
        /// @param 左クリックイベントを遮断するかどうか
        new TagValue("blocklclick", "boolean", false, null),
        /// @param 右クリックイベントを遮断するかどうか
        new TagValue("blockrclick", "boolean", false, null),
        /// @param 中クリックイベントを遮断するかどうか
        new TagValue("blockcclick", "boolean", false, null),
        /// @param マウス移動イベントを遮断するかどうか
        new TagValue("blockmove", "boolean", false, null),
        /// @param マウスホイールイベントを遮断するかどうか
        new TagValue("blockwheel", "boolean", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          values.visible != null && (layer.visible = values.visible);
          values.x != null && (layer.x = values.x);
          values.y != null && (layer.y = values.y);
          values.scalex != null && (layer.scaleX = values.scalex);
          values.scaley != null && (layer.scaleY = values.scaley);
          values.width != null && (layer.width = values.width);
          values.height != null && (layer.height = values.height);
          values.alpha != null && (layer.alpha = values.alpha);
          values.autohide != null && (layer.autoHideWithMessage = values.autohide);
          values.blocklclick != null && (layer.blockLeftClickFlag = values.blocklclick);
          values.blockrclick != null && (layer.blockRightClickFlag = values.blockrclick);
          values.blockcclick != null && (layer.blockCenterClickFlag = values.blockcclick);
          values.blockmove != null && (layer.blockMouseMove = values.blockmove);
          values.blockwheel != null && (layer.blockWheelFlag = values.blockwheel);
        });
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーに画像を読み込む
    /// @details
    ///   指定のレイヤーに画像ファイルを読み込みます。\n
    ///   画像読み込み後、レイヤーのサイズを画像と同じサイズに変更します。
    new TagAction(
      ["loadimage", "image"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 読み込む画像ファイルパス
        new TagValue("file", "string", true, null),
        /// @param 表示非表示
        new TagValue("visible", "boolean", false, null),
        /// @param x座標(px)
        new TagValue("x", "number", false, null),
        /// @param y座標(px)
        new TagValue("y", "number", false, null),
        /// @param レイヤーのAlpha(0.0〜1.0)
        new TagValue("alpha", "number", false, 1.0),
      ],
      (values: any, tick: number): TagActionResult => {
        const task: Promise<void>[] = [];
        p.getLayers(values).forEach(layer => {
          task.push(
            ((): Promise<void> => {
              values.x != null && (layer.x = values.x);
              values.y != null && (layer.y = values.y);
              values.visible != null && (layer.visible = values.visible);
              values.alpha != null && (layer.alpha = values.alpha);
              return layer.loadImage(values.file);
            })(),
          );
        });
        Promise.all(task)
          .then(() => {
            p.conductor.start();
          })
          .catch(() => {
            if (p.config && p.config.developMode) {
              p.error(new Error(`画像読み込みに失敗しました。(${values.file})`));
            } else {
              p.error(new Error(`画像読み込みに失敗しました。`));
            }
          });
        return p.conductor.stop();
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーに追加で画像を読み込む
    /// @details
    ///   [`loadimage`](#loadimage-image) コマンドとは別に、追加で画像を読み込みます。
    new TagAction(
      ["loadchildimage", "childimage", ""],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 読み込む画像ファイルパス
        new TagValue("file", "string", true, null),
        /// @param x座標(px)
        new TagValue("x", "number", true, null),
        /// @param y座標(px)
        new TagValue("y", "number", true, null),
        /// @param 表示非表示
        new TagValue("alpha", "number", false, 1.0),
      ],
      (values: any, tick: number): TagActionResult => {
        const task: Promise<void>[] = [];
        p.getLayers(values).forEach(layer => {
          task.push(layer.loadChildImage(values.file, values.x, values.y, values.alpha));
        });
        Promise.all(task)
          .then(() => {
            p.conductor.start();
          })
          .catch(() => {
            p.error(new Error("追加の画像読み込みに失敗しました。"));
          });
        return p.conductor.stop();
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーの画像を開放する
    /// @details
    ///   レイヤーに読み込まれた画像をすべて解放します。
    new TagAction(
      ["freeimage", "free", "unloadimage"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.freeImage();
          layer.freeChildImages();
        });
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
