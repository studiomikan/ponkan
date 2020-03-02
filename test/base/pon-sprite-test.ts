import { expect } from "chai";
import { PonSprite, IPonSpriteCallbacks, SpriteType } from "../../src/ts/base/pon-sprite";
import * as PIXI from "pixi.js";

describe("PonSprite", () => {
  class SpriteParent implements IPonSpriteCallbacks {
    public children: PIXI.DisplayObject[] = [];

    public pixiContainerAddChild(child: PIXI.DisplayObject): void {
      this.children.push(child);
    }

    public pixiContainerRemoveChild(child: PIXI.DisplayObject): void {
      if (this.children.length == 0) {
        throw new Error("pixiContainerRemoveChild: addとremoveが対応していない。");
      } else {
        this.children = this.children.filter(c => c != child);
      }
    }
  }

  const renderer: PIXI.Renderer = new PIXI.Renderer({
    width: 800,
    height: 600,
    backgroundColor: 0xff000000,
  });
  let parent: SpriteParent;
  let ps: PonSprite;
  let destroyed: boolean;
  const ImagePath = "testdata/ponkan-icon.png";

  const getContext = (target: PIXI.DisplayObject): CanvasRenderingContext2D => {
    const extract = renderer.plugins.extract;
    const canvas = extract.canvas(target);
    const context = canvas.getContext("2d");
    if (context == null) {
      throw Error("Context取得に失敗");
    }
    return context;
  };

  const getPixelData = (ps: PonSprite, x: number, y: number): number[] => {
    if (ps.pixiDisplayObject == null) {
      throw new Error("PonSpriteに画像などが読み込まれていない");
    }
    const p = getContext(ps.pixiDisplayObject).getImageData(x, y, 1, 1).data;
    return [p[0], p[1], p[2], p[3]];
  };

  const loadImage = (): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
      const image = new Image();
      image.src = ImagePath;
      image.onload = (): void => {
        resolve(image);
      };
    });
  };

  beforeEach(() => {
    parent = new SpriteParent();
    ps = new PonSprite(parent);
    destroyed = false;
  });

  afterEach(() => {
    if (!destroyed) {
      ps.destroy();
    }
  });

  context(".fillColor", () => {
    it("親コンテナに追加される", () => {
      ps.fillColor(0xff0000, 1.0);
      expect(parent.children.length).to.be.equals(1);
    });

    it("タイプが設定される", async () => {
      ps.fillColor(0x00ff00, 1.0);
      expect(ps.spriteType).to.be.equals(SpriteType.Color);
    });

    it("単色で塗りつぶせる", () => {
      ps.fillColor(0x0000ff, 1.0);
      const pixelData = getPixelData(ps, 0, 0);
      expect(pixelData).to.deep.equals([0, 0, 255, 255]);
    });

    it("Alpha値を指定して塗りつぶせる", () => {
      ps.fillColor(0x102030, 0.5);
      const pixelData = getPixelData(ps, 0, 0);
      expect(pixelData).to.deep.equals([16, 32, 48, 127]);
    });

    context("画像が読み込まれている状態での操作", () => {
      beforeEach(() => {
        ps.fillColor(0x102030, 1.0);
      });

      it("座標が変更できる", () => {
        ps.x = 100;
        ps.y = 200;
        expect(ps.x).to.be.equals(100);
        expect(ps.y).to.be.equals(200);
      });

      it("サイズが変更できる", () => {
        ps.width = 200;
        ps.height = 300;
        expect(ps.width).to.be.equals(200);
        expect(ps.height).to.be.equals(300);
      });

      it("スケーリングが変更できる", () => {
        ps.scaleX = 1.5;
        ps.scaleY = 2.0;
        expect(ps.scaleX).to.be.equals(1.5);
        expect(ps.scaleY).to.be.equals(2);
      });

      it("表示状態が切り替えられる", () => {
        ps.visible = false;
        expect(ps.visible).to.be.false;
      });

      it("削除できる", () => {
        ps.destroy();
        expect(parent.children.length).to.be.equals(0);
        expect(ps.spriteType).to.be.equals(SpriteType.Unknown);
      });
    });
  });

  context("clearColor", () => {
    it("塗りつぶしをクリアできる", () => {
      ps.fillColor(0x00ff00, 1.0);
      const p1 = getPixelData(ps, 0, 0);
      ps.clearColor();
      const p2 = getPixelData(ps, 0, 0);
      expect(p1).not.to.deep.equals(p2);
      expect(p2).to.deep.equals([0, 0, 0, 0]);
    });

    it("クリア後、再度塗りつぶせる", () => {
      ps.fillColor(0x00ff00, 1.0);
      const p1 = getPixelData(ps, 0, 0);
      ps.clearColor();
      ps.fillColor(0x00ff00, 1.0);
      const p2 = getPixelData(ps, 0, 0);
      expect(p1).to.deep.equals(p2);
    });
  });

  context("setImage", () => {
    let image: HTMLImageElement;

    beforeEach(async () => {
      image = await loadImage();
    });

    it("親コンテナに追加される", () => {
      ps.setImage(image);
      expect(parent.children.length).to.be.equals(1);
    });

    it("タイプが設定される", () => {
      ps.setImage(image);
      expect(ps.spriteType).to.be.equals(SpriteType.Image);
    });

    it("画像を設定できる", () => {
      ps.setImage(image);
      const p = getPixelData(ps, 70, 70);
      expect(p).to.deep.equals([255, 87, 34, 255]);
    });

    it("サイズが画像と同じになる", () => {
      ps.setImage(image);
      expect(ps.width).to.be.equals(image.width);
      expect(ps.height).to.be.equals(image.height);
    });

    context("画像が読み込まれている状態での操作", () => {
      beforeEach(() => {
        ps.setImage(image);
      });

      it("座標が変更できる", () => {
        ps.x = 100;
        ps.y = 200;
        expect(ps.x).to.be.equals(100);
        expect(ps.y).to.be.equals(200);
      });

      it("スケーリングが変更できる", () => {
        ps.scaleX = 1.5;
        ps.scaleY = 2.0;
        expect(ps.scaleX).to.be.equals(1.5);
        expect(ps.scaleY).to.be.equals(2);
      });

      it("スケーリングするとサイズも変わる", () => {
        ps.scaleX = 2;
        ps.scaleY = 3;
        expect(ps.width).to.be.equals(image.width * 2);
        expect(ps.height).to.be.equals(image.height * 3);
      });

      it("表示状態が切り替えられる", () => {
        ps.visible = false;
        expect(ps.visible).to.be.false;
      });

      it("削除できる", () => {
        ps.destroy();
        expect(parent.children.length).to.be.equals(0);
        expect(ps.spriteType).to.be.equals(SpriteType.Unknown);
      });
    });
  });

  context(".setCanvas", () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = 100;
      const c = canvas.getContext("2d");
      if (c == null) {
        throw Error("Context取得に失敗");
      }
      ctx = c;
    });

    afterEach(() => {
      (canvas as any) = null;
    });

    it("親コンテナに追加される", () => {
      ps.setCanvas(canvas);
      expect(parent.children.length).to.be.equals(1);
    });

    it("タイプが設定される", async () => {
      ps.setCanvas(canvas);
      expect(ps.spriteType).to.be.equals(SpriteType.Canvas);
    });

    it("キャンバスが追加できる", () => {
      ps.setCanvas(canvas);
      ctx.fillStyle = "#0000FF";
      ctx.fillRect(0, 0, 100, 100);
      const p = getPixelData(ps, 50, 50);
      expect(p).to.deep.equals([0, 0, 255, 255]);
    });

    it("サイズがキャンバスと同じになる", () => {
      canvas.width = 300;
      canvas.height = 200;
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ps.setCanvas(canvas);
      expect(ps.width).to.be.equals(300);
      expect(ps.height).to.be.equals(200);
    });

    context("キャンバスが読み込まれている状態での操作", () => {
      beforeEach(() => {
        ps.setCanvas(canvas);
      });

      it("座標が変更できる", () => {
        ps.x = 100;
        ps.y = 200;
        expect(ps.x).to.be.equals(100);
        expect(ps.y).to.be.equals(200);
      });

      it("スケーリングが変更できる", () => {
        ps.scaleX = 1.5;
        ps.scaleY = 2.0;
        expect(ps.scaleX).to.be.equals(1.5);
        expect(ps.scaleY).to.be.equals(2);
      });

      it("スケーリングするとサイズも変わる", () => {
        ps.scaleX = 2;
        ps.scaleY = 3;
        expect(ps.width).to.be.equals(canvas.width * 2);
        expect(ps.height).to.be.equals(canvas.height * 3);
      });

      it("表示状態が切り替えられる", () => {
        ps.visible = false;
        expect(ps.visible).to.be.false;
      });

      it("削除できる", () => {
        ps.destroy();
        expect(parent.children.length).to.be.equals(0);
        expect(ps.spriteType).to.be.equals(SpriteType.Unknown);
      });
    });
  });
});
