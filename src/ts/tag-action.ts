import { AsyncTask } from "./base/async-task";
import { PonEventHandler} from "./base/pon-event-handler";
import { Resource } from "./base/resource";
import { SoundBuffer } from "./base/sound";
import { Tag } from "./base/tag";
import { PonLayer } from "./layer/pon-layer";
import { Ponkan3 } from "./ponkan3";

export class TagValue {
  public readonly name: string;
  public readonly type: "number" | "boolean" | "string" | "array" | "object";
  public readonly required: boolean;
  public readonly defaultValue: any;

  public constructor(
    name: string,
    type: "number" | "boolean" | "string" | "array" | "object",
    required: boolean,
    defaultValue: any) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.defaultValue = defaultValue;
  }
}

export class TagAction {
  public readonly names: string[];
  public readonly group: string;
  public readonly comment: string;
  public readonly values: TagValue[];
  public readonly action: (values: any, tick: number) => "continue" | "break";

  public constructor(
    names: string[],
    group: string,
    comment: string,
    values: TagValue[],
    action: (val: any, tick: number) => "continue" | "break",
  ) {
    this.names = names;
    this.group = group;
    this.comment = comment;
    this.values = values;
    this.action = action;
  }
}

/**
 * エンティティを適用する
 */
export function applyJsEntity(resource: Resource, values: any): void {
  for (const key in values) {
    if (values.hasOwnProperty(key)) {
      const value: string = "" + values[key] as string;
      if (value.indexOf("&") === 0 && value.length >= 2) {
        const js: string = value.substring(1);
        values[key] = resource.evalJs(js);
      }
    }
  }
}

/**
 * タグの値を正しい値にキャストする。
 * tagの値をそのまま変更するため、事前にcloneしたものにしておくこと。
 * @param tag タグ
 * @param tagAction タグ動作定義
 */
export function castTagValues(tag: Tag, tagAction: TagAction) {
  tagAction.values.forEach((def: TagValue) => {
    const value: any = tag.values[def.name];
    if (value === undefined || value === null) { return; }
    if (typeof value !== def.type) {
      const str: string = "" + value;
      switch (def.type) {
        case "number":
          tag.values[def.name] = +str;
          if (isNaN(tag.values[def.name])) {
            throw new Error(`${tag.name}タグの${def.name}を数値に変換できませんでした(${str})`);
          }
          break;
        case "boolean":
          tag.values[def.name] = (str === "true");
          break;
        case "string":
          tag.values[def.name] = str;
          break;
        case "array":
          // Logger.debug(Array.isArray(value));
          // Logger.debug(typeof value);
          if (!Array.isArray(value)) {
            // Logger.debug(value);
            throw new Error(`${tag.name}タグの${def.name}は配列である必要があります`);
          }
          tag.values[def.name] = value;
          break;
        case "object":
          if (typeof value !== "object" || Array.isArray(value)) {
            // Logger.debug(value);
            throw new Error(`${tag.name}タグの${def.name}はオブジェクトである必要があります`);
          }
          tag.values[def.name] = value;
          break;
      }
    }
  });
}

