import { assert } from "chai";
import { ScriptParser } from "../../src/base/script-parser.ts";

let testScript = `
#コメント行
;layout { "width":100, "height":200, "visible":true }
`;

export function ScriptParserTest() {
  describe('ScriptParserのテスト', () => {

    beforeEach(() => {
    });
    it('1+1', () => {
      assert.equal(1+1, 2);
    });
    it('パース', () => {
      let sp = new ScriptParser(testScript);
      assert.isNotNull(sp);
    });
  });
}

