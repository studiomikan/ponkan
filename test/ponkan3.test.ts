import { assert } from "chai";
// import * as JSDOM from "jsdom.js";
// import { Ponkan3 } from "../src/ponkan3";
import { ScriptParserTest } from "./base/script-parser.test";

let window: any;
let global: any;

  // ScriptParserTest();

describe("Ponkan3のテスト", function() {

  before(function() {
    // this.pon = new Ponkan3("dummy");
    // global.document = jsdom('<html><body></body></html>')
    // global.window = document.defaultView;
    // global.navigator = window.navigator;
    // global.location = window.location;
  });

  it("1+1", function() {
    assert.equal(1+1, 2);
  });

  describe("レイヤ取得関係", function() {
    it("数字のみ", function() {
    });
  });
});

console.log("test");

