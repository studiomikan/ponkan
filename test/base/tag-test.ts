import { expect } from "chai";
import { Tag } from "../../src/ts/base/tag";
import { objClone } from "../../src/ts/base/util";
import * as Helper from "../helper";

describe("Tag", () => {
  context("constructor", () => {
    let tag: Tag;
    const tagName = "testtag";
    const tagValues = { hoge: "HOGE", piyo: "PIYO" };

    beforeEach(() => {
      tag = new Tag(tagName, tagValues, 100);
    });

    it("タグ名が取得できる", () => {
      expect(tag.name).to.be.equals(tagName);
    });

    it("タグの値が取得できる", () => {
      expect(tag.values).to.deep.equals(tagValues);
    });

    it("タグの行番号が取得できる", () => {
      expect(tag.line).to.deep.equals(tag.line);
    });
  });

  context(".clone", () => {
    let tag: Tag;
    let clone: Tag;
    const tagName = "testtag";
    const tagValues = { hoge: "HOGE", piyo: "PIYO" };

    beforeEach(() => {
      tag = new Tag(tagName, tagValues, 100);
      clone = tag.clone();
    });

    it("異なるインスタンスである", () => {
      expect(clone).not.to.be.equals(tag);
    });

    it("タグ名が一致する", () => {
      expect(clone.name).to.be.equals(tag.name);
    });

    it("タグの値が一致する", () => {
      expect(clone.values).to.deep.equals(tag.values);
    });

    it("タグの行番号が一致する", () => {
      expect(clone.line).to.deep.equals(tag.line);
    });
  });

  context(".equals", () => {
    let tag1: Tag;
    const tagName = "testtag";
    const tagValues = { hoge: "HOGE", piyo: "PIYO" };
    const tagValues2 = { hoge: "HOGE", piyo: "piyo" };

    beforeEach(() => {
      tag1 = new Tag(tagName, tagValues, 100);
    });

    it("同一インスタンスなら同値と判定される", () => {
      expect(tag1.equals(tag1)).to.be.true;
    });

    it("すべての値が同じなら同値と判定される", () => {
      const tag2: Tag = new Tag(tagName, tagValues, 100);
      expect(tag1.equals(tag2)).to.be.true;
    });

    it("名前が異なるときfalse", () => {
      const tag2: Tag = new Tag(tagName + "hoge", tagValues, 100);
      expect(tag1.equals(tag2)).to.be.false;
    });

    it("値が異なるときfalse", () => {
      const tag2: Tag = new Tag(tagName, tagValues2, 100);
      expect(tag1.equals(tag2)).to.be.false;
    });

    it("行番号だけが異なるときはtrue", () => {
      const tag2: Tag = new Tag(tagName, tagValues, 200);
      expect(tag1.equals(tag2)).to.be.true;
    });
  });
});
