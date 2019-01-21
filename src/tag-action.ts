import { AsyncCallbacks } from "./base/async-callbacks";
import { AsyncTask } from "./base/async-task";
import { Logger } from "./base/logger";
import { Resource } from "./base/resource";
import { Tag } from "./base/tag";
import { PonLayer } from "./layer/pon-layer";
import { Ponkan3 } from "./ponkan3";

export class TagValue {
  public name: string;
  public type: "number" | "boolean" | "string" | "array" | "object";
  public required: boolean;
  public defaultValue: any;
  public comment: string;

  public constructor(
    name: string,
    type: "number" | "boolean" | "string" | "array" | "object",
    required: boolean,
    defaultValue: any,
    comment: string) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.defaultValue = defaultValue;
    this.comment = comment;
  }
}

export class TagAction {
  public name: string;
  public comment: string;
  public values: TagValue[];
  public action: (values: any, tick: number) => "continue" | "break";

  public constructor(
    name: string,
    comment: string,
    values: TagValue[],
    action: (val: any, tick: number) => "continue" | "break") {
    this.name = name;
    this.comment = comment;
    this.values = values;
    this.action = action;
  }
}

export function generateTagActions(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // その他
    // ======================================================================
    new TagAction(
      "laycount",
      "レイヤーの数を変更する",
      [
        new TagValue("count", "number", true, null, "レイヤー数")
      ],
      (values, tick) => {
        p.layerCount = values.count;
        return "continue";
      }
    ),
    new TagAction(
      "raiseerror",
      "エラーを発生させるかどうかの設定",
      [
        new TagValue("unknowntag", "boolean", false, null, "存在しないタグを実行したときにエラーにする")
      ],
      (values, tick) => {
        if (values.unknowntag != null) { p.raiseError.unknowntag = values.unknowntag; }
        return "continue";
      }
    ),
    new TagAction(
      "s",
      "スクリプトの実行を停止する",
      [],
      (values, tick) => {
        p.conductor.stop();
        p.skipMode = "invalid"
        return "break";
      }
    ),
    // ======================================================================
    // メッセージ関係
    // ======================================================================
    new TagAction(
      "ch",
      "文字を出力する",
      [
        new TagValue("text", "string", true, null, "出力する文字")
      ],
      (values, tick) => {
        p.messageLayer.addChar(values.text);
        if (p.skipMode === "invalid") {
          return p.conductor.sleep(tick, p.textSpeed);
        } else {
          return "continue";
        }
      }
    ),
    new TagAction(
      "textspeed",
      "文字出力のインターバルを設定",
      [
        new TagValue("time", "number", true, null, "インターバル時間(ms)")
      ],
      (values, tick) => {
        p.textSpeed = values.time;
        return "continue";
      }
    ),
    new TagAction(
      "lb",
      "行末クリック待ちで停止する",
      [
        // TOOD canskip
      ],
      (values, tick) => {
        // TODO 停止
        p.showLineBreakGlyph(tick);
        return p.conductor.stop();
      }
    ),
    // ======================================================================
    // レイヤー関係
    // ======================================================================
    new TagAction(
      "messagelay",
      "メッセージレイヤーを指定する",
      [
        new TagValue("lay", "number", true, null, "対象レイヤー")
      ],
      (values, tick) => {
        let lay: number = +values.lay;
        if (lay < 0 || p.layerCount <= lay) {
          throw new Error("メッセージレイヤーの指定が範囲外です");
        }
        p.messageLayerNum = lay;
        // TODO メッセージレイヤの初期化
        return "continue";
      },
    ),
    new TagAction(
      "breaklay",
      "グリフに使用するレイヤーを指定する",
      [
        new TagValue("linebreak", "number", false, null, "行末グリフのレイヤー"),
        new TagValue("pagebreak", "number", false, null, "ページ末グリフのレイヤー"),
        new TagValue("linepos", "string", false, null,
          `行末グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。`),
        new TagValue("pagepos", "string", false, null,
          `ページ末グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。`),
      ],
      (values, tick) => {
        if (values.pagebreak != null) { p.pageBreakGlyphLayerNum = values.pagebreak; }
        if (values.linebreak != null) { p.lineBreakGlyphLayerNum = values.linebreak; }
        if (values.pagepos != null && (values.pagepos == "eol" || values.pagepos == "fixed")) {
          p.pageBreakGlyphPos = values.pagepos;
        }
        if (values.linepos != null && (values.linepos == "eol" || values.linepos == "fixed")) {
          p.lineBreakGlyphPos = values.linepos;
        }
        return "continue";
      },
    ),
    new TagAction(
      "fillcolor",
      "レイヤーを塗りつぶす",
      [
        new TagValue("lay", "string", true, null, "対象レイヤー"),
        new TagValue("page", "string", false, "fore", "対象ページ"),
        new TagValue("color", "number", true, null, "塗りつぶし色(0xRRGGBB)"),
        new TagValue("alpha", "number", false, 1.0, "塗りつぶしのAlpha(0.0〜1.0)"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.setBackgoundColor(values.color, values.alpha)
        });
        return "continue";
      },
    ),
    new TagAction(
      "layopt",
      "レイヤーの設定",
      [
        new TagValue("lay", "string", true, null, "対象レイヤー"),
        new TagValue("page", "string", false, "fore", "対象ページ"),
        new TagValue("visible", "boolean", false, null, "表示非表示"),
        new TagValue("x", "number", false, null, "x座標(px)"),
        new TagValue("y", "number", false, null, "y座標(px)"),
        new TagValue("width", "number", false, null, "幅(px)"),
        new TagValue("height", "number", false, null, "高さ(px)"),
        new TagValue("alpha", "number", false, 1.0, "レイヤのAlpha(0.0〜1.0)"),
      ],
      (values, tick) => {
        console.log(values)
        p.getLayers(values).forEach((layer) => {
          if (values.visible != null) { layer.visible = values.visible; }
          if (values.x != null) { layer.x = values.x; }
          if (values.y != null) { layer.y = values.y; }
          if (values.width != null) { layer.width = values.width; }
          if (values.height != null) { layer.height = values.height; }
          if (values.alpha != null) { layer.alpha = values.alpha; }
        });
        return "continue";
      },
    ),
    new TagAction(
      "image",
      "レイヤーに画像を読み込む",
      [
        new TagValue("lay", "string", true, null, "対象レイヤー"),
        new TagValue("page", "string", false, "fore", "対象ページ"),
        new TagValue("file", "string", true, null, "読み込む画像ファイルパス"),
        new TagValue("visible", "boolean", false, null, "表示非表示"),
        new TagValue("x", "number", false, null, "x座標(px)"),
        new TagValue("y", "number", false, null, "y座標(px)"),
      ],
      (values, tick) => {
        const task: AsyncTask = new AsyncTask();
        p.getLayers(values).forEach((layer) => {
          task.add(() => {
            if (values.x != null) { layer.x = values.x; }
            if (values.y != null) { layer.y = values.y; }
            if (values.visible != null) { layer.visible = values.visible; }
            return layer.loadImage(values.file);
          });
        });
        task.run().done(() => {
          p.conductor.start();
        }).fail(() => {
          p.error(new Error("画像読み込みに失敗しました。"));
        });
        return p.conductor.stop();
      },
    ),
    // ======================================================================
    // アニメーション関係
    // ======================================================================
    new TagAction(
      "frameanim",
      "フレームアニメーションを設定する",
      [
        new TagValue("lay", "string", true, null, "対象レイヤー"),
        new TagValue("page", "string", false, "fore", "対象ページ"),
        new TagValue("loop", "boolean", false, false, "アニメーションをループさせるかどうか"),
        new TagValue("time", "number", true, null, "1フレームの時間"),
        new TagValue("width", "number", true, null, "1フレームの幅"),
        new TagValue("height", "number", true, null, "1フレームの高さ"),
        new TagValue("frames", "array", true, null, "フレーム指定"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.initFrameAnim(values.loop, values.time, values.width, values.height, values.frames);
        });
        return "continue";
      },
    ),
    new TagAction(
      "startframeanim",
      "フレームアニメーションを開始する",
      [
        new TagValue("lay", "string", true, null, "対象レイヤー"),
        new TagValue("page", "string", false, "fore", "対象ページ"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.startFrameAnim(tick);
        });
        return "continue";
      },
    ),
  ];
}
