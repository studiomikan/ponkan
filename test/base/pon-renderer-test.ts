import { expect } from "chai";
import { PonRenderer } from "../../src/ts/base/pon-renderer";
import * as PIXI from "pixi.js";

describe("PonRenderer", () => {
  let parentNode: HTMLElement;
  let renderer: PonRenderer;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parentNode = document.getElementById("dummy_div")!;
    renderer = new PonRenderer(parentNode, 800, 600);
  });

  afterEach(() => {
    renderer.destroy();
  });

  const createGraphics = function(color = 0xff0000, width = 100, height = 100): PIXI.Graphics {
    const g = new PIXI.Graphics();
    g.x = 0;
    g.y = 0;
    g.width = width;
    g.height = height;
    g.lineStyle(0);
    g.beginFill(color, 1.0);
    g.drawRect(0, 0, 100, 100);
    return g;
  };

  const getContext = function(): CanvasRenderingContext2D {
    const extract = renderer.renderer.plugins.extract;
    const canvas = extract.canvas(renderer.primaryContainer);
    const context = canvas.getContext("2d");
    if (context == null) {
      throw Error("Context取得に失敗");
    }
    return context;
  };

  const getPixelData = function(x: number, y: number): number[] {
    const p = getContext().getImageData(x, y, 1, 1).data;
    return [p[0], p[1], p[2], p[3]];
  };

  context("constructor", () => {
    it("親要素にcanvasが追加される", () => {
      expect(parentNode.children.length).to.equals(1);
      expect(parentNode.children[0]).to.equals(renderer.canvasElm);
    });

    it("canvasがパラメータで指定したサイズになる", () => {
      expect(renderer.canvasElm.width).to.be.equals(800);
      expect(renderer.canvasElm.height).to.be.equals(600);
    });
  });

  context(".draw", () => {
    it("描画される", () => {
      const p1 = getPixelData(0, 0);
      renderer.foreContainer.addChild(createGraphics());
      renderer.draw();
      const p2 = getPixelData(0, 0);
      expect(p2).to.deep.equals(p2); // deep.equalsで比較すれば一致する
      expect(p2).not.to.deep.equals(p1);
    });
  });

  context("コンテナへの追加・削除ができる", () => {
    context("表用コンテナ", () => {
      it("コンテナに追加", () => {
        const container = new PIXI.Container();
        renderer.addToFore(container);
        expect(renderer.foreContainer.children.length).to.be.equals(1);
        expect(renderer.foreContainer.children[0]).to.be.equals(container);
      });
      it("コンテナから削除", () => {
        const container = new PIXI.Container();
        renderer.addToFore(container);
        expect(renderer.foreContainer.children.length).to.be.equals(1);
        renderer.removeFromFore(container);
        expect(renderer.foreContainer.children.length).to.be.equals(0);
      });
    });
    context("裏用コンテナ", () => {
      it("コンテナに追加", () => {
        const container = new PIXI.Container();
        renderer.addToBack(container);
        expect(renderer.backContainer.children.length).to.be.equals(1);
        expect(renderer.backContainer.children[0]).to.be.equals(container);
      });
      it("コンテナから削除", () => {
        const container = new PIXI.Container();
        renderer.addToBack(container);
        expect(renderer.backContainer.children.length).to.be.equals(1);
        renderer.removeFromBack(container);
        expect(renderer.backContainer.children.length).to.be.equals(0);
      });
    });
  });

  context(".setBackVisible", () => {
    it("裏コンテナの表示を設定できる", () => {
      renderer.setBackVisible(false);
      expect(renderer.backContainer.visible).to.be.false;
      renderer.setBackVisible(true);
      expect(renderer.backContainer.visible).to.be.true;
    });
  });
});
