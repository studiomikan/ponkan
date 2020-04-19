import { Ponkan } from "../ponkan";
import { TagAction, TagActionResult, TagValue } from "../tag-action";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan): TagAction[] {
  return [
    // ======================================================================
    // ボタン関係
    // ======================================================================
    /// @category ボタン
    /// @description レイヤーにテキストボタンを配置する
    /// @details
    ///   指定のレイヤーに、テキストと背景色を用いたボタンを配置します。
    ///   配置直後はボタンはロックされた状態となり、押下することはできません。
    ///   `unlockbuttons` コマンドでロック状態を解除することで、押下できるようになります。
    new TagAction(
      ["textbutton", "txtbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param ボタンの名前
        new TagValue("btnname", "string", false, null),
        /// @param ボタン押下時にjumpする場合はtrue
        new TagValue("jump", "boolean", false, true),
        /// @param ボタン押下時にcallする場合はtrue
        new TagValue("call", "boolean", false, null),
        /// @param ボタン押下時にjumpまたはcallするスクリプトファイル名
        new TagValue("file", "string", false, null),
        /// @param ボタン押下時にjumpまたはcallするラベル名
        new TagValue("label", "string", false, null),
        /// @param マウスポインタが重なったタイミングで実行するJavaScript
        new TagValue("onclick", "string", false, null),
        /// @param マウスポインタが出ていったタイミングで実行するJavaScript
        new TagValue("onleave", "string", false, null),
        /// @param ボタン押下時に実行するJavaScript
        new TagValue("onclick", "string", false, null),
        /// @param テキスト
        new TagValue("text", "string", false, ""),
        /// @param x座標(px)
        new TagValue("x", "number", false, 0),
        /// @param y座標(px)
        new TagValue("y", "number", false, 0),
        /// @param 幅(px)
        new TagValue("width", "number", true, null),
        /// @param 高さ(px)
        new TagValue("height", "number", true, null),
        /// @param 背景色の配列(0xRRGGBB)。通常時、マウスオーバー時、マウス押下時の順。例：[0xFF0000, 0x00FF00, 0x0000FF]
        new TagValue("bgcolors", "array", true, null),
        /// @param 背景色のAlphaの配列(0.0〜1.0)。通常時、マウスオーバー時、マウス押下時の順
        new TagValue("bgalphas", "array", false, [1, 1, 1]),
        /// @param システム用ボタンとする場合はtrue
        new TagValue("system", "boolean", false, false),
        /// @param テキスト描画のマージン（上）。
        new TagValue("margint", "number", false, 0),
        /// @param テキスト描画のマージン（右）。
        new TagValue("marginr", "number", false, 0),
        /// @param テキスト描画のマージン（下）。
        new TagValue("marginb", "number", false, 0),
        /// @param テキスト描画のマージン（左）。
        new TagValue("marginl", "number", false, 0),
        /// @param テキスト寄せの方向。"left" | "center" | "right"
        new TagValue("align", "string", false, "center"),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
        /// @param マウスポインタが重なったタイミングで再生する音声の音声バッファ
        new TagValue("enterbuf", "string", false, ""),
        /// @param マウスポインタが出て行ったタイミングで再生する音声の音声バッファ
        new TagValue("leavebuf", "string", false, ""),
        /// @param ボタン押下時に再生する音声の音声バッファ
        new TagValue("clickbuf", "string", false, ""),
        /// @param キーボードでボタンを選択するときの選択順。小さい順に選択される。省略時は追加した順となる。
        new TagValue("keyindex", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          let keyIndex: number | null = values.keyindex;
          if (keyIndex == null || keyIndex == undefined) {
            keyIndex = p.getButtonKeyIndex(values);
          }
          layer.addTextButton(
            values.btnname,
            values.jump,
            values.call,
            values.file,
            values.label,
            values.countpage,
            values.onenter,
            values.onleave,
            values.onclick,
            values.text,
            values.x,
            values.y,
            values.width,
            values.height,
            values.bgcolors,
            values.bgalphas,
            values.system,
            values.margint,
            values.marginr,
            values.marginb,
            values.marginl,
            values.align,
            values.enterbuf,
            values.leavebuf,
            values.clickbuf,
            keyIndex,
          );
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description テキストボタンの設定を変更する
    /// @details
    ///   指定されたレイヤーのテキストボタンの設定を変更します。
    ///   変更対象のテキストボタンは、ボタンの名前（`textbutton` の `btnname` で設定した名前）で指定します。
    new TagAction(
      ["textbuttonopt", "txtbtnopt"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 対象のボタンの名前
        new TagValue("btnname", "string", true, null),
        /// @param 背景色の配列(0xRRGGBB)。通常時、マウスオーバー時、マウス押下時の順。例：[0xFF0000, 0x00FF00, 0x0000FF]
        new TagValue("bgcolors", "array", false, null),
        /// @param 背景色のAlphaの配列(0.0〜1.0)。通常時、マウスオーバー時、マウス押下時の順
        new TagValue("bgalphas", "array", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          if (values.bgcolors) {
            layer.changeTextButtonColors(values.btnname, values.bgcolors);
          }
          if (values.bgalphas) {
            layer.changeTextButtonAlphas(values.btnname, values.bgalphas);
          }
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description すべてのボタンをクリアする
    /// @details
    ///   指定されたレイヤーのテキストボタン、画像ボタン、トグルボタンをすべて解放します。
    new TagAction(
      ["clearbuttons", "clearbutton", "clearbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearTextButtons();
          layer.clearImageButtons();
          layer.clearToggleButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description テキストボタンをクリアする
    /// @details
    ///   指定されたレイヤーのテキストボタンをクリアします。
    new TagAction(
      ["cleartextbuttons", "cleartextbutton", "cleartxtbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearTextButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description レイヤーに画像ボタンを配置する
    /// @details
    ///   指定のレイヤーに、画像を用いたボタンを配置します。
    ///   配置直後はボタンはロックされた状態となり、押下することはできません。
    ///   `unlockbuttons` コマンドでロック状態を解除することで、押下できるようになります。
    new TagAction(
      ["imagebutton", "imgbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param ボタン押下時にjumpする場合はtrue
        new TagValue("jump", "boolean", false, true),
        /// @param ボタン押下時にcallする場合はtrue
        new TagValue("call", "boolean", false, null),
        /// @param ボタン押下時にjumpまたはcallするスクリプトファイル名
        new TagValue("file", "string", false, null),
        /// @param ボタン押下時にjumpまたはcallするラベル名
        new TagValue("label", "string", false, null),
        /// @param マウスポインタが重なったタイミングで実行するJavaScript
        new TagValue("onclick", "string", false, null),
        /// @param マウスポインタが出ていったタイミングで実行するJavaScript
        new TagValue("onleave", "string", false, null),
        /// @param ボタン押下時に実行するJavaScript
        new TagValue("onclick", "string", false, null),
        /// @param ボタンにする画像ファイル
        new TagValue("imagefile", "string", true, null),
        /// @param x座標(px)
        new TagValue("x", "number", false, 0),
        /// @param y座標(px)
        new TagValue("y", "number", false, 0),
        /// @param ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び"
        new TagValue("direction", "string", false, "horizontal"),
        /// @param システム用ボタンとする場合はtrue
        new TagValue("system", "boolean", false, false),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
        /// @param マウスポインタが重なったタイミングで再生する音声の音声バッファ
        new TagValue("enterbuf", "string", false, ""),
        /// @param マウスポインタが出て行ったタイミングで再生する音声の音声バッファ
        new TagValue("leavebuf", "string", false, ""),
        /// @param ボタン押下時に再生する音声の音声バッファ
        new TagValue("clickbuf", "string", false, ""),
        /// @param キーボードでボタンを選択するときの選択順。小さい順に選択される。省略時は追加した順となる。
        new TagValue("keyindex", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          let keyIndex: number | null = values.keyindex;
          if (keyIndex == null || keyIndex == undefined) {
            keyIndex = p.getButtonKeyIndex(values);
          }
          layer
            .addImageButton(
              values.jump,
              values.call,
              values.file,
              values.label,
              values.countpage,
              values.onenter,
              values.onleave,
              values.onclick,
              values.imagefile,
              values.x,
              values.y,
              values.direction,
              values.system,
              values.enterbuf,
              values.leavebuf,
              values.clickbuf,
              keyIndex,
            )
            .then(() => {
              p.conductor.start();
            })
            .catch(() => {
              p.error(new Error(`画像読み込みに失敗しました。(${values.imagefile})`));
            });
        });
        return p.conductor.stop();
      },
    ),
    /// @category ボタン
    /// @description 画像ボタンをクリアする
    /// @details
    ///   指定されたレイヤーの画像ボタンをクリアします。
    new TagAction(
      ["clearimagebuttons", "clearimagebutton", "clearimgbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearImageButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description レイヤーにトグルボタンを配置する
    /// @details
    ///   指定のレイヤーに、画像を用いたトグルボタンを配置します。
    ///   配置直後はボタンはロックされた状態となり、押下することはできません。
    ///   `unlockbuttons` コマンドでロック状態を解除することで、押下できるようになります。
    ///
    ///   トグルボタンは通常のボタンと異なり、オン・オフの二種類の状態を持ちます。
    ///   機能のオン・オフの切り替えなどに利用することができます。
    ///
    ///   オン状態のとき、statevarで設定した一時変数にtrueが設定されます。
    ///   オフ状態のときはfalseが設定されます。
    new TagAction(
      ["togglebutton", "tglbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 選択状態を格納する一時変数の名前。
        new TagValue("statevar", "string", true, null),
        /// @param ボタン押下時にjumpする場合はtrue
        new TagValue("jump", "boolean", false, true),
        /// @param ボタン押下時にcallする場合はtrue
        new TagValue("call", "boolean", false, null),
        /// @param ボタン押下時にjumpまたはcallするスクリプトファイル名
        new TagValue("file", "string", false, null),
        /// @param ボタン押下時にjumpまたはcallするラベル名
        new TagValue("label", "string", false, null),
        /// @param マウスポインタが重なったタイミングで実行するJavaScript
        new TagValue("onclick", "string", false, null),
        /// @param マウスポインタが出ていったタイミングで実行するJavaScript
        new TagValue("onleave", "string", false, null),
        /// @param ボタン押下時に実行するJavaScript
        new TagValue("onclick", "string", false, null),
        /// @param トグルボタンにする画像ファイル
        new TagValue("imagefile", "string", true, null),
        /// @param x座標(px)
        new TagValue("x", "number", false, 0),
        /// @param y座標(px)
        new TagValue("y", "number", false, 0),
        /// @param ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び"
        new TagValue("direction", "string", false, "horizontal"),
        /// @param システム用ボタンとする場合はtrue
        new TagValue("system", "boolean", false, false),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
        /// @param マウスポインタが重なったタイミングで再生する音声の音声バッファ
        new TagValue("enterbuf", "string", false, ""),
        /// @param マウスポインタが出て行ったタイミングで再生する音声の音声バッファ
        new TagValue("leavebuf", "string", false, ""),
        /// @param ボタン押下時に再生する音声の音声バッファ
        new TagValue("clickbuf", "string", false, ""),
        /// @param キーボードでボタンを選択するときの選択順。小さい順に選択される。省略時は追加した順となる。
        new TagValue("keyindex", "number", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          let keyIndex: number | null = values.keyindex;
          if (keyIndex == null || keyIndex == undefined) {
            keyIndex = p.getButtonKeyIndex(values);
          }
          layer
            .addToggleButton(
              values.jump,
              values.call,
              values.file,
              values.label,
              values.countpage,
              values.onenter,
              values.onleave,
              values.onclick,
              values.imagefile,
              values.x,
              values.y,
              values.direction,
              values.system,
              values.enterbuf,
              values.leavebuf,
              values.clickbuf,
              keyIndex,
              values.statevar,
            )
            .then(() => {
              p.conductor.start();
            })
            .catch(() => {
              p.error(new Error(`画像読み込みに失敗しました。(${values.imagefile})`));
            });
        });
        return p.conductor.stop();
      },
    ),
    /// @category ボタン
    /// @description トグルボタンをクリアする
    /// @details
    ///   指定されたレイヤーのトグルボタンをクリアします。
    new TagAction(
      ["cleartogglebuttons", "cleartogglebutton", "cleartglbtn"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.clearToggleButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description ボタンをロックする
    /// @details
    ///   指定されたレイヤーのボタンをロックし、押下できないようにします。
    new TagAction(
      ["lockbuttons", "lockbutton", "lock"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.lockButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description ボタンをアンロックする
    /// @details
    ///   指定されたレイヤーのボタンのロックを解除し、押下できる状態にします。\n
    ///   このコマンドでボタンを押下可能にした後は、直後に `s` コマンドでスクリプトの実行を停止してください。
    new TagAction(
      ["unlockbuttons", "unlockbutton", "unlock"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.unlockButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description システムボタンをロックする
    /// @details
    ///   指定されたレイヤーのシステムボタンをロックし、押下できないようにします。
    new TagAction(
      ["locksystembuttons", "locksystembutton", "locksystem"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.lockSystemButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description システムボタンをアンロックする
    /// @details
    ///   指定されたレイヤーのシステムボタンのロックを解除し、押下できる状態にします。
    new TagAction(
      ["unlocksystembuttons", "unlocksystembutton", "unlocksystem"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.unlockSystemButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description レイヤーにスライダーを配置する
    /// @details
    ///   指定のレイヤーに、画像を用いたスライダーを配置します。
    ///   配置直後はロックされた状態となり、押下することはできません。
    ///   `unlockslider` コマンドでロック状態を解除することで、押下できるようになります。
    new TagAction(
      ["slider"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param x座標(px)
        new TagValue("x", "number", false, 0),
        /// @param y座標(px)
        new TagValue("y", "number", false, 0),
        /// @param 初期値(0.0～1.0)
        new TagValue("value", "number", false, 0),
        /// @param 値変更時に実行する関数
        new TagValue("onchange", "string|function", false, ""),
        /// @param スライダーの背景用画像のファイルパス
        new TagValue("back", "string", true, null),
        /// @param スライダーの表面画像のファイルパス
        new TagValue("fore", "string", true, null),
        /// @param スライダーの表面画像のファイルパス
        new TagValue("button", "string", true, null),
        /// @param キーボードでボタンを選択するときの選択順。小さい順に選択される。省略時は追加した順となる。
        new TagValue("keyindex", "number", false, null),
        // /// @param マウスポインタがスライダーに重なったタイミングで再生する音声の音声バッファ
        // new TagValue("enterbuf", "string", false, ""),
        // /// @param マウスポインタがスライダーから出て行ったタイミングで再生する音声の音声バッファ
        // new TagValue("leavebuf", "string", false, ""),
        // /// @param スライダー押下時に再生する音声の音声バッファ
        // new TagValue("clickbuf", "string", false, ""),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          let keyIndex: number | null = values.keyindex;
          if (keyIndex == null || keyIndex == undefined) {
            keyIndex = p.getButtonKeyIndex(values);
          }
          layer
            .addSlider(
              values.x,
              values.y,
              values.value,
              values.onchange,
              values.back,
              values.fore,
              values.button,
              keyIndex,
            )
            .then(() => {
              p.conductor.start();
            })
            .catch(() => {
              p.error(new Error(`画像読み込みに失敗しました。(${values.back})(${values.fore})(${values.button})`));
            });
        });
        return p.conductor.stop();
      },
    ),
    /// @category ボタン
    /// @description スライダーをロックする
    /// @details
    ///   指定レイヤーのスライダーをロックし、押下できない状態にします。
    new TagAction(
      ["locksliders", "lockslider"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.lockSliders();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description スライダーをアンロックする
    /// @details
    ///   指定レイヤーのスライダーのロックを解除し、押下できる状態にします。
    new TagAction(
      ["unlocksliders", "unlockslider"],
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.unlockSliders();
        });
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
