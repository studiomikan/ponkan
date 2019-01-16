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

  public constructor(
    name: string,
    type: "number" | "boolean" | "string",
    required: boolean,
    defaultValue: any = null) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.defaultValue = defaultValue;
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
        new TagValue("text", "string", true),
      ],
      (values, tick) => {
        p.conductor.stop();
        // TODO 時間を待つ
        return "continue";
      },
    ),
    new TagAction(
      "image",
      "レイヤに画像を読み込む",
      [
        new TagValue("lay", "string", false, 0),
        new TagValue("page", "string", false, "fore"),
        new TagValue("file", "string", true),
        new TagValue("visible", "boolean", false),
        new TagValue("x", "number", false),
        new TagValue("y", "number", false),
      ],
      (values, tick) => {
        const layers: PonLayer[] = p.getLayers(values);
        const task: AsyncTask = new AsyncTask();
        layers.forEach((layer) => {
          task.add(() => {
            layer.visible = values.visible;
            if (values.x != null) { layer.x = values.x; }
            if (values.y != null) { layer.y = values.y; }
            return layer.loadImage(values.file);
          });
        });
        task.run().done(() => {
          p.conductor.start();
        }).fail(() => {
          p.error(new Error("画像読み込みに失敗しました。"));
        });
        p.conductor.stop();
        return "break";
      },
    ),
  ];
}
