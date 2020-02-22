import { assert } from "chai";
import { ScriptParser } from "../../src/ts/base/script-parser";
import { Ponkan3 } from "../../src/ts/ponkan3";
import * as Helper from "../helper";

const testScript01 = `#コメント行
;layopt { "width":100, "height":200, "visible":true }
;     layopt    {      "width"   :   100     , "height"   :   200 ,    "visible"   :   true    }
;meslay{"width":100,"height":200,"visible":true,"file":"hogehoge.png"}
## 22文字
吾輩は猫である。名前はまだない。
二行目だよ。

# ラベル
*sample-label

# JavaScript
- console.log('Test Script.');
= "JSで" + "生成したメッセージ" + "です。"

# JavaScript部
---
  var hoge = 100;
  console.log(hoge);
---

# セーブマーク
~セーブ
~save-mark|セーブ2
~

お
わ
り
。
`;

const testScript02 = `# コメントはタグではない。あと改行は__line_break__のタグ。
;layopt width: 100, height: 200
;   layopt   {    width   :    100   , "height":200 }
;layopt{width:100,height:200}
;br
*sample-label
-console.log("hoge")
=console.log("hoge")
---
console.log("hoge")
---
~セーブ|
あいうえお

`;

const testScriptJsPart = `---
  var hoge = 100;
  console.log(hoge);
---`;

describe("ScriptParser", () => {
  let ponkan: Ponkan3;

  before(() => {
    ponkan = Helper.createPonkan();
  });

  after(() => {
    Helper.destroyPonkan(ponkan);
  });

  describe("パース結果", () => {
    it("一通りパースできるかどうか", () => {
      const sp = new ScriptParser(ponkan.resource, testScript01);
      assert.isNotNull(sp);
      // sp.debugPrint();
    });
    it("タグ数", () => {
      const sp = new ScriptParser(ponkan.resource, testScript02);
      assert.isNotNull(sp.tags);
      assert.isNotEmpty(sp.tags);
      assert.equal(sp.tags.length, 17); // 最後にsコマンドが自動追加されるのに注意
    });
    it("タグの内容（簡易）", () => {
      const sp = new ScriptParser(ponkan.resource, testScript02);
      let p = 0;
      assert.equal(sp.tags[p++].name, "layopt");
      assert.equal(sp.tags[p++].name, "layopt");
      assert.equal(sp.tags[p++].name, "layopt");
      assert.equal(sp.tags[p++].name, "br");
      assert.equal(sp.tags[p++].name, "__label__");
      assert.equal(sp.tags[p++].name, "__js__");
      assert.equal(sp.tags[p++].name, "__js__");
      assert.equal(sp.tags[p++].name, "__js__");
      assert.equal(sp.tags[p++].name, "__save_mark__");
      assert.equal(sp.tags[p++].name, "ch"); // あ
      assert.equal(sp.tags[p++].name, "ch"); // い
      assert.equal(sp.tags[p++].name, "ch"); // う
      assert.equal(sp.tags[p++].name, "ch"); // え
      assert.equal(sp.tags[p++].name, "ch"); // お
      assert.equal(sp.tags[p++].name, "__line_break__"); // あいうえおの末尾
      assert.equal(sp.tags[p++].name, "__line_break__"); // 空行
      assert.equal(sp.tags[p++].name, "s");
    });
    it("末尾にsコマンド自動挿入", () => {
      const sp = new ScriptParser(ponkan.resource, testScript01);
      assert.equal(sp.tags[sp.tags.length - 1].name, "s");
    });
    it("コマンド", () => {
      const testScript = `;meslay{"width":100,"height":200,"visible":true,"file":"hogehoge.png"}`;
      const sp = new ScriptParser(ponkan.resource, testScript);
      assert.equal(sp.tags[0].name, "meslay");
      assert.deepEqual(sp.tags[0].values, {
        width: 100,
        height: 200,
        visible: true,
        file: "hogehoge.png",
        __body__: `meslay{"width":100,"height":200,"visible":true,"file":"hogehoge.png"}`,
      });
    });
    it("ラベル", () => {
      const testScript = `*label-name`;
      const sp = new ScriptParser(ponkan.resource, testScript);
      assert.equal(sp.tags[0].name, "__label__");
      assert.deepEqual(sp.tags[0].values, { __body__: `label-name` });
    });
    describe("セーブマーク", () => {
      it("未省略 ~hoge|piyo", () => {
        const testScript = `~save-mark-name|見出しテキスト`;
        const sp = new ScriptParser(ponkan.resource, testScript);
        assert.equal(sp.tags[0].name, "__save_mark__");
        assert.deepEqual(sp.tags[0].values, {
          __body__: "save-mark-name|見出しテキスト",
          name: "save-mark-name",
          comment: "見出しテキスト",
        });
      });
      it("見出し省略 ~hoge|", () => {
        const testScript = `~save-mark-name|`;
        const sp = new ScriptParser(ponkan.resource, testScript);
        assert.equal(sp.tags[0].name, "__save_mark__");
        assert.deepEqual(sp.tags[0].values, {
          __body__: "save-mark-name|",
          name: "save-mark-name",
          comment: "",
        });
      });
      it("名前省略1 ~|piyo", () => {
        const testScript = `~|見出しテキスト`;
        const sp = new ScriptParser(ponkan.resource, testScript);
        assert.equal(sp.tags[0].name, "__save_mark__");
        assert.deepEqual(sp.tags[0].values, {
          __body__: "|見出しテキスト",
          name: "__save_mark_0__",
          comment: "見出しテキスト",
        });
      });
      it("名前省略2 ~piyo", () => {
        const testScript = `~見出しテキスト`;
        const sp = new ScriptParser(ponkan.resource, testScript);
        assert.equal(sp.tags[0].name, "__save_mark__");
        assert.deepEqual(sp.tags[0].values, {
          __body__: "見出しテキスト",
          name: "__save_mark_0__",
          comment: "見出しテキスト",
        });
      });
      it("全省略1 ~|", () => {
        const testScript = `~|`;
        const sp = new ScriptParser(ponkan.resource, testScript);
        assert.equal(sp.tags[0].name, "__save_mark__");
        assert.deepEqual(sp.tags[0].values, {
          __body__: "|",
          name: "__save_mark_0__",
          comment: "",
        });
      });
      it("全省略2 ~", () => {
        const testScript = `~`;
        const sp = new ScriptParser(ponkan.resource, testScript);
        assert.equal(sp.tags[0].name, "__save_mark__");
        assert.deepEqual(sp.tags[0].values, {
          __body__: "",
          name: "__save_mark_0__",
          comment: "",
        });
      });
    });
    it("JavaScript", () => {
      const testScript = `-console.log("TEST");`;
      const sp = new ScriptParser(ponkan.resource, testScript);
      assert.equal(sp.tags[0].name, "__js__");
      assert.deepEqual(sp.tags[0].values, { __body__: `console.log("TEST");`, print: false });
    });
    it("JavaScript出力", () => {
      const testScript = `=100+200;`;
      const sp = new ScriptParser(ponkan.resource, testScript);
      assert.equal(sp.tags[0].name, "__js__");
      assert.deepEqual(sp.tags[0].values, { __body__: `100+200;`, print: true });
    });
    it("JavaScript部", () => {
      const sp = new ScriptParser(ponkan.resource, testScriptJsPart);
      assert.equal(sp.tags[0].name, "__js__");
      assert.deepEqual(sp.tags[0].values, { __body__: "  var hoge = 100;\n  console.log(hoge);\n", print: false });
    });
  });
});
