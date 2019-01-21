import { assert } from "chai";
import { Ponkan3 } from "../src/ponkan3";
import { PonLayer } from "../src/layer/pon-layer";
import { ScriptParserTest } from "./base/script-parser.test";

ScriptParserTest();

describe("Ponkan3のテスト", function() {
  let ponkan: Ponkan3;

  beforeEach(() => {
    ponkan = new Ponkan3("game");
  });

  afterEach(() => {
    try {
      ponkan.destroy();
    } catch (e) {
      console.error(e);
    }
  });

  describe("レイヤ取得関係", () => {
    it("1", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: 1});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, "fore layer 1");
    });
    it("message", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: "message"});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, ponkan.messageLayer.name);
    });
    it("linebreak", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: "linebreak"});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, ponkan.lineBreakGlyphLayer.name);
    });
    it("page", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: "pagebreak"});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, ponkan.pageBreakGlyphLayer.name);
    });
    it("fore 5", function() {
      let layers: PonLayer[] = ponkan.getLayers({page: "fore", lay: 5});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, "fore layer 5");
    });
    it("back 10", function() {
      let layers: PonLayer[] = ponkan.getLayers({page: "back", lay: "10"});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 1);
      assert.equal(layers[0].name, "back layer 10");
    });
    it("1,3,5", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: "1,3,5"});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 3);
      assert.equal(layers[0].name, "fore layer 1");
      assert.equal(layers[1].name, "fore layer 3");
      assert.equal(layers[2].name, "fore layer 5");
    });
    it("0-4", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: "0-4"});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 5);
      assert.equal(layers[0].name, "fore layer 0");
      assert.equal(layers[1].name, "fore layer 1");
      assert.equal(layers[2].name, "fore layer 2");
      assert.equal(layers[3].name, "fore layer 3");
      assert.equal(layers[4].name, "fore layer 4");
    });
    it("0-2  ,4-5, 10 ", function() {
      let layers: PonLayer[] = ponkan.getLayers({lay: "0-2  ,4-5, 10 "});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 6);
      assert.equal(layers[0].name, "fore layer 0");
      assert.equal(layers[1].name, "fore layer 1");
      assert.equal(layers[2].name, "fore layer 2");
      assert.equal(layers[3].name, "fore layer 4");
      assert.equal(layers[4].name, "fore layer 5");
      assert.equal(layers[5].name, "fore layer 10");
    });
    it("0-2  ,4-5, mes ", function() {
      ponkan._messageLayerNum = 10
      let layers: PonLayer[] = ponkan.getLayers({lay: "0-2  ,4-5, mes "});
      assert.isNotEmpty(layers);
      assert.equal(layers.length, 6);
      assert.equal(layers[0].name, "fore layer 0");
      assert.equal(layers[1].name, "fore layer 1");
      assert.equal(layers[2].name, "fore layer 2");
      assert.equal(layers[3].name, "fore layer 4");
      assert.equal(layers[4].name, "fore layer 5");
      assert.equal(layers[5].name, "fore layer 10");
    });
  });
});
