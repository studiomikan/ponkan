import { expect } from "chai";
import { Macro } from "../../src/ts/base/macro";
import { Tag } from "../../src/ts/base/tag";

describe("Macro", () => {
  let macro: Macro;
  let tags: Tag[];

  beforeEach(() => {
    tags = [
      new Tag("ch", { text: "こ" }, 0),
      new Tag("ch", { text: "ん" }, 1),
      new Tag("ch", { text: "に" }, 2),
      new Tag("ch", { text: "ち" }, 3),
      new Tag("ch", { text: "は" }, 4),
    ];
    macro = new Macro("testmacro", tags);
  });

  context("正常系", () => {
    it("constructor", () => {
      const macro = new Macro("testmacro", tags);
      expect(macro.name).to.be.equals("testmacro");
      expect(macro.tags).to.deep.equals(tags);
    });
  });

  context(".clone", () => {
    let clone: Macro;

    beforeEach(() => {
      clone = macro.clone();
    });

    it("名前が同じ", () => {
      expect(clone.name).to.be.equals(macro.name);
    });

    it("タグ配列が同じ", () => {
      expect(clone.tags).to.deep.equals(macro.tags);
    });
  });

  context(".getCurrentTag", () => {
    it("現在のタグを取得する", () => {
      const tag: Tag | null = macro.getCurrentTag();
      if (tag == null) {
        return expect.fail();
      }
      expect(tag.name).to.be.equals("ch");
      expect(tag.values.text).to.be.equals("こ");
      macro.getNextTag(); // 読み進める
    });

    it("タグ読み進めず、何度呼んでも同じタグが返ってくる", () => {
      for (let i = 0; i < 3; i++) {
        const tag: Tag | null = macro.getCurrentTag();
        if (tag == null) {
          return expect.fail();
        }
        expect(tag.name).to.be.equals("ch");
        expect(tag.values.text).to.be.equals("こ");
      }
    });

    it("末尾まで到達している場合はnullを返す", () => {
      for (let i = 0; i < tags.length; i++) {
        macro.getNextTag();
      }
      const tag: Tag | null = macro.getCurrentTag();
      expect(tag).to.be.null;
    });
  });

  context(".getNextTag", () => {
    it("現在のタグを取得する", () => {
      const tag: Tag | null = macro.getNextTag();
      if (tag == null) {
        return expect.fail();
      }
      expect(tag.name).to.be.equals("ch");
      expect(tag.values.text).to.be.equals("こ");
    });

    it("タグ読み進めて、次のタグが返ってくる", () => {
      const tag1: Tag | null = macro.getNextTag();
      const tag2: Tag | null = macro.getNextTag();
      if (tag1 == null || tag2 == null) {
        return expect.fail();
      }
      expect(tag1.name).to.be.equals("ch");
      expect(tag1.values.text).to.be.equals("こ");
      expect(tag2.name).to.be.equals("ch");
      expect(tag2.values.text).to.be.equals("ん");
    });

    it("末尾まで到達している場合はnullを返す", () => {
      for (let i = 0; i < tags.length; i++) {
        macro.getNextTag();
      }
      const tag: Tag | null = macro.getNextTag();
      expect(tag).to.be.null;
    });
  });

  context(".clearTagPoint", () => {
    it("タグ位置をクリアして先頭に戻る", () => {
      const tag1: Tag | null = macro.getCurrentTag();
      for (let i = 0; i < tags.length; i++) {
        macro.getNextTag();
      }
      macro.clearTagPoint();
      const tag2: Tag | null = macro.getCurrentTag();
      if (tag1 == null || tag2 == null) {
        return expect.fail();
      }
      expect(tag1.name).to.be.equals("ch");
      expect(tag1.values.text).to.be.equals("こ");
      expect(tag2.name).to.be.equals("ch");
      expect(tag2.values.text).to.be.equals("こ");
      expect(tag1.equals(tag2)).to.be.true;
    });
  });
});
