import { expect } from "chai";
import { LayerTextCanvas } from "../../src/ts/base/layer-text-canvas";
import * as PIXI from "pixi.js";

describe("LayerTextCanvas", () => {
  let ltc: LayerTextCanvas;

  beforeEach(() => {
    ltc = new LayerTextCanvas();
    ltc.width = 1000;
    ltc.height = 1000;
  });

  context("constructor", () => {
    let ltc_default: LayerTextCanvas;
    beforeEach(() => {
      ltc_default = new LayerTextCanvas();
    });

    it("初期状態ではテキストは空", () => {
      expect(ltc_default.text).to.be.equals("");
    });

    it("幅は32", () => {
      expect(ltc_default.width).to.be.equals(32);
    });

    it("高さは32", () => {
      expect(ltc_default.height).to.be.equals(32);
    });

    it("テキストは空", () => {
      expect(ltc_default.text).to.be.equals("");
    });
  });

  context("addTo", () => {
    it("指定のContainerに追加されること", () => {
      const container = new PIXI.Container();
      ltc.addTo(container);
      expect(container.children.length).to.be.equals(1);
      expect(container.children[0]).to.be.equals(ltc.container);
    });
  });

  context("currentLine", () => {
    it("初期状態では空の行が返る", () => {
      expect(ltc.currentLine.length).to.be.equals(0);
    });

    it("現在の行が返る", () => {
      ltc.addText("あいうえお");
      ltc.addTextReturn();
      ltc.addText("かきくけこ");
      expect(ltc.currentLine.text).to.be.equals("かきくけこ");
    });
  });

  context("addText", () => {
    it("複数の文字登録ができる", () => {
      ltc.addText("あいうえお");
      expect(ltc.currentLine.text).to.be.equals("あいうえお");
    });
  });

  context("addChar", () => {
    it("addChar", () => {
      ltc.addText("あいうえお");
      expect(ltc.currentLine.text).to.be.equals("あいうえお");
    });
  });

  context("getNextTextPos", () => {
    beforeEach(() => {
      ltc.style.fontSize = 20;
      ltc.style.lineHeight = 30;
      ltc.clear();
    });

    context("初期状態", () => {
      it("左揃えの時", () => {
        const pos = ltc.getNextTextPos(10);
        expect(pos.newLineFlag).to.be.equals(false);
        expect(pos.x).to.be.equals(ltc.marginLeft);
        expect(pos.y).to.be.equals(ltc.currentLine.y);
      });

      it("右揃えの時", () => {
        ltc.align = "right";
        ltc.clear();
        const pos = ltc.getNextTextPos(10);
        expect(pos.newLineFlag).to.be.equals(false);
        expect(pos.x).to.be.equals(ltc.width - ltc.marginRight);
        expect(pos.y).to.be.equals(ltc.currentLine.y);
      });

      it("中央揃えの時", () => {
        ltc.align = "center";
        ltc.clear();
        const pos = ltc.getNextTextPos(10);
        expect(pos.newLineFlag).to.be.equals(false);
        expect(pos.x).to.be.equals(ltc.width / 2 + 5);
        expect(pos.y).to.be.equals(ltc.currentLine.y);
      });
    });
    context("文字追加済みの時", () => {
      it("左揃えの時", () => {
        ltc.clear();
        ltc.addChar("あ");
        const right = ltc.currentLine.x + ltc.currentLine.width;
        const pos = ltc.getNextTextPos(10);
        expect(pos.newLineFlag).to.be.equals(false);
        expect(pos.x).to.be.equals(right);
        expect(pos.y).to.be.equals(ltc.currentLine.y);
      });

      it("右揃えの時", () => {
        ltc.align = "right";
        ltc.clear();
        ltc.addChar("あ");
        const pos = ltc.getNextTextPos(10);
        const right = ltc.currentLine.x + ltc.currentLine.width;
        expect(pos.newLineFlag).to.be.equals(false);
        expect(pos.x).to.be.equals(right);
        expect(pos.y).to.be.equals(ltc.currentLine.y);
      });

      it("中央揃えの時", () => {
        ltc.align = "center";
        ltc.clear();
        ltc.addChar("あ");
        const aWidth = ltc.currentLine.width;
        const pos = ltc.getNextTextPos(10);
        const right = ltc.currentLine.x + ltc.currentLine.width;
        expect(pos.newLineFlag).to.be.equals(false);
        expect(pos.x).to.be.equals(ltc.width / 2 + aWidth / 2 + 5);
        expect(pos.y).to.be.equals(ltc.currentLine.y);
      });
    });
  });

  context("addTextReturn", () => {
    beforeEach(() => {
      ltc.style.fontSize = 20;
      ltc.style.lineHeight = 30;
      ltc.clear();
    });

    it("新しい行になること", () => {
      ltc.addText("あいうえお");
      expect(ltc.currentLine.text).to.be.equals("あいうえお");
      ltc.addTextReturn();
      expect(ltc.currentLine.text).to.be.equals("");
    });

    it("新しい行に文字が追加されること", () => {
      ltc.addText("あいうえお");
      expect(ltc.currentLine.text).to.be.equals("あいうえお");
      ltc.addTextReturn();
      ltc.addText("かきくけこ");
      expect(ltc.currentLine.text).to.be.equals("かきくけこ");
    });

    it("改行が挿入されていること", () => {
      ltc.addText("あいうえお");
      ltc.addTextReturn();
      ltc.addText("かきくけこ");
      expect(ltc.text).to.be.equals("あいうえお\nかきくけこ");
    });

    // TODO: 文字揃え位置ごとの確認
    // TODO: 可能なら改行後の位置など
  });

  context("setCharLocate", () => {
    it("指定した位置から文字が追加されること", () => {
      ltc.setCharLocate(100, 200);
      ltc.addText("あいうえお");
      expect(ltc.currentLine.x).to.be.equals(100);
      expect(ltc.currentLine.y).to.be.equals(200);
    });

    // TODO: 文字揃え位置ごとの確認
  });

  context("setIndentPoint", () => {
    it("改行後に指定位置から始まること", () => {
      ltc.addText("あいうえお");
      ltc.setIndentPoint();
      const indentX = ltc.currentLine.x + ltc.currentLine.width;
      ltc.addText("かきくけこ");
      ltc.addTextReturn();
      expect(ltc.currentLine.x).to.be.equals(indentX);
    });

    // TODO: 文字揃え位置ごとの確認
  });

  context("clearIndentPoint", () => {
    it("インデント位置がクリアされること", () => {
      ltc.addText("あいうえお");
      ltc.setIndentPoint();
      ltc.addText("かきくけこ");
      ltc.clearIndentPoint();
      ltc.addTextReturn();
      expect(ltc.currentLine.x).to.be.equals(ltc.marginLeft);
    });

    // TODO: 文字揃え位置ごとの確認
  });

  context("reserveRubyText", () => {
    it("次の文字にルビが設定されること", () => {
      ltc.addText("あいうえお");
      ltc.reserveRubyText("おとこ");
      ltc.addText("漢");
      expect(ltc.currentLine.ruby).to.be.equals("おとこ");
    });
  });

  context("clear", () => {
    let indentX: number = 0;
    beforeEach(() => {
      ltc.addText("あいうえお");
      ltc.setIndentPoint();
      indentX = ltc.currentLine.x + ltc.currentLine.width;
      ltc.addText("かきくけこ");
      ltc.addTextReturn();
      ltc.addText("さしすせそ");
      ltc.reserveRubyText("おとこ");
      ltc.addText("漢");
    });

    it("テキストがクリアされること", () => {
      ltc.clear();
      expect(ltc.text).to.be.equals("");
    });

    it("ルビがクリアされること", () => {
      ltc.clear();
      expect(ltc.currentLine.ruby).to.be.equals("");
    });

    it("テキスト開始位置がリセットされること", () => {
      // TODO: 文字揃え位置ごとの確認
      ltc.clear();
      expect(ltc.currentLine.x).to.be.equals(ltc.marginLeft);
      expect(ltc.currentLine.y).to.be.equals(ltc.marginTop);
    });

    it("localeがリセットされること", () => {
      ltc.setCharLocate(100, 200);
      ltc.clear();
      ltc.addText("あいうえお");
      expect(ltc.currentLine.x).to.be.equals(ltc.marginLeft);
      expect(ltc.currentLine.y).to.be.equals(ltc.marginTop);
    });

    it("インデント位置がクリアされること", () => {
      ltc.clear();
      expect(ltc.currentLine.x).to.be.equals(ltc.marginLeft);
    });
  });

  context("store/restore", () => {
    // TODO: store/restoreのテスト
  });
});
