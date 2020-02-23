import { expect } from "chai";
import { Ponkan } from "../../src/ts/ponkan";
import { Script } from "../../src/ts/base/script";
import * as Helper from "../helper";

let ponkan: Ponkan;

describe("Script", () => {
  before(() => {
    ponkan = Helper.createPonkan();
  });

  after(() => {
    Helper.destroyPonkan(ponkan);
  });

  beforeEach(() => {
    ponkan.resource.tmpVar = {};
    ponkan.resource.gameVar = {};
    ponkan.resource.systemVar = {};
  });

  afterEach(() => {
    ponkan.resource.clearMacroInfo();
  });

  context("正常系", () => {
    let script: Script;
    const filePath = "start.pon";
    const scriptText = " おはようございます。\n;s";

    beforeEach(async () => {
      script = new Script(ponkan.resource, filePath, scriptText);
    });

    it("指定ファイルがパースされる", () => {
      expect(script).not.to.equals(null);
      expect(script.filePath).to.equals(filePath);
    });

    it("読み込み直後はスクリプトの先頭", () => {
      expect(script.getPoint()).to.equals(0);
    });
  });

  context("goTo系", () => {
    let script: Script;
    const filePath = "start.pon";
    const scriptLines: string[] = [
      ';ch text: "おはようございます。"',
      "*hello",
      ';ch text: "こんにちは。"',
      "~test_save_mark|テストセーブマーク",
      "*goodbye",
      ';ch text: "さようなら。"',
      "*end",
      ";s",
      // ";s", // ScriptParserによってファイル末尾には自動的に ;s が付与される
    ];
    const scriptText = scriptLines.join("\n");

    beforeEach(async () => {
      script = new Script(ponkan.resource, filePath, scriptText);
    });

    it("指定ファイルがパースされる", () => {
      expect(script).not.to.equals(null);
      expect(script.filePath).to.equals(filePath);
    });

    it("読み込み直後はスクリプトの先頭", () => {
      expect(script.getPoint()).to.equals(0);
    });

    context(".goTo", () => {
      it("指定位置へ移動", () => {
        script.goTo(5);
        expect(script.getPoint()).to.equals(5);
      });

      it("範囲外（負の値）なら先頭へ移動", () => {
        script.goTo(5);
        script.goTo(-1);
        expect(script.getPoint()).to.equals(0);
      });

      it("範囲外（超過）なら末尾へ移動", () => {
        script.goTo(10000);
        // 自動付与の ;s を考慮すると、scriptLines.lengthになる
        expect(script.getPoint()).to.equals(scriptLines.length);
      });
    });

    context(".goToStart", () => {
      it("先頭へ戻る", () => {
        script.goTo(5);
        script.goToStart();
        expect(script.getPoint()).to.equals(0);
      });
    });

    context(".goToLabel", () => {
      it("指定ラベルへ移動", () => {
        script.goToLabel("hello");
        // ラベルの次から実行するので、実際にはラベル位置+1へ移動
        expect(script.getPoint()).to.equals(2);
      });

      it("ラベルが存在しないときは例外", () => {
        expect(() => script.goToLabel("unknown_label")).to.throw();
      });
    });

    context(".goToSaveMark", () => {
      it("指定セーブマークへ移動", () => {
        script.goToSaveMark("test_save_mark");
        // セーブマークの次から実行するので、実際にはセーブマーク位置+1へ移動
        expect(script.getPoint()).to.equals(4);
      });

      it("セーブマークが存在しないときは例外", () => {
        expect(() => script.goToSaveMark("unknown_save_mark")).to.throw();
      });
    });

    context(".getCurrentTag", () => {
      it("現在位置のタグを取得", () => {
        script.goToLabel("hello");
        const tag = script.getCurrentTag();
        expect(tag).not.to.equals(null);
        if (tag != null) {
          expect(tag.name).to.equals("ch");
          expect(tag.values.text).to.equals("こんにちは。");
        }
      });

      it("位置移動しない", () => {
        script.goToLabel("hello");
        const point = script.getPoint();
        script.getCurrentTag();
        expect(script.getPoint()).to.equals(point);
      });
    });

    context(".getNextTag", () => {
      it("現在位置のタグを取得", () => {
        script.goToLabel("hello");
        const tag = script.getNextTag();
        expect(tag).not.to.equals(null);
        if (tag != null) {
          expect(tag.name).to.equals("ch");
          expect(tag.values.text).to.equals("こんにちは。");
        }
      });

      it("次の位置へ移動", () => {
        script.goToLabel("hello");
        const point = script.getPoint();
        script.getNextTag();
        expect(script.getPoint()).to.equals(point + 1);
      });
    });
  });

  context("clone", () => {
    let script: Script;
    let clone: Script;
    const filePath = "start.pon";
    const scriptText = "こんにちは。\n;s";

    beforeEach(() => {
      script = new Script(ponkan.resource, filePath, scriptText);
      script.goTo(5);
      clone = script.clone();
    });

    it("同じファイル", () => {
      expect(clone.filePath).to.equals(filePath);
    });

    it("複製後はスクリプトの先頭", () => {
      expect(clone.getPoint()).to.equals(0);
    });
  });

  context("if~elsif~else~endif", () => {
    let script: Script;
    const filePath = "start.pon";
    const scriptLines: string[] = [
      ';if exp: "tv.value === 0"',
      '  ;ch text: "ifブロック"',
      ';elsif exp: "tv.value === 1"',
      '  ;ch text: "elsifブロック1"',
      ';elsif exp: "tv.value === 2"',
      '  ;ch text: "elsifブロック2"',
      '  ;if exp: "true"',
      '    ;if exp: "tv.value2 === 0"',
      '      ;ch text: "子ifブロック"',
      '    ;elsif exp: "tv.value2 === 1"',
      '      ;ch text: "子elsifブロック1"',
      "    ;else",
      '      ;ch text: "子elseブロック"',
      "    ;endif",
      "  ;endif",
      ";else",
      '  ;ch text: "elseブロック"',
      "*end",
      ";s",
      // ";s", // ScriptParserによってファイル末尾には自動的に ;s が付与される
    ];
    const scriptText = scriptLines.join("\n");

    beforeEach(() => {
      script = new Script(ponkan.resource, filePath, scriptText);
    });

    context(".isInsideOfIff", () => {
      it("ifの外ならtrue", () => {
        expect(script.isInsideOfIf()).to.be.false;
      });

      it("ifの中ならtrue", () => {
        ponkan.tmpVar.value = 0;
        const ifTag = script.getNextTag(); // if
        script.ifJump(ifTag?.values.exp, ponkan.tagActions);
        expect(script.isInsideOfIf()).to.be.true;
      });
    });

    context(".ifJump", () => {
      it("exp == true", () => {
        ponkan.tmpVar.value = 0;
        const ifTag = script.getNextTag(); // if
        script.ifJump(ifTag?.values.exp, ponkan.tagActions);
        const tag = script.getCurrentTag(); // ch
        expect(tag?.values.text).to.equals("ifブロック");
      });

      it("exp == false, and goto elsif 1", () => {
        ponkan.tmpVar.value = 1;
        script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions);
        const tag = script.getCurrentTag(); // ch
        expect(tag?.values.text).to.equals("elsifブロック1");
      });

      it("exp == false, and goto elsif 2", () => {
        ponkan.tmpVar.value = 2;
        script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions);
        const tag = script.getCurrentTag(); // ch
        expect(tag?.values.text).to.equals("elsifブロック2");
      });

      it("exp == false, and goto else block", () => {
        ponkan.tmpVar.value = 100;
        const ifTag = script.getNextTag(); // if
        expect(ifTag).not.to.equals(null);
        script.ifJump(ifTag?.values.exp, ponkan.tagActions);
        const tag = script.getCurrentTag(); // ch
        expect(tag?.values.text).to.equals("elseブロック");
      });

      context("入れ子のif", () => {
        it("thenブロックに到達", () => {
          ponkan.tmpVar.value = 2;
          ponkan.tmpVar.value2 = 0;
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions);
          script.getNextTag(); // chを読み捨て
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions); // 2段目
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions); // 3段目
          const tag = script.getCurrentTag(); // ch
          expect(tag?.values.text).to.equals("子ifブロック");
        });

        it("elsifブロックに到達", () => {
          ponkan.tmpVar.value = 2;
          ponkan.tmpVar.value2 = 1;
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions);
          script.getNextTag(); // chを読み捨て
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions); // 2段目
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions); // 3段目
          const tag = script.getCurrentTag(); // ch
          expect(tag?.values.text).to.equals("子elsifブロック1");
        });

        it("elseブロックに到達", () => {
          ponkan.tmpVar.value = 2;
          ponkan.tmpVar.value2 = 100;
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions);
          script.getNextTag(); // chを読み捨て
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions); // 2段目
          script.ifJump(script.getNextTag()?.values.exp, ponkan.tagActions); // 3段目
          const tag = script.getCurrentTag(); // ch
          expect(tag?.values.text).to.equals("子elseブロック");
        });
      });
    });
  });

  context("マクロ", () => {
    context("マクロ定義", () => {
      const filePath = "start.pon";
      const scriptLines: string[] = [
        ';macro name: "testmacro"',
        '  ;ch text: "マクロ内部1"',
        '  ;ch text: "マクロ内部2"',
        '  ;ch text: "マクロ内部3"',
        ";endmacro",
        ";testmacro",
        // ScriptParserによってファイル末尾には自動的に ;s が付与される
      ];
      const scriptText = scriptLines.join("\n");

      it("defineMacroで登録できる", () => {
        const script = new Script(ponkan.resource, filePath, scriptText);
        const tag = script.getNextTag();
        script.defineMacro(tag?.values.name);
        expect(ponkan.resource.hasMacro("testmacro")).to.be.true;
      });

      it("マクロの上書き禁止", () => {
        const script = new Script(ponkan.resource, filePath, scriptText);
        const tag1 = script.getNextTag();
        script.defineMacro(tag1?.values.name);
        expect(ponkan.resource.hasMacro("testmacro")).to.be.true;
        script.goToStart();
        const tag2 = script.getNextTag();
        expect(() => script.defineMacro(tag2?.values.name)).to.throw();
      });

      it("マクロが閉じられていないとエラー", () => {
        const invalid = `;macro name: "testmacro"
                         ;ch text: "hoge"`;
        const script = new Script(ponkan.resource, filePath, invalid);
        const tag = script.getNextTag();
        expect(() => script.defineMacro(tag?.values.name)).to.throw();
      });

      it("マクロ中のラベルはエラー", () => {
        const invalid = `;macro name: "testmacro"
                         *label
                         ;endmacro`;
        const script = new Script(ponkan.resource, filePath, invalid);
        const tag = script.getNextTag();
        expect(() => script.defineMacro(tag?.values.name)).to.throw();
      });

      it("マクロ中のセーブマークはエラー", () => {
        const invalid = `;macro name: "testmacro"
                         ~savemark
                         ;endmacro`;
        const script = new Script(ponkan.resource, filePath, invalid);
        const tag = script.getNextTag();
        expect(() => script.defineMacro(tag?.values.name)).to.throw();
      });

      it("空のマクロはエラー", () => {
        const invalid = `;macro name: "testmacro"
                         ;endmacro`;
        const script = new Script(ponkan.resource, filePath, invalid);
        const tag = script.getNextTag();
        expect(() => script.defineMacro(tag?.values.name)).to.throw();
      });

      it("マクロ中のマクロ定義はエラー", () => {
        const invalid = `;macro name: "testmacro"
                           ;macro name: "macro2"
                           ;endmacro
                         ;endmacro`;
        const script = new Script(ponkan.resource, filePath, invalid);
        const tag = script.getNextTag();
        expect(() => script.defineMacro(tag?.values.name)).to.throw();
      });
    });

    context("マクロ呼び出し", () => {
      let script: Script;
      const filePath = "start.pon";
      const scriptLines: string[] = [
        ';macro name: "macro1"',
        '  ;ch text: "マクロ1-1"',
        "  ;macro2",
        '  ;ch text: "マクロ1-2"',
        ";endmacro",
        ';macro name: "macro2"',
        '  ;ch text: "マクロ2-1"',
        "  ;macro3",
        '  ;ch text: "マクロ2-2"',
        ";endmacro",
        ';macro name: "macro3"',
        '  ;ch text: "マクロ3"',
        ";endmacro",
        ";macro1",
      ];
      const scriptText = scriptLines.join("\n");

      beforeEach(() => {
        script = new Script(ponkan.resource, filePath, scriptText);
        script.defineMacro(script.getNextTag()?.values.name); // macro1
        script.defineMacro(script.getNextTag()?.values.name); // macro2
        script.defineMacro(script.getNextTag()?.values.name); // macro3
      });

      it("正常に呼び出せる", () => {
        const tag = script.getNextTag();
        expect(tag?.name).to.equals("ch");
        expect(tag?.values.text).to.equals("マクロ1-1");
      });

      it("多重呼び出しできる", () => {
        const expectedTextList = ["マクロ1-1", "マクロ2-1", "マクロ3", "マクロ2-2", "マクロ1-2"];
        expectedTextList.forEach((v: string) => {
          const tag = script.getNextTag();
          expect(tag?.name).to.equals("ch");
          expect(tag?.values.text).to.equals(v);
        });
      });
    });
  });

  context("マクロパラメータ", () => {
    let script: Script;
    const filePath = "start.pon";
    const scriptLines: string[] = [
      ';macro name: "macro1"',
      '  ;ch text: "マクロ1-1"',
      '  ;macro2 val: "&mp.val", jsval: "&tv.jsval"',
      '  ;ch text: "マクロ1-2"',
      ";endmacro",
      ';macro name: "macro2"',
      '  ;ch text: "マクロ2"',
      ";endmacro",
      // ";macro1",
      ';macro1 val: "macrovalue", jsval: "&tv.jsval"',
    ];
    const scriptText = scriptLines.join("\n");

    beforeEach(() => {
      script = new Script(ponkan.resource, filePath, scriptText);
      script.defineMacro(script.getNextTag()?.values.name); // macro1
      script.defineMacro(script.getNextTag()?.values.name); // macro2
      ponkan.tmpVar.jsval = "jsvalue";
    });

    it("固定値のパラメータが渡される", () => {
      const expectedValue = "macrovalue";
      expect(script.getNextTag()?.values.text).to.equals("マクロ1-1");
      expect(ponkan.resource.macroParams?.val).to.equals(expectedValue);
      expect(script.getNextTag()?.values.text).to.equals("マクロ2");
      expect(ponkan.resource.macroParams?.val).to.equals(expectedValue);
      expect(script.getNextTag()?.values.text).to.equals("マクロ1-2");
      expect(ponkan.resource.macroParams?.val).to.equals(expectedValue);
      script.getNextTag();
      expect(ponkan.resource.macroParams?.val).to.be.undefined;
    });

    it("エンティティが渡される", () => {
      const expectedValue = "jsvalue";
      expect(script.getNextTag()?.values.text).to.equals("マクロ1-1");
      expect(ponkan.resource.macroParams?.jsval).to.equals(expectedValue);
      expect(script.getNextTag()?.values.text).to.equals("マクロ2");
      expect(ponkan.resource.macroParams?.jsval).to.equals(expectedValue);
      expect(script.getNextTag()?.values.text).to.equals("マクロ1-2");
      expect(ponkan.resource.macroParams?.jsval).to.equals(expectedValue);
      script.getNextTag();
      expect(ponkan.resource.macroParams?.val).to.be.undefined;
    });
  });

  // TODO for文
  context("マクロパラメータ", () => {
    let script: Script;
    const filePath = "start.pon";
    const scriptLines: string[] = [
      ';ch text: "こんにちは"',
      // dummy label
      "*before_for",
      ';for indexvar: "i", loops: 5',
      '  ;ch text: "for内"',
      ";endfor",
      "*after_for",
      ";s",
    ];
    const scriptText = scriptLines.join("\n");

    beforeEach(() => {
      script = new Script(ponkan.resource, filePath, scriptText);
    });

    it(".startForLoopでfor内に入る", () => {
      script.goToLabel("before_for");
      script.getNextTag(); // for読み捨て
      script.startForLoop(5, "index");
      expect(ponkan.tmpVar.index).to.equal(0);
      expect(script.isInsideOfForLoop()).to.be.true;
      script.endForLoop();
    });

    it(".endForLoopでforを終わる", () => {
      script.goToLabel("before_for");
      script.getNextTag(); // for読み捨て
      script.startForLoop(1, "index");
      script.getNextTag(); // ch読み捨て
      script.getNextTag(); // endfor読み捨て
      script.endForLoop();
      expect(script.isInsideOfForLoop()).to.be.false;
    });

    it("指定回数繰り返される", () => {
      script.goToLabel("before_for");
      script.getNextTag(); // for読み捨て
      script.startForLoop(5, "index");
      for (let i = 0; i < 5; i++) {
        script.getNextTag(); // ch読み捨て
        script.getNextTag(); // endfor読み捨て
        expect(script.isInsideOfForLoop()).to.be.true;
        expect(ponkan.tmpVar.index).to.equal(i);
        script.endForLoop();
      }
      expect(script.isInsideOfForLoop()).to.be.false;
    });
  });
});
