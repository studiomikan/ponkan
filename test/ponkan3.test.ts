import { assert } from "chai";

import { ScriptParserTest } from "./base/script-parser.test";

ScriptParserTest();

describe('Ponkan3のテスト', () => {
  it('1+1', () => {
    assert.equal(1+1, 2);
  });
})

console.log("test");