export function generateTagActions(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // その他
    // ======================================================================
    /// @category その他
    /// @description レイヤーの数を変更する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["laycount"],
      "その他",
      "レイヤーの数を変更する",
      [
        /// @param レイヤー数
        new TagValue("count", "number", true, null),
      ],
      (values, tick) => {
        p.layerCount = values.count;
        return "continue";
      },
    ),
    /// @category その他
    /// @description エラーを発生させるかどうかの設定
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["raiseerror"],
      "その他",
      "エラーを発生させるかどうかの設定",
      [
        /// @param 存在しないタグを実行したときにエラーにする
        new TagValue("unknowntag", "boolean", false, null),
      ],
      (values, tick) => {
        if (values.unknowntag != null) { p.raiseError.unknowntag = values.unknowntag; }
        return "continue";
      },
    ),
    /// @category その他
    /// @description システム変数をクリア
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["clearsysvar"],
      "その他",
      "システム変数をクリア",
      [],
      (values, tick) => {
        p.resource.systemVar = {};
        return "continue";
      },
    ),
    /// @category その他
    /// @description ゲーム変数をクリア
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["cleargamevar"],
      "その他",
      "ゲーム変数をクリア",
      [],
      (values, tick) => {
        p.resource.gameVar = {};
        return "continue";
      },
    ),
    /// @category その他
    /// @description 一時変数をクリア
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["cleartmpvar"],
      "その他",
      "一時変数をクリア",
      [],
      (values, tick) => {
        p.resource.tmpVar = {};
        return "continue";
      },
    ),
    /// @category その他
    /// @description システム変数を保存する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["savesysvar"],
      "その他",
      "システム変数を保存する",
      [],
      (values, tick) => {
        p.saveSystemData();
        return "continue";
      },
    ),
    /// @category その他
    /// @description クリックスキップの設定
    /// @details
    ///   クリックスキップの有効無効を設定します。
    ///   （クリックスキップとは、テキスト表示途中にクリックすると行末・ページ末までスキップする機能のことです。）
    new TagAction(
      ["clickskipopt", "clickskip"],
      "その他",
      "クリックスキップの設定",
      [
        /// @param 有効ならtrue、無効ならfalseを指定
        new TagValue("enabled", "boolean", true, null),
      ],
      (values, tick) => {
        p.clickSkipEnabled = values.enabled;
        return "continue";
      },
    ),
    /// @category その他
    /// @description 画面揺れ効果の開始
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["quake"],
      "その他",
      "画面揺れ効果の開始",
      [
        /// @param 画面揺れの時間
        new TagValue("time", "number", true, null),
        /// @param 横方向の揺れの最大値
        new TagValue("x", "number", false, 20),
        /// @param 縦方向の揺れの最大値
        new TagValue("y", "number", false, 20),
      ],
      (values, tick) => {
        p.startQuake(tick, values.time, values.x, values.y);
        return "continue";
      },
    ),
    /// @category その他
    /// @description 画面揺れ効果の停止
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stopquake"],
      "その他",
      "画面揺れ効果の停止",
      [],
      (values, tick) => {
        p.stopQuake();
        return "continue";
      },
    ),
    /// @category その他
    /// @description 画面揺れ効果の終了待ち
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waitquake"],
      "その他",
      "画面揺れ効果の終了待ち",
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        if (!p.isQuaking) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.stopQuake();
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.stopQuake();
              p.conductor.start();
            }, "waitquake"));
          }
          p.conductor.addEventHandler(new PonEventHandler("quake", () => {
            p.conductor.start();
          }, "waitquake"));
          return p.conductor.stop();
        }
      },
    ),
    /// @category その他
    /// @description 右クリック時の動作を設定する
    /// @details
    ///   右クリックまたは ESC キーを押下時の動作を設定します。
    ///   jump と call の両方を false に設定した場合、デフォルトの動作（メッセージレイヤーを隠す）になります。
    ///   jump を true に設定した場合、file と label で指定した場所へジャンプします。
    ///   call を true に設定した場合、file と label で指定した場所でサブルーチンを呼び出します。
    new TagAction(
      ["rightclick", "rclick"],
      "その他",
      "右クリック時の動作を設定する",
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
      (values, tick) => {
        if (values.jump != null) { p.rightClickJump = values.jump; }
        if (values.call != null) { p.rightClickCall = values.call; }
        if (values.file != null) { p.rightClickFilePath = values.file; }
        if (values.label != null) { p.rightClickLabel = values.label; }
        if (values.enabled != null) { p.rightClickEnabled = values.enabled; }
        return "continue";
      },
    ),
    /// @category その他
    /// @description コマンドショートカットを設定する
    /// @details
    ///   コマンドショートカットを設定します。
    new TagAction(
      ["commandshortcut", "cmdsc"],
      "その他",
      "コマンドショートカットを設定する",
      [
        /// @param ショートカットの文字
        new TagValue("ch", "string", true, null),
        /// @param コマンドの名前
        new TagValue("command", "string", true, null),
      ],
      (values, tick) => {
        p.addCommandShortcut(values.ch, values.command);
        return "continue";
      },
    ),
    /// @category その他
    /// @description コマンドショートカットを削除する
    /// @details
    ///   コマンドショートカットを削除します。
    new TagAction(
      ["delcommandshortcut", "delcmdsc"],
      "その他",
      "コマンドショートカットを削除する",
      [
        /// @param ショートカットの文字
        new TagValue("ch", "string", true, null),
      ],
      (values, tick) => {
        p.delCommandShortcut(values.ch);
        return "continue";
      },
    ),
    // ======================================================================
    // スクリプト制御
    // ======================================================================
    /// @category スクリプト制御
    /// @description スクリプトの実行を停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["s"],
      "スクリプト制御",
      "スクリプトの実行を停止する",
      [],
      (values, tick) => {
        p.conductor.passLatestSaveMark();
        p.conductor.stop();
        p.stopSkip();
        return "break";
      },
    ),
    /// @category スクリプト制御
    /// @description スクリプトファイルを移動する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["jump"],
      "スクリプト制御",
      "スクリプトファイルを移動する",
      [
        /// @param 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する
        new TagValue("file", "string", false, null),
        /// @param 移動先のラベル名。省略時はファイルの先頭
        new TagValue("label", "string", false, null),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
      ],
      (values, tick) => {
        if (values.file == null && values.label == null) {
          return "continue";
        } else {
          p.conductor.jump(values.file, values.label, values.countpage).done(() => {
            p.conductor.start();
          });
          return p.conductor.stop();
        }
      },
    ),
    /// @category スクリプト制御
    /// @description サブルーチンを呼び出す
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["call"],
      "スクリプト制御",
      "サブルーチンを呼び出す",
      [
        /// @param 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する
        new TagValue("file", "string", false, null),
        /// @param 移動先のラベル名。省略時はファイルの先頭
        new TagValue("label", "string", false, null),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, false),
      ],
      (values, tick) => {
        if (values.file == null && values.label == null) {
          return "continue";
        } else {
          p.callSubroutine(values.file, values.label, values.countpage).done(() => {
            p.conductor.start();
          });
          return p.conductor.stop();
        }
      },
    ),
    /// @category スクリプト制御
    /// @description サブルーチンをから戻る
    /// @details
    ///   [call]タグで呼び出したサブルーチンから、呼び出し元に戻ります。
    ///   forcestart属性は、システムボタンを作成する際に指定します。
    ///   システムボタンで呼び出したサブルーチンで[skip]や[auto]を実行しても、通常はサブルーチンから戻るとスクリプトは停止してしまいます。
    ///   forcestart属性をtrueにした時は、呼び出し元へ戻ると同時に、[lb][pb]などで停止していたとしても、強制的に再開されます。
    ///   ただし[s]タグでスクリプトが完全に停止していた場合は停止したままです。
    new TagAction(
      ["return"],
      "スクリプト制御",
      "サブルーチンをから戻る",
      [
        /// @param 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する
        new TagValue("file", "string", false, null),
        /// @param 移動先のラベル名。省略時はファイルの先頭
        new TagValue("label", "string", false, null),
        /// @param 戻った後、強制的にシナリオを再開する
        new TagValue("forcestart", "boolean", false, false),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
      ],
      (values, tick) => {
        return p.returnSubroutine(values.forcestart, values.countpage);
      },
    ),
    /// @category スクリプト制御
    /// @description 条件によって分岐する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["if"],
      "スクリプト制御",
      "条件によって分岐する",
      [
        /// @param 条件式(JavaScript)
        new TagValue("exp", "string", true, null),
      ],
      (values, tick) => {
        p.conductor.script.ifJump(values.exp, p.tagActions);
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 条件によって分岐する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["elseif", "elsif"],
      "スクリプト制御",
      "条件によって分岐する",
      [],
      (values, tick) => {
        p.conductor.script.elsifJump();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 条件によって分岐する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["else"],
      "スクリプト制御",
      "条件によって分岐する",
      [],
      (values, tick) => {
        p.conductor.script.elseJump();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 条件分岐の終了
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["endif"],
      "スクリプト制御",
      "条件分岐の終了",
      [],
      (values, tick) => {
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 指定回数繰り返す
    /// @details
    ///   [for]と[endfor]の間を指定回数繰り返します。
    ///   indexvarで指定した名前の一時変数にループ回数が格納されます。
    ///   ループ回数は0から始まるため、、0 〜 loops-1 の値をとります。
    new TagAction(
      ["for"],
      "スクリプト制御",
      "指定回数繰り返す",
      [
        /// @param 繰り替えし回数
        new TagValue("loops", "number", true, null),
        /// @param ループ中のインデックスを格納する変数名
        new TagValue("indexvar", "string", false, "__index__"),
      ],
      (values, tick) => {
        p.conductor.script.startForLoop(values.loops, values.indexvar);
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description forループの終端
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["endfor"],
      "スクリプト制御",
      "forループの終端",
      [],
      (values, tick) => {
        p.conductor.script.endForLoop();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description forループから抜ける
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["breakfor"],
      "スクリプト制御",
      "forループから抜ける",
      [],
      (values, tick) => {
        p.conductor.script.breakForLoop();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description スキップを開始する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["startskip", "skip"],
      "スクリプト制御",
      "スキップを開始する",
      [],
      (values, tick) => {
        p.startSkipByTag();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description スキップを停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stopskip"],
      "スクリプト制御",
      "スキップを停止する",
      [],
      (values, tick) => {
        p.stopSkip();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description オートモードを開始する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["startautomode", "startauto", "auto"],
      "スクリプト制御",
      "オートモードを開始する",
      [],
      (values, tick) => {
        p.startAutoMode();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description オートモードを停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stopautomode", "stopauto"],
      "スクリプト制御",
      "オートモードを停止する",
      [],
      (values, tick) => {
        p.stopAutoMode();
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description オートモードの設定
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["automodeopt", "autoopt"],
      "スクリプト制御",
      "オートモードの設定",
      [
        /// @param オートモード状態表示に使用するレイヤー
        new TagValue("lay", "number", false, null),
        /// @param オートモードのインターバル時間(ms)
        new TagValue("time", "number", false, null),
      ],
      (values, tick) => {
        if (values.lay) { p.autoModeLayerNum = values.lay; }
        if (values.time) { p.autoModeInterval = values.time; }
        return "continue";
      },
    ),
    /// @category スクリプト制御
    /// @description 指定時間を待つ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["wait"],
      "スクリプト制御",
      "指定時間を待つ",
      [
        /// @param 停止時間(ms)
        new TagValue("time", "number", true, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        if (p.isSkipping && values.canskip) {
          return "continue";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.conductor.start();
              p.stopUntilClickSkip(); // 次のlb,pbまで飛ばされるのを防ぐ
            }, "wait"));
          }
          return p.conductor.sleep(tick, values.time, "wait");
        }
      },
    ),
    /// @category スクリプト制御
    /// @description クリック待ちで停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waitclick"],
      "スクリプト制御",
      "クリック待ちで停止する",
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        p.stopUntilClickSkip(); // クリック待ちまでのスキップを停止
        if (p.isSkipping && values.canskip) {
          // UNTIL_CLICK_WAITが終わってもなおスキップ中なら、クリック待ちはしない
          // ただし改行条件等を通常と揃えるために一度グリフを表示して、すぐに非表示にする
          return "continue";
        } else {
          p.conductor.addEventHandler(new PonEventHandler("click", () => {
            p.conductor.start();
          }, "waitclick"));
          if (p.autoModeFlag && values.canskip) {
            p.reserveAutoClick(tick); // オートモード時の自動クリックを予約
          }
          return p.conductor.stop();
        }
      },
    ),
    // ======================================================================
    // マクロ
    // ======================================================================
    /// @category マクロ
    /// @description マクロを定義する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["macro"],
      "マクロ",
      "マクロを定義する",
      [
        /// @param マクロの名前
        new TagValue("name", "string", true, null),
      ],
      (values, tick) => {
        if (p.resource.hasMacro(values.name)) {
          throw new Error(`${values.name}マクロはすでに登録されています`);
        }
        const m = p.conductor.script.defineMacro(values.name);
        p.resource.macroInfo[values.name] = m;
        return "continue";
      },
    ),
    /// @category マクロ
    /// @description マクロ定義の終わり
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["endmacro"],
      "マクロ",
      "マクロ定義の終わり",
      [],
      (values, tick) => {
        throw new Error("マクロ定義エラー。macroとendmacroの対応が取れていません");
        return "continue";
      },
    ),
    // ======================================================================
    // メッセージ関係
    // ======================================================================
    /// @category メッセージ操作
    /// @description テキストの設定
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["messageopt", "mesopt"],
      "メッセージ",
      "テキストの設定",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param フォント名の配列
        new TagValue("fontfamily", "array", false, null),
        /// @param フォントサイズ(px)
        new TagValue("fontsize", "number", false, null),
        /// @param フォントウェイト。"normal" | "bold"
        new TagValue("fontweight", "string", false, null),
        /// @param 文字色(0xRRGGBB)
        new TagValue("color", "number", false, null),
        /// @param テキスト描画のマージン　上
        new TagValue("margint", "number", false, null),
        /// @param テキスト描画のマージン　右
        new TagValue("marginr", "number", false, null),
        /// @param テキスト描画のマージン　下
        new TagValue("marginb", "number", false, null),
        /// @param テキスト描画のマージン　左
        new TagValue("marginl", "number", false, null),
        /// @param テキストの文字間(px)
        new TagValue("pitch", "number", false, null),
        /// @param テキストの行の高さ(px)
        new TagValue("lineheight", "number", false, null),
        /// @param テキストの行間(px)
        new TagValue("linepitch", "number", false, null),
        /// @param テキスト寄せの方向。"left" | "center" | "right"
        new TagValue("align", "string", false, null),
        /// @param 影の表示非表示
        new TagValue("shadow", "boolean", false, null),
        /// @param 影のAlpha(0.0〜1.0)
        new TagValue("shadowalpha", "number", false, null),
        /// @param 影の角度(ラジアン)
        new TagValue("shadowangle", "number", false, null),
        /// @param 影のBlur
        new TagValue("shadowblur", "number", false, null),
        /// @param 影の色(0xRRGGBB)
        new TagValue("shadowcolor ", "number", false, null),
        /// @param 影の距離(px)
        new TagValue("shadowdistance", "number", false, null),
        /// @param 縁取りの太さ(px)。0で非表示になる
        new TagValue("edgewidth", "number", false, null),
        /// @param 縁取りの色(0xRRGGBB)
        new TagValue("edgecolor", "number", false, null),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer: PonLayer) => {
          if (values.fontfamily != null) { layer.textFontFamily = values.fontfamily; }
          if (values.fontsize != null) { layer.textFontSize = values.fontsize; }
          if (values.fontweight != null) { layer.textFontWeight = values.fontweight; }
          if (values.color != null) { layer.textColor = values.color; }
          if (values.margint != null) { layer.textMarginTop = values.margint; }
          if (values.marginr != null) { layer.textMarginRight = values.marginr; }
          if (values.marginb != null) { layer.textMarginBottom = values.marginb; }
          if (values.marginl != null) { layer.textMarginLeft = values.marginl; }
          if (values.pitch != null) { layer.textPitch = values.pitch; }
          if (values.lineheight != null) { layer.textLineHeight = values.lineheight; }
          if (values.linepitch != null) { layer.textLinePitch = values.linepitch; }
          if (values.align != null) { layer.textAlign = values.align; }
          if (values.shadow != null) { layer.textShadowVisible = values.shadow; }
          if (values.shadowalpha != null) { layer.textShadowAlpha = values.shadowalpha; }
          if (values.shadowangle != null) { layer.textShadowAngle = values.shadowangle; }
          if (values.shadowblur != null) { layer.textShadowBlur = values.shadowblur; }
          if (values.shadowcolor != null) { layer.textShadowColor = values.shadowcolor; }
          if (values.shadowdistance != null) { layer.textShadowDistance = values.shadowdistance ; }
          if (values.edgewidth != null) { layer.textEdgeWidth = values.edgewidth; }
          if (values.edgecolor != null) { layer.textEdgeColor = values.edgecolor; }
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字を出力する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["ch"],
      "メッセージ",
      "文字を出力する",
      [
        /// @param 出力する先のレイヤ
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 出力する文字
        new TagValue("text", "string", true, null),
      ],
      (values, tick) => {
        p.hideBreakGlyph();
        p.getLayers(values).forEach((layer) => {
          layer.addChar(values.text);
        });
        if (values.page === "fore" && p.addCharWithBackFlag) {
          values.page = "back";
          p.getLayers(values).forEach((layer) => {
            layer.addChar(values.text);
          });
        }
        if (p.isSkipping || p.textSpeed === 0) {
          return "continue";
        } else {
          return p.conductor.sleep(tick, p.textSpeed, "ch");
        }
      },
    ),
    /// @category メッセージ操作
    /// @description 改行する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["br"],
      "メッセージ操作",
      "改行する",
      [
        /// @param 出力する文字
        new TagValue("lay", "string", false, "message"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addTextReturn();
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description テキストをクリアする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["clear", "c"],
      "メッセージ操作",
      "テキストをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.clearText();
        });
        p.hideBreakGlyph();
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字出力のインターバルを設定
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["textspeed"],
      "メッセージ操作",
      "文字出力のインターバルを設定",
      [
        /// @param インターバルのモード。"user" | "system"
        new TagValue("mode", "string", false, null),
        /// @param 未読文章のインターバル時間(ms)
        new TagValue("unread", "number", false, null),
        /// @param 既読文章のインターバル時間(ms)
        new TagValue("read", "number", false, null),
      ],
      (values, tick) => {
        if (values.move != null) { p.textSpeedMode = values.mode; }
        if (values.unread != null) { p.unreadTextSpeed = values.unread; }
        if (values.read != null) { p.readTextSpeed = values.read; }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 一時的に文字出力インターバルを0にする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["nowait"],
      "メッセージ操作",
      "一時的に文字出力インターバルを0にする",
      [],
      (values, tick) => {
        p.nowaitModeFlag = true;
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description nowaitを終了する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["endnowait"],
      "メッセージ操作",
      "nowaitを終了する",
      [],
      (values, tick) => {
        p.nowaitModeFlag = false;
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字表示位置を指定する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["textlocate", "locate"],
      "メッセージ操作",
      "文字表示位置を指定する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param x座標
        new TagValue("x", "number", false, null),
        /// @param x座標
        new TagValue("y", "number", false, null),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.setCharLocate(values.x, values.y);
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description インデント位置を設定する
    /// @details
    ///   現在の文字描画位置でインデントするように設定します。
    ///   インデント位置は [endindent] または [clear] でクリアされます。
    new TagAction(
      ["indent"],
      "メッセージ操作",
      "インデント位置を設定する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param メッセージ履歴もインデントするかどうか
        new TagValue("history", "boolean", false, true),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.setIndentPoint();
        });
        if (values.history) {
          p.historyLayer.setHistoryIndentPoint();
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description インデント位置をクリアする
    /// @details
    ///   [indent] で設定したインデント位置をクリアします。
    new TagAction(
      ["endindent"],
      "メッセージ操作",
      "インデント位置をクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param メッセージ履歴もインデント解除するか
        new TagValue("history", "boolean", false, true),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.clearIndentPoint();
        });
        if (values.history) {
          p.historyLayer.clearIndentPoint();
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 行末クリック待ちで停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["linebreak", "lb", "l"],
      "メッセージ操作",
      "行末クリック待ちで停止する",
      [],
      (values, tick) => {
        p.stopUntilClickSkip(); // クリック待ちまでのスキップを停止
        if (p.isSkipping) {
          // UNTIL_CLICK_WAITが終わってもなおスキップ中なら、クリック待ちはしない
          // ただし改行条件等を通常と揃えるために一度グリフを表示して、すぐに非表示にする
          p.showLineBreakGlyph(tick);
          p.hideBreakGlyph();
          return "break"; // クリック待ちはしないが、一回描画する
        } else {
          // クリック待ちへ移行
          p.showLineBreakGlyph(tick);
          p.conductor.addEventHandler(new PonEventHandler("click", () => {
            p.conductor.start();
            p.hideBreakGlyph();
          }, "lb"));
          p.reserveAutoClick(tick); // オートモード時の自動クリックを予約
          return p.conductor.stop();
        }
      },
    ),
    /// @category メッセージ操作
    /// @description 行末クリック待ちで停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["pagebreak", "pb", "p"],
      "メッセージ操作",
      "行末クリック待ちで停止する",
      [],
      (values, tick) => {
        p.stopUntilClickSkip(); // クリック待ちまでのスキップを停止
        p.historyTextReturn();
        if (p.isSkipping) {
          // UNTIL_CLICK_WAITが終わってもなおスキップ中なら、クリック待ちはしない
          // ただし改行条件等を通常と揃えるために一度グリフを表示して、すぐに非表示にする
          p.showPageBreakGlyph(tick);
          p.hideBreakGlyph();
          return "break"; // クリック待ちはしないが、一回描画する
        } else {
          p.showPageBreakGlyph(tick);
          p.conductor.addEventHandler(new PonEventHandler("click", () => {
            p.conductor.start();
            p.hideBreakGlyph();
          }, "pb"));
          p.reserveAutoClick(tick); // オートモード時の自動クリックを予約
          return p.conductor.stop();
        }
      },
    ),
    /// @category メッセージ操作
    /// @description メッセージレイヤを一時的に隠す
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["hidemessages"],
      "メッセージ操作",
      "メッセージレイヤを一時的に隠す",
      [],
      (values, tick) => {
        p.hideMessages();
        p.conductor.addEventHandler(new PonEventHandler("click", () => {
          p.conductor.start();
          p.showMessages();
        }, "hidemessages"));
        return p.conductor.stop();
      },
    ),
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
      "レイヤー操作",
      "レイヤー名エイリアスを作成する",
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
      ],
      (values, tick) => {
        p.layerAlias[values.name] = values.lay;
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤー名エイリアスを削除する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["dellayalias"],
      "レイヤー操作",
      "レイヤー名エイリアスを削除する",
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
      ],
      (values, tick) => {
        delete p.layerAlias[values.name];
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description メッセージレイヤーを指定する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["messagelayer", "messagelay", "meslay", "meslay"],
      "レイヤー操作",
      "メッセージレイヤーを指定する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "number", true, null),
      ],
      (values, tick) => {
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
    ///   TODO タグの説明文
    new TagAction(
      ["linebreakglyph", "lbglyph"],
      "レイヤー操作",
      "行末グリフに関して設定する",
      [
        /// @param グリフとして使用するレイヤー
        new TagValue("lay", "number", false, null),
        /// @param グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。
        ///        "eol"を指定すると文章の末尾に表示。
        ///        "relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
        ///        "absolute"を指定すると画面上の絶対位置で固定表示。
        new TagValue("pos", "string", false, null),
        /// @param グリフの表示位置（メッセージレイヤーからの相対位置）
        new TagValue("x", "number", false, null),
        /// @param グリフの表示位置（メッセージレイヤーからの相対位置）
        new TagValue("y", "number", false, null),
      ],
      (values, tick) => {
        if (values.lay != null) { p.lineBreakGlyphLayerNum = values.lay; }
        if (values.pos != null) { p.lineBreakGlyphPos = values.pos; }
        if (values.x != null) { p.lineBreakGlyphX = values.x; }
        if (values.y != null) { p.lineBreakGlyphY = values.y; }
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description ページ末グリフに関して設定する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["pagebreakglyph", "pbglyph"],
      "レイヤー操作",
      "ページ末グリフに関して設定する",
      [
        /// @param グリフとして使用するレイヤー
        new TagValue("lay", "number", false, null),
        /// @param グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。
        ///        "eol"を指定すると文章の末尾に表示。
        ///        "relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
        ///        "absolute"を指定すると画面上の絶対位置で固定表示。
        new TagValue("pos", "string", false, null),
        /// @param グリフの表示位置（メッセージレイヤーからの相対位置）
        new TagValue("x", "number", false, null),
        /// @param グリフの表示位置（メッセージレイヤーからの相対位置）
        new TagValue("y", "number", false, null),
      ],
      (values, tick) => {
        if (values.lay != null) { p.pageBreakGlyphLayerNum = values.lay; }
        if (values.pos != null) { p.pageBreakGlyphPos = values.pos; }
        if (values.x != null) { p.pageBreakGlyphX = values.x; }
        if (values.y != null) { p.pageBreakGlyphY = values.y; }
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーを塗りつぶす
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["fillcolor", "fill"],
      "レイヤー操作",
      "レイヤーを塗りつぶす",
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
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.setBackgroundColor(values.color, values.alpha);
        });
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤー塗りつぶしをクリアする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["clearcolor"],
      "レイヤー操作",
      "レイヤー塗りつぶしをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.clearBackgroundColor();
        });
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーの設定
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["layopt"],
      "レイヤー操作",
      "レイヤーの設定",
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
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          if (values.visible != null) { layer.visible = values.visible; }
          if (values.x != null) { layer.x = values.x; }
          if (values.y != null) { layer.y = values.y; }
          if (values.scalex != null) { layer.scaleX = values.scalex; }
          if (values.scaley != null) { layer.scaleY = values.scaley; }
          if (values.width != null) { layer.width = values.width; }
          if (values.height != null) { layer.height = values.height; }
          if (values.alpha != null) { layer.alpha = values.alpha; }
          if (values.autohide != null) { layer.autoHideWithMessage = values.autohide; }
          if (values.blocklclick != null) { layer.blockLeftClickFlag = values.blocklclick; }
          if (values.blockrclick != null) { layer.blockRightClickFlag = values.blockrclick; }
          if (values.blockcclick != null) { layer.blockCenterClickFlag = values.blockcclick; }
          if (values.blockmove != null) { layer.blockMouseMove = values.blockmove; }
          if (values.blockwheel != null) { layer.blockWheelFlag = values.blockwheel; }
        });
        return "continue";
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーに画像を読み込む
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["loadimage", "image"],
      "レイヤー操作",
      "レイヤーに画像を読み込む",
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
      (values, tick) => {
        const task: AsyncTask = new AsyncTask();
        p.getLayers(values).forEach((layer) => {
          task.add(() => {
            if (values.x != null) { layer.x = values.x; }
            if (values.y != null) { layer.y = values.y; }
            if (values.visible != null) { layer.visible = values.visible; }
            if (values.alpha != null) { layer.alpha = values.alpha; }
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
    /// @category レイヤー操作
    /// @description レイヤーに追加で画像を読み込む
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["loadchildimage", "childimage", ""],
      "レイヤー操作",
      "レイヤーに追加で画像を読み込む",
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
      (values, tick) => {
        const task: AsyncTask = new AsyncTask();
        p.getLayers(values).forEach((layer) => {
          task.add(() => {
            return layer.loadChildImage(values.file, values.x, values.y, values.alpha);
          });
        });
        task.run().done(() => {
          p.conductor.start();
        }).fail(() => {
          p.error(new Error("追加の画像読み込みに失敗しました。"));
        });
        return p.conductor.stop();
      },
    ),
    /// @category レイヤー操作
    /// @description レイヤーの画像を開放する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["freeimage", "free", "unloadimage"],
      "レイヤー操作",
      "レイヤーの画像を開放する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.freeImage();
          layer.freeChildImages();
        });
        return "continue";
      },
    ),
    // ======================================================================
    // ボタン関係
    // ======================================================================
    /// @category ボタン
    /// @description レイヤーにテキストボタンを配置する
    /// @details
    ///   指定のレイヤーに、テキストと背景色を用いたボタンを配置します。
    ///   配置直後はボタンはロックされた状態となり、押下することはできません。
    ///   [unlockbuttons]タグでロック状態を解除することで、押下できるようになります。
    new TagAction(
      ["textbutton", "txtbtn"],
      "ボタン",
      "レイヤーにテキストボタンを配置する",
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
        /// @param ボタン押下時に実行するJavaScript
        new TagValue("exp", "string", false, null),
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
        /// @param 背景色の配列(0xRRGGBB)。通常時、マウスオーバー時、マウス押下時の順
        new TagValue("bgcolors", "array", true, null),
        /// @param 背景色のAlphaの配列(0.0〜1.0)。通常時、マウスオーバー時、マウス押下時の順
        new TagValue("bgalphas", "array", false, [1, 1, 1]),
        /// @param システム用ボタンとする場合はtrue
        new TagValue("system", "boolean", false, false),
        /// @param テキスト描画のマージン　上
        new TagValue("margint", "number", false, 0),
        /// @param テキスト描画のマージン　右
        new TagValue("marginr", "number", false, 0),
        /// @param テキスト描画のマージン　下
        new TagValue("marginb", "number", false, 0),
        /// @param テキスト描画のマージン　左
        new TagValue("marginl", "number", false, 0),
        /// @param テキスト描画のマージン　左
        new TagValue("marginl", "number", false, 0),
        /// @param テキスト寄せの方向。"left" | "center" | "right"
        new TagValue("align", "string", false, "center"),
        /// @param 現在の位置を既読にするかどうか
        new TagValue("countpage", "boolean", false, true),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addTextButton(
            values.jump,
            values.call,
            values.file,
            values.label,
            values.countpage,
            values.exp,
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
          );
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description すべてのボタンをクリアする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["clearbuttons", "clearbutton", "clearbtn"],
      "ボタン",
      "すべてのボタンをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
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
    ///   TODO タグの説明文
    new TagAction(
      ["cleartextbuttons", "cleartextbutton", "cleartxtbtn"],
      "ボタン",
      "テキストボタンをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.clearTextButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description レイヤーに画像ボタンを配置する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["imagebutton", "imgbtn"],
      "ボタン",
      "レイヤーに画像ボタンを配置する",
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
        /// @param ボタン押下時に実行するJavaScript
        new TagValue("exp", "string", false, null),
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
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addImageButton(
            values.jump,
            values.call,
            values.file,
            values.label,
            values.countpage,
            values.exp,
            values.imagefile,
            values.x,
            values.y,
            values.direction,
            values.system,
          ).done(() => {
            p.conductor.start();
          });
        });
        return p.conductor.stop();
      },
    ),
    /// @category ボタン
    /// @description 画像ボタンをクリアする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["clearimagebuttons", "clearimagebutton", "clearimgbtn"],
      "ボタン",
      "画像ボタンをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.clearImageButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description レイヤーにトグルボタンを配置する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["togglebutton", "tglbtn"],
      "ボタン",
      "レイヤーにトグルボタンを配置する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param ボタン押下時に実行するJavaScript
        new TagValue("exp", "string", false, null),
        /// @param ボタンにする画像ファイル
        new TagValue("imagefile", "string", true, null),
        /// @param x座標(px)
        new TagValue("x", "number", false, 0),
        /// @param y座標(px)
        new TagValue("y", "number", false, 0),
        /// @param 選択状態を格納する一時変数の名前
        new TagValue("statevar", "string", true, null),
        /// @param ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び"
        new TagValue("direction", "string", false, "horizontal"),
        /// @param システム用ボタンとする場合はtrue
        new TagValue("system", "boolean", false, false),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addToggleButton(
            values.imagefile,
            values.x,
            values.y,
            values.statevar,
            values.system,
            values.exp,
            values.direction,
          ).done(() => {
            p.conductor.start();
          });
        });
        return p.conductor.stop();
      },
    ),
    /// @category ボタン
    /// @description トグルボタンをクリアする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["cleartogglebuttons", "cleartogglebutton", "cleartglbtn"],
      "ボタン",
      "トグルボタンをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.clearToggleButtons();
        });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description ボタンをロックする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["lockbuttons", "lockbutton",  "lock"],
      "ボタン",
      "ボタンをロックする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.lockButtons();
        });
        // p.foreLayers.forEach((layer) => layer.lockButtons());
        // p.backLayers.forEach((layer) => layer.lockButtons());
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description ボタンをアンロックする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["unlockbuttons", "unlockbutton", "unlock"],
      "ボタン",
      "ボタンをアンロックする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.unlockButtons();
        });
        // p.foreLayers.forEach((layer) => layer.unlockButtons());
        // p.backLayers.forEach((layer) => layer.unlockButtons());
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description システムボタンをロックする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["locksystembuttons", "locksystembutton", "locksystem"],
      "ボタン",
      "システムボタンをロックする",
      [],
      (values, tick) => {
        p.foreLayers.forEach((layer) => layer.lockSystemButtons());
        p.backLayers.forEach((layer) => layer.lockSystemButtons());
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description システムボタンをアンロックする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["unlocksystembuttons", "unlocksystembutton", "unlocksystem"],
      "ボタン",
      "システムボタンをアンロックする",
      [],
      (values, tick) => {
        p.foreLayers.forEach((layer) => layer.unlockSystemButtons());
        p.backLayers.forEach((layer) => layer.unlockSystemButtons());
        return "continue";
      },
    ),
    // ======================================================================
    // アニメーション関係
    // ======================================================================
    /// @category アニメーション
    /// @description フレームアニメーションを設定する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["frameanim", "fanim"],
      "アニメーション",
      "フレームアニメーションを設定する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param アニメーションをループさせるかどうか
        new TagValue("loop", "boolean", false, false),
        /// @param 1フレームの時間
        new TagValue("time", "number", true, null),
        /// @param 1フレームの幅
        new TagValue("width", "number", true, null),
        /// @param 1フレームの高さ
        new TagValue("height", "number", true, null),
        /// @param フレーム指定
        new TagValue("frames", "array", true, null),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.initFrameAnim(values.loop, values.time, values.width, values.height, values.frames);
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description フレームアニメーションを開始する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["startframeanim", "startfanim"],
      "アニメーション",
      "フレームアニメーションを開始する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.startFrameAnim(tick);
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description フレームアニメーションを停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stopframeanim", "stopfanim"],
      "アニメーション",
      "フレームアニメーションを停止する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.deleteFrameAnim();
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description フレームアニメーションの終了を待つ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waitframeanim", "waitfanim"],
      "アニメーション",
      "フレームアニメーションの終了を待つ",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        const layers = p.getLayers(values).filter((l) => l.frameAnimRunning && !l.frameAnimLoop);
        if (layers.length === 0) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitFrameAnimClickCallback(layers);
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.waitFrameAnimClickCallback(layers);
            }, "waitframeanim"));
          }
          p.conductor.addEventHandler(new PonEventHandler("frameanim", () => {
            p.waitFrameAnimCompleteCallback(layers);
          }, "waitframeanim"));
          return p.conductor.stop();
        }
      },
    ),
    /// @category アニメーション
    /// @description 自動移動を開始する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["startmove", "move"],
      "アニメーション",
      "自動移動を開始する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 自動移動させる時間
        new TagValue("time", "number", true, null),
        /// @param 開始までの遅延時間(ms)
        new TagValue("delay", "number", false, 0),
        /// @param 自動移動させる位置を指定
        new TagValue("path", "array", true, null),
        /// @param 自動移動のタイプ。"linear" | "bezier2" | "bezier3" | "catmullrom"
        new TagValue("type", "string", false, "linear"),
        /// @param 自動移動の入り・抜きの指定。"none" | "in" | "out" | "both" 
        new TagValue("ease", "string", false, "none"),
        /// @param 自動移動をループさせるかどうか。タイプが "linear" か "catmullrom" の場合のみ有効
        new TagValue("loop", "boolean", false, null),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.startMove(tick, values.time, values.delay, values.path, values.type, values.ease, values.loop);
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description 自動移動を停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stopmove"],
      "アニメーション",
      "自動移動を停止する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.stopMove();
        });
        return "continue";
      },
    ),
    /// @category アニメーション
    /// @description 自動移動の終了を待つ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waitmove", "wm"],
      "アニメーション",
      "自動移動の終了を待つ",
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        if (!p.hasMovingLayer) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitMoveClickCallback();
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.waitMoveClickCallback();
            }, "waitmove"));
          }
          p.conductor.addEventHandler(new PonEventHandler("move", () => {
            p.waitMoveCompleteCallback();
          }, "waitmove"));
          return p.conductor.stop();
        }
      },
    ),
    // ======================================================================
    // レイヤーフィルタ関係
    // ======================================================================
    /// @category レイヤーフィルタ
    /// @description ぼかしフィルタ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["blur"],
      "レイヤーフィルタ",
      "ぼかしフィルタ",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param x軸方向のぼかし
        new TagValue("blurx", "number", false, 4),
        /// @param y軸方向のぼかし
        new TagValue("blury", "number", false, 4),
        /// @param ぼかしの品質
        new TagValue("quality", "number", false, 4),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addFilter("blur", {
            blurX: values.blurx,
            blurY: values.blury,
            quality: values.quality,
          });
        });
        return "continue";
      },
    ),

    // ======================================================================
    // サウンド関係
    // ======================================================================
    /// @category サウンド
    /// @description バッファ番号エイリアスを作成する
    /// @details
    ///   バッファのエイリアス（別名）を作成します。
    ///   エイリアスを作成すると、バッファ番号を指定するコマンドでバッファ番号のかわりにエイリアス名を使用することができるようになります。
    ///   たとえば以下のように、効果音を再生するバッファに se というようなエイリアスを作成することで、
    ///   スクリプト作成時の可読性が向上します。
    ///   ```
    ///   # 背景画像はレイヤー 0 に作成するので、エイリアスを作成する
    ///   ;bufalias name: "se", buf: "0"
    ///   # 以後、効果音は以下のように読み込める
    ///   ;loadsound "buf": "se", "file": "sound/pekowave1.wav"
    ///   ```
    new TagAction(
      ["bufalias"],
      "サウンド",
      "バッファ番号エイリアスを作成する",
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
        /// @param 対象レイヤー
        new TagValue("buf", "string", true, null),
      ],
      (values, tick) => {
        p.soundBufferAlias[values.name] = values.buf;
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description バッファ番号エイリアスを削除する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["delbufalias"],
      "サウンド",
      "バッファ番号エイリアスを削除する",
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
      ],
      (values, tick) => {
        delete p.soundBufferAlias[values.name];
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をロードする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["loadsound", "sound"],
      "サウンド",
      "音声をロードする",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param 読み込む音声ファイルパス
        new TagValue("file", "string", true, null),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).loadSound(values.file).done((sb) => {
          p.conductor.start();
        }).fail(() => {
          throw new Error(`音声のロードに失敗しました(${values.file})`);
        });
        return p.conductor.stop();
      },
    ),
    /// @category サウンド
    /// @description 音声を開放する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["freesound", "unloadsound"],
      "サウンド",
      "音声を開放する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).freeSound();
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声の設定
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["soundopt"],
      "サウンド",
      "音声の設定",
      [
        /// @param バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param 音量(0.0〜1.0)
        new TagValue("volume", "number", false, null),
        /// @param グローバル音量(0.0〜1.0)
        new TagValue("gvolume", "number", false, null),
        /// @param シーク位置(ms)
        new TagValue("seek", "number", false, null),
        /// @param ループ再生するかどうか
        new TagValue("loop", "boolean", false, null),
      ],
      (values, tick) => {
        const sb: SoundBuffer = p.getSoundBuffer(values.buf);
        if (values.volume != null) { sb.volume = values.volume; }
        if (values.gvolume != null) { sb.gvolume = values.gvolume; }
        if (values.seek != null) { sb.seek = values.seek; }
        if (values.loop != null) { sb.loop = values.loop; }
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声を再生する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["playsound"],
      "サウンド",
      "音声を再生する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).play();
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声を停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stopsound"],
      "サウンド",
      "音声を停止する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).stop();
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["fadesound"],
      "サウンド",
      "音声をフェードする",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード後の音量(0.0〜1.0)
        new TagValue("volume", "number", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
        /// @param フェード終了後に再生停止するか
        new TagValue("autostop", "boolean", false, false),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).fade(values.volume, values.time, values.autostop);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードアウトして再生停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["fadeoutsound", "fadeout"],
      "サウンド",
      "音声をフェードアウトして再生停止する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
        /// @param フェード終了後に再生停止するか
        new TagValue("autostop", "boolean", false, false),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).fadeout(values.time, values.autostop);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードインで再生開始する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["fadeinsound", "fadein"],
      "サウンド",
      "音声をフェードインで再生開始する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード後の音量(0.0〜1.0)
        new TagValue("volume", "number", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).fadein(values.volume, values.time);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声の再生終了を待つ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waitsoundstop", "waitsound"],
      "サウンド",
      "音声の再生終了を待つ",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        const s: SoundBuffer = p.getSoundBuffer(values.buf);
        if (!s.playing || s.loop) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitSoundStopClickCallback(s);
          return "continue";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.waitSoundStopClickCallback(s);
            }, "waitsoundstop"));
          }
          p.conductor.addEventHandler(new PonEventHandler("soundstop", () => {
            p.waitSoundCompleteCallback(s);
          }, "waitsoundstop"));
          return p.conductor.stop();
        }
      },
    ),
    /// @category サウンド
    /// @description 音声のフェード終了を待つ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waitsoundfade", "waitfade"],
      "サウンド",
      "音声のフェード終了を待つ",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        const s: SoundBuffer = p.getSoundBuffer(values.buf);
        if (!s.fading) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitSoundFadeClickCallback(s);
          return "continue";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.waitSoundFadeClickCallback(s);
            }, "waitsoundfade"));
          }
          p.conductor.addEventHandler(new PonEventHandler("soundfade", () => {
            p.waitSoundFadeCompleteCallback(s);
          }, "waitsoundfade"));
          return p.conductor.stop();
        }
      },
    ),
    /// @category サウンド
    /// @description 音声のフェードを終了する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["endfadesound", "endfade"],
      "サウンド",
      "音声のフェードを終了する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).endFade();
        return "continue";
      },
    ),
    // ======================================================================
    // トランジション
    // ======================================================================
    /// @category トランジション
    /// @description 表レイヤを裏レイヤにコピーする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["backlay"],
      "トランジション",
      "表レイヤを裏レイヤにコピーする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
      ],
      (values, tick) => {
        p.backlay(values.lay);
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description レイヤ情報をコピーする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["copylay"],
      "トランジション",
      "レイヤ情報をコピーする",
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
      (values, tick) => {
        p.copylay(values.srclay, values.destlay, values.srcpage, values.destpage);
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description 操作対象ページを変更する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["currentpage"],
      "トランジション",
      "操作対象ページを変更する",
      [
        /// @param 操作対象ページを指定
        new TagValue("page", "string", true, null),
      ],
      (values, tick) => {
        p.currentPage = values.page;
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description トランジションの前準備
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["preparetrans", "pretrans"],
      "トランジション",
      "トランジションの前準備",
      [],
      (values, tick) => {
        p.backlay("all");
        p.currentPage = "back";
        return "continue";
      },
    ),
    /// @category トランジション
    /// @description トランジションを実行する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["trans"],
      "トランジション",
      "トランジションを実行する",
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
      (values, tick) => {
        if (values.time <= 0) {
          p.flip();
          p.onCompleteTrans();
          return "break";
        } else {
          if (values.method === "univ") {
            p.transManager.initUnivTrans(values.time, values.rule, values.vague).done(() => {
              p.transManager.start();
              p.conductor.start();
            });
            return p.conductor.stop();
          } else {
            p.transManager.initTrans(values.time, values.method).done(() => {
              p.transManager.start();
              p.conductor.start();
            });
            return p.conductor.stop();
          }
        }
      },
    ),
    /// @category トランジション
    /// @description トランジションを停止する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["stoptrans"],
      "トランジション",
      "トランジションを停止する",
      [],
      (values, tick) => {
        if (!p.transManager.isRunning) {
          return "continue";
        } else {
          p.transManager.stop();
          return "break";
        }
      },
    ),
    /// @category トランジション
    /// @description トランジションの終了を待つ
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["waittrans", "wt"],
      "トランジション",
      "トランジションの終了を待つ",
      [
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values, tick) => {
        if (!p.transManager.isRunning) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitTransClickCallback();
          return "break";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(new PonEventHandler("click", () => {
              p.waitTransClickCallback();
            }, "waittrans"));
          }
          p.conductor.addEventHandler(new PonEventHandler("trans", () => {
            p.waitTransCompleteCallback();
          }, "waittrans"));
          return p.conductor.stop();
        }
      },
    ),
    // ======================================================================
    // メッセージ履歴関係
    // ======================================================================
    /// @category メッセージ履歴
    /// @description メッセージ履歴を設定する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["historyopt"],
      "メッセージ履歴",
      "メッセージ履歴を設定する",
      [
        /// @param メッセージレイヤに文字を出力するかどうか
        new TagValue("output", "boolean", false, null),
        /// @param メッセージレイヤを表示できるかどうか
        new TagValue("enabled", "boolean", false, null),
      ],
      (values, tick) => {
        if (values.output != null) { p.historyLayer.outputFlag = values.output; }
        if (values.enabled != null) { p.enabledHistory = values.enabled; }
        return "continue";
      },
    ),
    /// @category メッセージ履歴
    /// @description メッセージ履歴を表示する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["showhistory", "history"],
      "メッセージ履歴",
      "メッセージ履歴を表示する",
      [],
      (values, tick) => {
        p.showHistoryLayer();
        return "continue";
      },
    ),
    /// @category メッセージ履歴
    /// @description メッセージ履歴にテキストを出力する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["historych", "hch"],
      "メッセージ履歴",
      "メッセージ履歴にテキストを出力する",
      [
        /// @param 出力する文字
        new TagValue("text", "string", true, null),
      ],
      (values, tick) => {
        p.addTextToHistory(values.text);
        return "continue";
      },
    ),
    /// @category メッセージ履歴
    /// @description メッセージ履歴を改行する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["hbr"],
      "メッセージ履歴",
      "メッセージ履歴を改行する",
      [],
      (values, tick) => {
        p.historyTextReturn();
        return "continue";
      },
    ),
    // ======================================================================
    // セーブ＆ロード関係
    // ======================================================================
    /// @category セーブ／ロード
    /// @description 最新状態をセーブする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["save"],
      "セーブ／ロード",
      "最新状態をセーブする",
      [
        /// @param セーブ番号
        new TagValue("num", "number", true, null),
      ],
      (values, tick) => {
        p.save(tick, values.num);
        return "continue";
      },
    ),
    /// @category セーブ／ロード
    /// @description セーブデータから復元する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["load"],
      "セーブ／ロード",
      "セーブデータから復元する",
      [
        /// @param セーブ番号
        new TagValue("num", "number", true, null),
      ],
      (values, tick) => {
        p.load(tick, values.num).done(() => {
          p.conductor.start();
        }).fail(() => {
          p.error(new Error(`セーブデータのロードに失敗しました(${values.num})`));
        });
        return p.conductor.stop();
      },
    ),
    /// @category セーブ／ロード
    /// @description 一時セーブする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["tempsave"],
      "セーブ／ロード",
      "一時セーブする",
      [
        /// @param セーブ番号
        new TagValue("num", "number", true, null),
      ],
      (values, tick) => {
        p.tempSave(tick, values.num);
        return "continue";
      },
    ),
    /// @category セーブ／ロード
    /// @description 一時セーブデータから復元する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["tempload"],
      "セーブ／ロード",
      "一時セーブデータから復元する",
      [
        /// @param セーブ番号
        new TagValue("num", "number", true, null),
        /// @param 音声もロードするかどうか
        new TagValue("sound", "boolean", false, false),
        /// @param 表レイヤーを裏レイヤーとして復元するかどうか
        new TagValue("toback", "boolean", false, false),
      ],
      (values, tick) => {
        p.tempLoad(tick, values.num, values.sound, values.toback).done(() => {
          p.conductor.start();
        }).fail(() => {
          p.error(new Error(`セーブデータのロードに失敗しました(${values.num})`));
        });
        return p.conductor.stop();
      },
    ),
    /// @category セーブ／ロード
    /// @description 現在の画面でスクリーンショットを固定する
    /// @details
    ///   現在の画面の状態でスクリーンショットを取ります。
    ///   取得されたスクリーンショットは [save] で保存されます。
    new TagAction(
      ["lockscreenshot"],
      "セーブ／ロード",
      "現在の画面でスクリーンショットを固定する",
      [],
      (values, tick) => {
        p.lockScreenShot();
        return "continue";
      },
    ),
    /// @category セーブ／ロード
    /// @description スクリーンショットの固定を解除する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["unlockscreenshot"],
      "セーブ／ロード",
      "スクリーンショットの固定を解除する",
      [],
      (values, tick) => {
        p.unlockScreenShot();
        return "continue";
      },
    ),
    /// @category セーブ／ロード
    /// @description セーブデータをコピーする
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["copysavedata", "copysave"],
      "セーブ／ロード",
      "セーブデータをコピーする",
      [
        /// @param コピー元のセーブ番号
        new TagValue("srcnum", "number", true, null),
        /// @param コピー先のセーブ番号
        new TagValue("destnum", "number", true, null),
      ],
      (values, tick) => {
        p.copySaveData(values.srcnum, values.destnum);
        return "continue";
      },
    ),
    /// @category セーブ／ロード
    /// @description セーブデータを削除する
    /// @details
    ///   TODO タグの説明文
    new TagAction(
      ["deletesavedata", "delsavedata", "delsave"],
      "セーブ／ロード",
      "セーブデータを削除する",
      [
        /// @param セーブ番号
        new TagValue("num", "number", true, null),
      ],
      (values, tick) => {
        p.deleteSaveData(values.num);
        return "continue";
      },
    ),
  ];
}
