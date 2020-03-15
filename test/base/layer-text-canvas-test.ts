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
        // TODO
      });
      it("中央揃えの時", () => {
        ltc.align = "center";
        ltc.clear();
      });
    });
  });

  context("addTextReturn", () => {});

  context("setCharLocate", () => {});

  context("setIndentPoint", () => {});

  context("clearIndentPoint", () => {});

  context("reserveRubyText", () => {});

  context("clear", () => {});

  context("clear", () => {});

  context("store/restore", () => {});
});
