import { assert } from "chai";
import { ScriptParser } from "../../src/base/script-parser";
import { Ponkan3 } from "../../src/ponkan3";

let testScript_01 = `#コメント行
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

お
わ
り
。
`;

let testScript_jspart = `
---
  var hoge = 100;
  console.log(hoge);
---`;


export function ScriptParserTest() {
  let ponkan: Ponkan3;

  describe('ScriptParserのテスト', () => {
    beforeEach(() => {
      ponkan = new Ponkan3("game");
    });

    it('一通りパースできるかどうか', () => {
      let sp = new ScriptParser(ponkan.resource, testScript_01);
      assert.isNotNull(sp);
      // sp.debugPrint();
    });
    it('タグ数', () => {
      let sp = new ScriptParser(ponkan.resource, testScript_01);
      assert.isNotNull(sp.tags);
      assert.isNotEmpty(sp.tags);
      assert.equal(sp.tags.length, 3 + 22 + 4 + 4 + 1);
    });
    it('タグ数の内容（簡易）', () => {
      let sp = new ScriptParser(ponkan.resource, testScript_01);
      let p = 0;
      assert.equal(sp.tags[p++].name, 'layopt');
      assert.equal(sp.tags[p++].name, 'layopt');
      assert.equal(sp.tags[p++].name, 'meslay');
      for (let i = 0; i < 22; i++) {
        // 吾輩は猫である〜
        assert.equal(sp.tags[p++].name, 'ch');
      }
      assert.equal(sp.tags[p++].name, '__label__');
      assert.equal(sp.tags[p++].name, '__js__');
      assert.equal(sp.tags[p++].name, '__js__');
      assert.equal(sp.tags[p++].name, '__js__');
      for (let i = 0; i < 4; i++) {
        // おわり。
        assert.equal(sp.tags[p++].name, 'ch');
      }
      assert.equal(sp.tags[p++].name, 's');
    });
    it('末尾にsタグ自動挿入', () => {
      let sp = new ScriptParser(ponkan.resource, testScript_01);
      assert.equal(sp.tags[sp.tags.length-1].name, 's');
    });
    it('タグ', () => {
      let testScript_tag = `;meslay{"width":100,"height":200,"visible":true,"file":"hogehoge.png"}`;
      let sp = new ScriptParser(ponkan.resource, testScript_tag);
      assert.equal(sp.tags[0].name, 'meslay');
      assert.deepEqual(sp.tags[0].values, {
        "width":100,
        "height":200,
        "visible":true,
        "file":"hogehoge.png",
        "__body__":`meslay{"width":100,"height":200,"visible":true,"file":"hogehoge.png"}`
      });
    });
    it('ラベル', () => {
      let testScript_label = `*label-name`;
      let sp = new ScriptParser(ponkan.resource, testScript_label);
      assert.equal(sp.tags[0].name, '__label__');
      assert.deepEqual(sp.tags[0].values, { "__body__":`label-name` });
    });
    it('JavaScript', () => {
      let testScript_js = `-console.log("TEST");`;
      let sp = new ScriptParser(ponkan.resource, testScript_js);
      assert.equal(sp.tags[0].name, '__js__');
      assert.deepEqual(sp.tags[0].values, { "__body__":`console.log("TEST");`, print: false });
    });
    it('JavaScript出力', () => {
      let testScript_jsp = `=100+200;`;
      let sp = new ScriptParser(ponkan.resource, testScript_jsp);
      assert.equal(sp.tags[0].name, '__js__');
      assert.deepEqual(sp.tags[0].values, { "__body__":`100+200;`, print: true });
    });
    it('JavaScript部', () => {
      let sp = new ScriptParser(ponkan.resource, testScript_jspart);
      assert.equal(sp.tags[0].name, '__js__');
      assert.deepEqual(sp.tags[0].values, { "__body__":"  var hoge = 100;\n  console.log(hoge);\n", print: false });
    });
  });
}
