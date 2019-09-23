import { AsyncTask } from "./base/async-task";
import { PonEventHandler} from "./base/pon-event-handler";
import { Resource } from "./base/resource";
import { SoundBuffer } from "./base/sound";
import { Tag } from "./base/tag";
import { PonLayer } from "./layer/pon-layer";
import { Ponkan3 } from "./ponkan3";

export class TagValue {
  public readonly name: string;
  public readonly type: "number" | "boolean" | "string" | "array" | "object" | "function" | "string|function";
  public readonly required: boolean;
  public readonly defaultValue: any;

  public constructor(
    name: string,
    type: "number" | "boolean" | "string" | "array" | "object" | "function" | "string|function",
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
        case "function":
          tag.values[def.name] = value;
          break;
        case "string|function":
          if (typeof value === "string") {
            tag.values[def.name] = str;
          } else {
            tag.values[def.name] = value;
          }
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
    ///   レイヤーの総数を変更します。
    ///j
    ///   Ponkan3初期化時のレイヤー数は40です。40では多すぎる場合・足りない場合は、
    ///   このコマンドでレイヤー数を変更してください。
    ///
    ///   レイヤー数の変更は頻繁には行わないでください。
    ///   ゲーム開始時に必要なレイヤー数に設定し、以後は変更しないという使い方をしてください。
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
    ///   各種エラーを発生させるか・無視するかの設定を行います。
    new TagAction(
      ["raiseerror"],
      "その他",
      "エラーを発生させるかどうかの設定",
      [
        /// @param `true` の場合、存在しないコマンドを実行したときにエラーにする
        new TagValue("unknowncommand", "boolean", false, null),
      ],
      (values, tick) => {
        if (values.unknowncommand != null) { p.raiseError.unknowncommand = values.unknowncommand; }
        return "continue";
      },
    ),
    /// @category その他
    /// @description Ponkanのイベント処理を一時的にロックする
    /// @details
    ///   Ponkanが行うマウス・タップ・キーボードイベント処理を一時的にロックします。
    ///   HTMLで作成したコンフィグ画面などを表示するときなどは、このコマンドで
    ///   イベント処理をロックするようにしてください。
    new TagAction(
      ["lockgame"],
      "その他",
      "Ponkanのイベント処理を一時的にロックする",
      [],
      (values, tick) => {
        p.lock();
        return "break";
      },
    ),
    /// @category その他
    /// @description Ponkanのイベント処理ロックを解除する
    /// @details
    ///   `lockgame` によるロックを解除します。
    new TagAction(
      ["unlockgame"],
      "その他",
      "Ponkanのイベント処理ロックを解除する",
      [],
      (values, tick) => {
        p.unlock();
        return "break";
      },
    ),
    /// @category その他
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
    ///   ゲーム変数を初期化します。すべてのゲーム変数が削除されます。
    ///
    ///   ゲーム変数はセーブデータごとに保存させる変数です。シナリオの進行管理などに利用します。
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
    ///   一時変数を初期化します。すべての一時変数が削除されます。
    ///
    ///   一時変数はセーブデータ等に保存されません。一時的な値（計算の途中の値など）を保持するのに利用します。
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
    ///   システム変数を保存します。\n
    ///   システム変数は普通、ゲーム終了時に自動的に保存されますが、
    ///   このコマンドを利用して明示的に保存することもできます。
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
    ///   クリックスキップの有効無効を設定します。\n
    ///   クリックスキップとは、テキスト表示途中にクリックすると行末・ページ末までスキップする機能のことです。
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
    ///   画面を揺らす効果を実行します。\n
    ///   このコマンドは画面揺れが終わるのを待ちません。
    ///   画面揺れ効果が終わるまで処理を止めたい場合は、`waitquake` を使用してください。
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
    ///   `quake` で開始した画面揺れ効果を即座に停止します。
    ///   画面揺れ効果が実行されていない場合には何もしません。
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
    ///   `quake` で開始した画面揺れ効果の終了を待ちます。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///    イベントシーンなどでは `false` にしたほうが良いでしょう。
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
    ///
    ///   jump と call の両方を false に設定した場合、デフォルトの動作（メッセージレイヤーを隠す）になります。\n
    ///   jump を true に設定した場合、file と label で指定した場所へジャンプします。\n
    ///   call を true に設定した場合、file と label で指定した場所でサブルーチンを呼び出します。\n
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
    ///   スクリプトの実行を停止します。
    ///   ボタン（選択肢）の押下待ちなどで使用します。
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
    ///   指定したファイルの、指定したラベルの位置に移動します。
    ///
    ///   実行中のスクリプトファイルから別のシナリオファイルへ移動する場合、
    ///   ファイルの読み込みや解析処理が発生するため、処理に時間がかかる場合があります。\n
    ///   同じスクリプトファイル内の移動は問題ありません。
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
    ///   指定したファイルの、指定したラベルの位置をサブルーチンとして呼び出します。
    ///
    ///   実行中のスクリプトファイルから別のシナリオファイルへ移動する場合、
    ///   ファイルの読み込みや解析処理が発生するため、処理に時間がかかる場合があります。\n
    ///   同じスクリプトファイル内の移動は問題ありません。
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
    ///   `call` コマンドで呼び出したサブルーチンから、呼び出し元に戻ります。
    ///
    ///   `forcestart` は、システムボタンを作成する際に使用します。
    ///   システムボタンで呼び出したサブルーチンで `skip` や `auto` を実行しても、通常はサブルーチンから戻るとスクリプトは停止してしまいます。
    ///   `forcestart` を `true` にした時は、呼び出し元へ戻ると同時に、`lb` `pb` コマンドなどで停止していたとしても、強制的に再開されます。
    ///   ただし `s` コマンドでスクリプトが完全に停止していた場合は停止したままです。
    new TagAction(
      ["return"],
      "スクリプト制御",
      "サブルーチンをから戻る",
      [
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
    ///   `for` コマンドと `endfor` コマンドの間を指定回数繰り返します。\n
    ///   `indexvar` で指定した名前の一時変数にループ回数が格納されます。
    ///   ループ回数は `0` から始まるため、 `0` 〜 `loops - 1` の値をとります。
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
    ///   現在実行中の `for` ループから抜け、 `endfor` の位置まで移動します。\n
    ///   `if` コマンドなどと組み合わせて、条件によってループを抜けるときに使います。
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
    ///   スキップ処理を開始します。
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
    ///   スキップ処理を停止します。
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
    ///   オートモードを開始します。
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
    ///   オートモードを停止します。
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
    ///   オートモードに関する設定を行います。
    ///
    ///   `lay` では、オートモード中かどうかを表示するためのレイヤーを指定します。
    ///   オートモード中は、ここで指定したレイヤーが強制的に表示状態になります。
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
    ///   指定した時間だけ、スクリプトの動作を停止します。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///    イベントシーンなどでは `false` にしたほうが良いでしょう。
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
    ///   マウスのクリック・画面のタップなどの操作待ちでスクリプトを停止します。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///    イベントシーンなどでは `false` にしたほうが良いでしょう。
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
    ///   マクロを定義します。\n
    ///   マクロについての詳細は [マクロを利用する](../macro/) のページを参照にしてください。
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
    ///   マクロ定義のl終わりを示します。
    ///   マクロについての詳細は [マクロを利用する](../macro/) のページを参照にしてください。
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
    ///   テキストに関する設定を行います。
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
        /// @param フォントウェイト
        new TagValue("fontweight", "string", false, null),
        /// @param フォントスタイル。"normal" | "italic"
        new TagValue("fontstyle", "string", false, null),
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
        /// @param ルビのフォントファイズ(px)
        new TagValue("rubysize", "number", false, null),
        /// @param ルビの文字間(px)
        new TagValue("rubypitch", "number", false, null),
        /// @param ルビのオフセット(px)
        new TagValue("rubyoffset", "number", false, null),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer: PonLayer) => {
          if (values.fontfamily != null) { layer.textFontFamily = values.fontfamily; }
          if (values.fontsize != null) { layer.textFontSize = values.fontsize; }
          if (values.fontweight != null) { layer.textFontWeight = values.fontweight; }
          if (values.fontstyle != null) { layer.textFontStyle = values.fontstyle; }
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
          if (values.rubysize != null) { layer.rubyFontSize = values.rubysize; }
          if (values.rubypitch != null) { layer.rubyPitch = values.rubypitch; }
          if (values.rubyoffset != null) { layer.rubyOffset = values.rubyoffset; }
        });
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 文字を出力する
    /// @details
    ///   指定したレイヤーに文字を出力します。\n
    ///   デフォルトではカレントメッセージレイヤーが操作対象です。
    new TagAction(
      ["ch"],
      "メッセージ",
      "文字を出力する",
      [
        /// @param 出力する先のレイヤー
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
    ///   次に出力する文字にルビ（ふりがな）を設定します。
    new TagAction(
      ["ruby"],
      "メッセージ",
      "次の文字にルビを設定する",
      [
        /// @param 出力する先のレイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param ルビ
        new TagValue("text", "string", false, null),
      ],
      (values, tick) => {
        if (values.text != null) {
          p.getLayers(values).forEach((layer) => {
            layer.reserveRubyText(values.text);
          });
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 改行する
    /// @details
    ///   指定したレイヤーのテキストを改行します。
    ///   デフォルトではカレントメッセージレイヤーが操作対象です。
    new TagAction(
      ["br"],
      "メッセージ操作",
      "改行する",
      [
        /// @param 出力する先のレイヤー
        new TagValue("lay", "string", false, "message"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
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
    ///   指定したレイヤーのテキストをクリアします。
    ///   デフォルトではカレントメッセージレイヤーが操作対象です。
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
    ///   文字出力の、1文字表示するごとのインターバルについて設定します。
    ///
    ///   通常、インターバル時間は user モードで動作しています。
    ///   user モード時は、ユーザー（プレイヤー）が設定画面等から設定した値が利用されます。\n
    ///   イベントシーンなど、ユーザーの設定した時間ではなく、
    ///   常に一定の間隔で表示したい場合は system モードに設定し、
    ///   イベントシーンが終わったときに user モードに戻します。
    ///
    ///   このコマンドとは別に、一時的にインターバル時間を 0 にする [`nowait`](#nowait) コマンドがあります。
    new TagAction(
      ["textspeed"],
      "メッセージ操作",
      "文字出力のインターバルを設定",
      [
        /// @param インターバルのモード。"user" | "system"
        new TagValue("mode", "string", false, null),
        /// @param ユーザーモードでの未読文章のインターバル時間(ms)
        new TagValue("unread", "number", false, null),
        /// @param ユーザーモードでの既読文章のインターバル時間(ms)
        new TagValue("read", "number", false, null),
        /// @param システムモードでの未読文章のインターバル時間(ms)
        new TagValue("sysunread", "number", false, null),
        /// @param システムモードでの既読文章のインターバル時間(ms)
        new TagValue("sysread", "number", false, null),
      ],
      (values, tick) => {
        if (values.move != null) { p.textSpeedMode = values.mode; }
        if (values.unread != null) { p.userUnreadTextSpeed = values.unread; }
        if (values.read != null) { p.userReadTextSpeed = values.read; }
        if (values.sysunread != null) { p.unreadTextSpeed = values.sysunread; }
        if (values.sysread != null) { p.readTextSpeed = values.sysread; }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 一時的に文字出力インターバルを0にする
    /// @details
    ///   このコマンド実行直後から、文字出力のインターバル時間を一時的に 0 にします。
    ///   もとに戻すときは `endnowait` コマンドを使用します。
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
    ///   `nowait` の効果を終了します。j
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
    ///   テキスト表示で、次の文字を表示する位置を変更します。
    ///   以後のテキストは指定された位置からの表示となります。
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
    ///   インデント位置は `endindent` または `clear` でクリアされます。
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
    ///   `indent` で設定したインデント位置をクリアします。
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
          p.historyLayer.clearHistoryIndentPoint();
        }
        return "continue";
      },
    ),
    /// @category メッセージ操作
    /// @description 行末クリック待ちで停止する
    /// @details
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
    ///   メッセージレイヤを一時的に非表示にします。\
    ///   非表示中はスクリプトの実行が停止します。クリック等の操作で再開します。
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
    ///   [`layalias`](#layalias) で設定したレイヤー名エイリアスを削除します。
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
    ///   メッセージレイヤーとして使用するレイヤーを指定します。
    ///
    ///   スクリプトに書かれたテキストは、メッセージレイヤーに出力されます。\n
    ///   出力先のレイヤーを切り替えたい場合は、このコマンドで切り替えるか、
    ///   もしくは [`ch`](#ch) コマンドなどを使用して出力してください。
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
    ///   行末クリック待ち中に表示されるグリフに関して設定します。\n
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
    ///   ページ末クリック待ち中に表示されるグリフに関して設定します。\n
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
    ///   指定されたレイヤーを単色で塗りつぶします。
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
    ///  [`fillcolor`](#fillcolor-fill) コマンドでのレイヤー塗りつぶしをクリアします。
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
    ///   レイヤーに関して設定します。
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
    ///   指定のレイヤーに画像ファイルを読み込みます。\n
    ///   画像読み込み後、レイヤーのサイズを画像と同じサイズに変更します。
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
    ///   レイヤーに読み込まれた画像をすべて解放します。
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
    ///   `unlockbuttons` コマンドでロック状態を解除することで、押下できるようになります。
    new TagAction(
      ["textbutton", "txtbtn"],
      "ボタン",
      "レイヤーにテキストボタンを配置する",
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
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addTextButton(
            values.btnname,
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
            values.enterbuf,
            values.leavebuf,
            values.clickbuf,
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
      "ボタン",
      "テキストボタンの設定を変更する",
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
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          if (values.bgcolors) { layer.changeTextButtonColors(values.btnname, values.bgcolors); }
          if (values.bgalphas) { layer.changeTextButtonAlphas(values.btnname, values.bgalphas); }
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
    ///   指定されたレイヤーのテキストボタンをクリアします。
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
    ///   指定のレイヤーに、画像を用いたボタンを配置します。
    ///   配置直後はボタンはロックされた状態となり、押下することはできません。
    ///   `unlockbuttons` コマンドでロック状態を解除することで、押下できるようになります。
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
        /// @param マウスポインタが重なったタイミングで再生する音声の音声バッファ
        new TagValue("enterbuf", "string", false, ""),
        /// @param マウスポインタが出て行ったタイミングで再生する音声の音声バッファ
        new TagValue("leavebuf", "string", false, ""),
        /// @param ボタン押下時に再生する音声の音声バッファ
        new TagValue("clickbuf", "string", false, ""),
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
            values.enterbuf,
            values.leavebuf,
            values.clickbuf,
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
    ///   指定されたレイヤーの画像ボタンをクリアします。
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
    ///   指定のレイヤーに、画像を用いたトグルボタンを配置します。
    ///   配置直後はボタンはロックされた状態となり、押下することはできません。
    ///   `unlockbuttons` コマンドでロック状態を解除することで、押下できるようになります。
    ///
    ///   トグルボタンは通常のボタンと異なり、オン・オフの二種類の状態を持ちます。
    ///   機能のオン・オフの切り替えなどに利用することがｄけいます。
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
    ///   指定されたレイヤーのトグルボタンをクリアします。
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
    ///   指定されたレイヤーのボタンをロックし、押下できないようにします。
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
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description ボタンをアンロックする
    /// @details
    ///   指定されたレイヤーのボタンのロックを解除し、押下できる状態にします。\n
    ///   このコマンドでボタンを押下可能にした後は、直後に`s` コマンドでスクリプトの実行を停止してください。
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
        p.getLayers(values).forEach((layer) => { layer.unlockButtons(); });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description システムボタンをロックする
    /// @details
    ///   指定されたレイヤーのシステムボタンをロックし、押下できないようにします。
    new TagAction(
      ["locksystembuttons", "locksystembutton", "locksystem"],
      "ボタン",
      "システムボタンをロックする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => { layer.lockSystemButtons(); });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description システムボタンをアンロックする
    /// @details
    ///   指定されたレイヤーのシステムボタンのロックを解除し、押下できる状態にします。
    new TagAction(
      ["unlocksystembuttons", "unlocksystembutton", "unlocksystem"],
      "ボタン",
      "システムボタンをアンロックする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => { layer.unlockSystemButtons(); });
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
      "ボタン",
      "レイヤーにスライダーを配置する",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
        /// @param 値変更時に実行する関数
        new TagValue("onchange", "string", false, null),
        /// @param x座標(px)
        new TagValue("x", "number", false, 0),
        /// @param y座標(px)
        new TagValue("y", "number", false, 0),
        /// @param スライダーの値が変わったときに実行するJavaScript
        new TagValue("exp", "string|function", false, ""),
        /// @param 初期値(0.0～1.0)
        new TagValue("value", "number", false, 0),
        /// @param スライダーの背景用画像のファイルパス
        new TagValue("back", "string", true, null),
        /// @param スライダーの表面画像のファイルパス
        new TagValue("fore", "string", true, null),
        /// @param スライダーの表面画像のファイルパス
        new TagValue("button", "string", true, null),
        // /// @param マウスポインタがスライダーに重なったタイミングで再生する音声の音声バッファ
        // new TagValue("enterbuf", "string", false, ""),
        // /// @param マウスポインタがスライダーから出て行ったタイミングで再生する音声の音声バッファ
        // new TagValue("leavebuf", "string", false, ""),
        // /// @param スライダー押下時に再生する音声の音声バッファ
        // new TagValue("clickbuf", "string", false, ""),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addSlider(
            values.x,
            values.y,
            values.value,
            values.exp,
            values.back,
            values.fore,
            values.button,
          ).done(() => {
            p.conductor.start();
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
      "ボタン",
      "スライダーをロックする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => { layer.lockSliders(); });
        return "continue";
      },
    ),
    /// @category ボタン
    /// @description スライダーをアンロックする
    /// @details
    ///   指定レイヤーのスライダーのロックを解除し、押下できる状態にします。
    new TagAction(
      ["unlocksliders", "unlockslider"],
      "ボタン",
      "スライダーをアンロックする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", false, "all"),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => { layer.unlockSliders(); });
        return "continue";
      },
    ),
    // ======================================================================
    // アニメーション関係
    // ======================================================================
    /// @category アニメーション
    /// @description フレームアニメーションを設定する
    /// @details
    ///   指定レイヤーにフレームアニメーションを設定します。\n
    ///   フレームアニメーションの詳細については [フレームアニメーション]("../frameanim/") を参照してください。
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
    ///   指定レイヤーに読み込まれたフレームアニメーションを再生開始します。
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
    ///   指定レイヤーのフレームアニメーションを停止します。\n
    ///   停止したアニメーションをもう一度再生したい場合は、
    ///   改めて `frameanim` コマンドで設定してから `startframeanim` コマンドを実行てください。
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
    ///   指定レイヤーのフレームアニメーションの終了を待ちます。\n
    ///   実行されているフレームアニメーションが無い場合やループ再生の場合は何もしません。
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
    ///   レイヤーの自動移動を開始します。
    ///   自動移動に関しては [自動移動](../automove/) のページを参照してください。
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
    ///   レイヤーの自動移動を停止します。\n
    ///   停止後、レイヤーの状態は自動移動が終わった時点の状態になります。
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
    ///   レイヤーの自動移動の終了を待ちます。\n
    ///   自動移動中のレイヤーが無い場合やループ再生の場合はなにもしません。
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
    /// @description フィルタをクリアする
    /// @details
    ///   指定レイヤーに設定されたすべてのフィルタをクリアします。
    new TagAction(
      ["clearfilters", "clearfilter"],
      "レイヤーフィルタ",
      "フィルタをクリアする",
      [
        /// @param 対象レイヤー
        new TagValue("lay", "string", true, null),
        /// @param 対象ページ
        new TagValue("page", "string", false, "current"),
      ],
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
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
      "レイヤーフィルタ",
      "ぼかしフィルタ",
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
    /// @category レイヤーフィルタ
    /// @description 色補正フィルタ
    /// @details
    ///   レイヤーに色補正フィルタを設定します。
    new TagAction(
      ["colorfilter"],
      "レイヤーフィルタ",
      "色補正フィルタ",
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
      (values, tick) => {
        p.getLayers(values).forEach((layer) => {
          layer.addFilter("color", values);
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
    ///   バッファ番号エイリアスを削除します。
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
    ///   指定の音声バッファに音声ファイルを読み込みます。
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
    ///   指定の音声バッファの音声を解放します。
    ///   使用が終わった音声はこのコマンドで解放するようにしてください。
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
    ///   音声に関して設定します。
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
    ///   指定の音声バッファに読み込まれた音声を再生します。
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
    ///   指定の音声バッファの再生を停止します。
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
    ///   指定の音声バッファの音量をフェードします。\n
    ///   このコマンドではフェード完了まで待ちません。フェードを待つ場合は `waitfade` コマンドを使用してください。
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
    ///   指定の音声バッファをフェードアウトします。\n
    ///   このコマンドではフェード完了まで待ちません。フェードを待つ場合は `waitfade` コマンドを使用してください。
    new TagAction(
      ["fadeoutsound", "fadeout"],
      "サウンド",
      "音声をフェードアウトして再生停止する",
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
        /// @param フェード終了後に自動的に再生停止するか
        new TagValue("autostop", "boolean", false, true),
      ],
      (values, tick) => {
        p.getSoundBuffer(values.buf).fadeout(values.time, values.autostop);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードインで再生開始する
    /// @details
    ///   指定の音声バッファをフェードインしながら再生開始します。
    ///   このコマンドではフェード完了まで待ちません。フェードを待つ場合は `waitfade` コマンドを使用してください。
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
    ///   指定の音声バッファの音声が最後まで再生されるのを待ちます。\n
    ///   再生中でない場合やループ再生中の場合はなにもしません。
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
    ///   指定の音声バッファのフェードが完了するのを待ちます。
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
    ///   指定の音声バッファのフェードを終了します。\n
    ///   音声バッファの音量は即座にフェード後の音量になります。
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
    /// @description 表ページを裏ページにコピーする
    /// @details
    ///   表ページの状態を裏ページにコピーします。
    new TagAction(
      ["backlay"],
      "トランジション",
      "表ページを裏ページにコピーする",
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
    ///   `srclay` のレイヤーの状態を `destlay` のレイヤーにコピーします。
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
    ///   操作対象ページを変更します。
    ///
    ///   通常、操作対象ページは表ページ（画面に見えている側）になっていますが、
    ///   トランジションを利用する場合は裏ページを操作します。
    ///   その際に各コマンドで `page: "back"` と指定しても良いですが、
    ///   このコマンドで操作対象ページを `"back"` に設定すれば、
    ///   以後 `trans` コマンドが実行されるまで裏ページが操作対象になります。
    new TagAction(
      ["currentpage"],
      "トランジション",
      "操作対象ページを変更する",
      [
        /// @param 操作対象ページ（"fore" | "back" ）を指定
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
    ///   表ページの情報を裏ページにコピーし、操作対象を裏ページに変更します。\n
    ///   `backlay` コマンドと `currentpage page: "back"` コマンドを実行したのと同じ状態となります。
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
    ///   トランジションを実行します。\n
    ///   トランジションの詳細は [トランジション](../transition) のページを参照してください。
    ///
    ///   このコマンドはトランジションの完了を待ちません。終了するまで待つ場合は `waittrans` コマンドを使用してください。
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
    ///   トランジションを即座に停止します。
    ///   各レイヤーの状態は、通常通りトランジションが完了したのと同じ状態になります。
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
    ///   トランジションが完了するのを待ちます。\n
    ///   `canskip: false` とした場合、スキップ処理やクリック等でスキップできなくなります。
    ///   イベントシーンなどでは `false` にしたほうが良いでしょう。
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
    ///   メッセージ履歴に関して設定します。
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
    ///   メッセージ履歴を表示します。
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
    ///   メッセージ履歴に指定のテキストを出力します。
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
    ///   メッセージ履歴のテキストを改行します。
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
    ///   最後に通過したセーブポイントの状態をセーブします。
    ///   セーブ／ロードの詳細は [セーブ／ロード](../save-and-load/)を参照してください。
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
    ///   指定のセーブデータをロードします。
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
    ///   一時領域に、このコマンドを実行したときの状態を保存します。\n
    ///
    ///   ここで保存したセーブデータは通常のセーブデータとは別に保持されます。
    ///   また、あくまで一時領域に保存するだけなので、ゲームが終了するときに破棄されます。
    ///
    ///   右クリックサブルーチンの開始時にこのコマンドで状態を保存しておき、
    ///   右クリックサブルーチンが終わったときに `tempload` でまとめて復元する、というような用途で使用します。
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
    ///   `tempsave` で保存した一時セーブデータをロードします。
    ///
    ///   `toback: true` を指定したときは、一時セーブデータの表ページ―の情報を
    ///   裏ページ側に復元します。レイヤーの状態をトランジションで復元したい場合などに利用します。
    new TagAction(
      ["tempload"],
      "セーブ／ロード",
      "一時セーブデータから復元する",
      [
        /// @param セーブ番号
        new TagValue("num", "number", true, null),
        /// @param 音声もロードするかどうか
        new TagValue("sound", "boolean", false, false),
        /// @param 表ページを裏ページとして復元するかどうか
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
    ///   現在の画面の状態でスクリーンショットを取ります。\n
    ///   取得されたスクリーンショットは `save` コマンドで保存されます。\n
    ///   セーブ画面に入った直後にこのコマンドでスクリーンショットの状態を固定し、
    ///   セーブ画面から抜けるときに `unlockscreenshot` で解除する、というような使い方をします。
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
