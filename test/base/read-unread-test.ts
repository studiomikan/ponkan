import { expect } from "chai";
import { Ponkan } from "../../src/ts/ponkan";
import { ReadUnread } from "../../src/ts/base/read-unread";
import { Script } from "../../src/ts/base/script";
import { objClone } from "../../src/ts/base/util";
import * as Helper from "../helper";

describe("ReadUnread", () => {
  let ponkan: Ponkan;
  let readUnread: ReadUnread;
  let script1: Script;
  let script2: Script;

  before(() => {
    ponkan = Helper.createPonkan();
    script1 = new Script(ponkan.resource, "script1.pon", "スクリプト1\n;s");
    script2 = new Script(ponkan.resource, "script2.pon", "スクリプト2\n;s");
  });

  after(() => {
    Helper.destroyPonkan(ponkan);
  });

  beforeEach(() => {
    ponkan.resource.tmpVar = {};
    ponkan.resource.gameVar = {};
    ponkan.resource.systemVar = {};
    readUnread = new ReadUnread(ponkan.resource);
  });

  afterEach(() => {
    ponkan.resource.clearMacroInfo();
  });

  const snapSystemVar = (): any => {
    return objClone(ponkan.systemVar);
  };

  it("記録した位置がシステム変数に保存される", () => {
    const sv1 = snapSystemVar();
    readUnread.pass(script1, "mark1");
    const sv2 = snapSystemVar();
    expect(sv2).not.to.deep.equals(sv1);
  });

  it("通過済みかどうかを取得できる", () => {
    expect(readUnread.isPassed(script1, "mark1")).to.be.false;
    readUnread.pass(script1, "mark1");
    expect(readUnread.isPassed(script1, "mark1")).to.be.true;
  });

  it("スクリプトごとに記録できる", () => {
    readUnread.pass(script1, "mark1");
    readUnread.pass(script2, "mark2");
    expect(readUnread.isPassed(script1, "mark1")).to.be.true;
    expect(readUnread.isPassed(script1, "mark2")).to.be.false;
    expect(readUnread.isPassed(script2, "mark1")).to.be.false;
    expect(readUnread.isPassed(script2, "mark2")).to.be.true;
  });


  it("スクリプトごとに通過済みをクリアできる", () => {
    readUnread.pass(script1, "mark1");
    readUnread.pass(script2, "mark1");
    readUnread.clear(script1);
    expect(readUnread.isPassed(script1, "mark1")).to.be.false;
    expect(readUnread.isPassed(script2, "mark1")).to.be.true;
  });

  it("すべての通過済みをクリアできる", () => {
    readUnread.pass(script1, "mark1");
    readUnread.pass(script1, "mark2");
    readUnread.pass(script2, "mark1");
    readUnread.pass(script2, "mark2");
    readUnread.clearAll();
    expect(readUnread.isPassed(script1, "mark1")).to.be.false;
    expect(readUnread.isPassed(script1, "mark2")).to.be.false;
    expect(readUnread.isPassed(script2, "mark1")).to.be.false;
    expect(readUnread.isPassed(script2, "mark2")).to.be.false;
  });

});
