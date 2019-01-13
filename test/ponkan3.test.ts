import { assert } from "chai";
import { Ponkan3 } from "../src/ponkan3";
import { ScriptParserTest } from "./base/script-parser.test";

ScriptParserTest();

describe("Ponkan3のテスト", function() {
  let ponkan: Ponkan3;

  beforeEach(() => {
    ponkan = new Ponkan3("game");
  });

  afterEach(() => {
    ponkan.destroy();
  });

  it("1+1", () => {
    assert.equal(1+1, 2);
  });

  describe("レイヤ取得関係", () => {
    it("数字のみ", function() {
      assert.equal(1+1, 2);
    });
  });
});


