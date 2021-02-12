import { expect } from "chai";
import { PonVideo, IPonVideoCallbacks } from "../../src/ts/base/pon-video";
import * as PIXI from "pixi.js";

describe("PonVideo", () => {
  class VideoParent implements IPonVideoCallbacks {
    public children: PIXI.DisplayObject[] = [];

    public pixiContainerAddChild(child: PIXI.DisplayObject): void {
      this.children.push(child);
    }

    public pixiContainerRemoveChild(child: PIXI.DisplayObject): void {
      if (this.children.length == 0) {
        throw new Error("pixiContainerRemoveChild: addとremoveが対応していない。");
      } else {
        this.children = this.children.filter((c) => c != child);
      }
    }
  }

  let parent: VideoParent;
  let texture: PIXI.Texture;
  let pv: PonVideo;
  let destroyed: boolean;
  const VideoPath = "testdata/video.mp4";

  const loadVideoTexture = (): PIXI.Texture => {
    const texture: PIXI.Texture = PIXI.Texture.from(VideoPath, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });
    (texture.baseTexture.resource as PIXI.resources.VideoResource).autoPlay = false;
    return texture;
  };

  beforeEach(() => {
    parent = new VideoParent();
    texture = loadVideoTexture();
    pv = new PonVideo(texture, parent);
    destroyed = false;
  });

  afterEach(() => {
    if (!destroyed) {
      pv.destroy();
    }
  });

  context("正常系", () => {
    it("テクスチャが設定されている", () => {
      expect(pv.texture).to.be.equals(texture);
    });

    it("スプライトが設定されている", () => {
      expect(pv.sprite).not.to.be.null;
      expect(pv.sprite.texture).to.be.equals(texture);
    });

    it("HTMLVideoElementが取得できる", () => {
      expect(pv.source).not.to.be.null;
    });

    it("再生中かどうか取得できる", async () => {
      return new Promise((resolve) => {
        expect(pv.playing).to.be.false;
        pv.play();
        expect(pv.playing).to.be.true;
        setTimeout(() => {
          pv.stop();
          expect(pv.playing).to.be.false;
          resolve();
        }, 200);
      });
    });

    it("一時停止できる", () => {
      return new Promise((resolve) => {
        pv.play();
        expect(pv.playing).to.be.true;
        setTimeout(() => {
          pv.pause();
          expect(pv.playing).to.be.false;
          setTimeout(() => {
            pv.play();
            expect(pv.playing).to.be.true;
            resolve();
          }, 200);
        }, 200);
      });
    });

    it("サイズを設定できる", () => {
      pv.width = 100;
      expect(pv.width).to.be.equals(100);
      pv.height = 200;
      expect(pv.height).to.be.equals(200);
    });

    it("ループ再生を設定できる", () => {
      pv.loop = false;
      expect(pv.loop).to.be.false;
      pv.loop = true;
      expect(pv.loop).to.be.true;
    });

    it("ボリュームを設定できる", () => {
      pv.volume = -0.5;
      expect(pv.volume).to.be.equals(0);
      pv.volume = 0;
      expect(pv.volume).to.be.equals(0);
      pv.volume = 0.5;
      expect(pv.volume).to.be.equals(0.5);
      pv.volume = 1.0;
      expect(pv.volume).to.be.equals(1.0);
      pv.volume = 1.5;
      expect(pv.volume).to.be.equals(1.0);
    });
  });
});
