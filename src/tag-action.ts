import { AsyncCallbacks } from "./base/async-callbacks";
import { AsyncTask } from "./base/async-task";
import { Logger } from "./base/logger";
import { Resource } from "./base/resource";
import { Tag } from "./base/tag";
import { PonLayer } from "./layer/pon-layer";
import { Ponkan3 } from "./ponkan3";

export class TagValue {
  public name: string;
  public type: "number" | "boolean" | "string";
  public required: boolean;
  public defaultValue: any;
  public comment: string;

  public constructor(
    name: string,
    type: "number" | "boolean" | "string",
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
    new TagAction(
      "s",
      "スクリプトの実行を停止する",
      [],
      (values, tick) => {
        p.conductor.stop();
        return "break";
      },
    ),
    new TagAction(
      "ch",
      "文字を出力する",
      [
        new TagValue("text", "string", true, null, "出力する文字"),
        new TagValue("wait", "number", false, null, "文字出力後に待つ時間(ms)"),
      ],
      (values, tick) => {
        p.conductor.stop();
        p.messageLayer.addChar(values.text);
        if (values.wait != null) {
          return p.conductor.sleep(tick, values.wait);
        } else {
          return p.conductor.sleep(tick, p.textSpeed);
        }
      },
    ),
    new TagAction(
      "meslay",
      "メッセージレイヤーを指定する",
      [
        new TagValue("lay", "number", true, null, "対象レイヤー"),
        new TagValue("page", "string", false, "fore", "対象ページ"),
      ],
      (values, tick) => {
        let lay: number = +values.lay;
        if (lay < 0 || p.layerCount <= lay) {
          throw new Error("メッセージレイヤーの指定が範囲外です");
        }
        p.messageLayerNum = lay;
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
  ];
}
