import { expect } from "chai";
import { LayerTextCanvas } from "../../src/ts/base/layer-text-canvas";
import * as PIXI from "pixi.js";

describe("LayerTextCanvas", () => {
  let ltc: LayerTextCanvas;

  beforeEach(() => {
    ltc = new LayerTextCanvas();
  });

  context("constructor", () => {
    it("初期状態ではテキストは空", () => {
      expect(ltc.text).to.be.equals("");
    });

    it("幅は32", () => {
      expect(ltc.width).to.be.equals(32);
    });

    it("高さは32", () => {
      expect(ltc.height).to.be.equals(32);
    });

    it("テキストは空", () => {
      expect(ltc.text).to.be.equals("");
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

  context("addTo", () => {});
});
