import { assert } from "chai";
import { PonLayer } from "../src/ts/layer/pon-layer";
import { Ponkan3 } from "../src/ts/ponkan3";
import { Ponkan3Settings } from "./settings";

describe("Ponkan3のテスト", () => {
  let ponkan: Ponkan3;

  before(() => {
    ponkan = new Ponkan3("ponkan3game", Ponkan3Settings);
  });

  after(() => {
    try {
      ponkan.destroy();
    } catch (e) {
      console.error(e);
    }
  });

  describe("レイヤ取得関係", () => {
    it("1", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: 1 });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, "fore layer 1");
    });
    it("message", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "message" });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, ponkan.messageLayer.name);
    });
    it("linebreak", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "linebreak" });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, ponkan.lineBreakGlyphLayer.name);
    });
    it("page", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "pagebreak" });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, ponkan.pageBreakGlyphLayer.name);
    });
    it("fore 5", () => {
      const layers: PonLayer[] = ponkan.getLayers({ page: "fore", lay: 5 });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, "fore layer 5");
    });
    it("back 10", () => {
      const layers: PonLayer[] = ponkan.getLayers({ page: "back", lay: "10" });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, "back layer 10");
    });
    it("1,3,5", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "1,3,5" });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 3);
      assert.equal(layers[0].name, "fore layer 1");
      assert.equal(layers[1].name, "fore layer 3");
      assert.equal(layers[2].name, "fore layer 5");
    });
    it("0-4", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "0-4" });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 5);
      assert.equal(layers[0].name, "fore layer 0");
      assert.equal(layers[1].name, "fore layer 1");
      assert.equal(layers[2].name, "fore layer 2");
      assert.equal(layers[3].name, "fore layer 3");
      assert.equal(layers[4].name, "fore layer 4");
    });
    it("0-2  ,4-5, 10 ", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "0-2  ,4-5, 10 " });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 6);
      assert.equal(layers[0].name, "fore layer 0");
      assert.equal(layers[1].name, "fore layer 1");
      assert.equal(layers[2].name, "fore layer 2");
      assert.equal(layers[3].name, "fore layer 4");
      assert.equal(layers[4].name, "fore layer 5");
      assert.equal(layers[5].name, "fore layer 10");
    });
    it("0-2  ,4-5, mes ", () => {
      const layers: PonLayer[] = ponkan.getLayers({ lay: "0-2  ,4-5, mes " });
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 6);
      assert.equal(layers[0].name, "fore layer 0");
      assert.equal(layers[1].name, "fore layer 1");
      assert.equal(layers[2].name, "fore layer 2");
      assert.equal(layers[3].name, "fore layer 4");
      assert.equal(layers[4].name, "fore layer 5");
      assert.equal(layers[5].name, "fore layer " + ponkan.messageLayerNum);
    });
  });
});
