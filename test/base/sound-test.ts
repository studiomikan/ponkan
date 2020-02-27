import { expect } from "chai";
import { Ponkan } from "../../src/ts/ponkan";
import { SoundBuffer, ISoundBufferCallbacks, IOnSoundStopParams, SoundState } from "../../src/ts/base/sound";
import { objClone } from "../../src/ts/base/util";
import * as Helper from "../helper";

describe("SoundBuffer", () => {
  class SoundBufferParent implements ISoundBufferCallbacks {
    public calledOnStop: boolean = false;
    public onStopParams: any = null;
    public calledOnFadeComplete: boolean = false;
    public onFadeCompleteBufferNum: number | null = null;

    onStop(params: IOnSoundStopParams): void {
      this.calledOnStop = true;
      this.onStopParams = objClone(params);
    }

    onFadeComplete(bufferNum: number): void {
      this.calledOnFadeComplete = true;
      this.onFadeCompleteBufferNum = bufferNum;
    }
  }

  let ponkan: Ponkan;
  let parent: SoundBufferParent;
  let sb: SoundBuffer;
  const SoundPath = "silence.ogg";

  before(() => {
    ponkan = Helper.createPonkan();
  });

  after(() => {
    Helper.destroyPonkan(ponkan);
  });

  beforeEach(() => {
    parent = new SoundBufferParent();
    sb = new SoundBuffer(ponkan.resource, 0, parent);
  });

  context("音声読み込み", () => {
    it("読み込みができる", async () => {
      expect(sb.hasSound).to.be.false;
      expect(sb.filePath).to.be.null;
      await sb.loadSound(SoundPath);
      expect(sb.hasSound).to.be.true;
      expect(sb.filePath).to.be.equals(SoundPath);
    });

    it("解放できる", async () => {
      await sb.loadSound(SoundPath);
      expect(sb.hasSound).to.be.true;
      expect(sb.filePath).to.be.equals(SoundPath);
      sb.freeSound();
      expect(sb.hasSound).to.be.false;
      expect(sb.filePath).to.be.null;
    });
  });

  context("読み込み後の操作", () => {
    beforeEach(async () => {
      await sb.loadSound(SoundPath);
    });

    // context("状態", () => {
    //   // it("Stop", () => {});
    //   // it("Play", () => {});
    //   // it("Pause", () => {});
    //   // it("Fade", () => {});
    //   // it("Fadein", () => {});
    //   // it("Fadeout", () => {});
    // });

    context("音量", () => {
      it("volume", () => {
        sb.volume = -0.5;
        expect(sb.volume).to.be.equals(0);
        sb.volume = 0;
        expect(sb.volume).to.be.equals(0);
        sb.volume = 0.5;
        expect(sb.volume).to.be.equals(0.5);
        expect(sb.volume).not.to.be.equals(sb.gvolume);
        sb.volume = 1;
        expect(sb.volume).to.be.equals(1.0);
        sb.volume = 1.5;
        expect(sb.volume).to.be.equals(1.0);
      });

      it("gvolume", () => {
        sb.gvolume = -0.5;
        expect(sb.gvolume).to.be.equals(0);
        sb.gvolume = 0;
        expect(sb.gvolume).to.be.equals(0);
        sb.gvolume = 0.5;
        expect(sb.gvolume).to.be.equals(0.5);
        expect(sb.gvolume).not.to.be.equals(sb.volume);
        sb.gvolume = 1;
        expect(sb.gvolume).to.be.equals(1.0);
        sb.gvolume = 1.5;
        expect(sb.gvolume).to.be.equals(1.0);
      });

      it("再生中にも変更できる", () => {
        sb.play();
        sb.volume = 0.1;
        sb.gvolume = 0.9;
        expect(sb.volume).to.be.equals(0.1);
        expect(sb.gvolume).to.be.equals(0.9);
        sb.stop();
      });
    });

    context("シーク", () => {
      it("取得・変更可能", () => {
        sb.seek = 1; // 1秒
        expect(sb.seek).to.be.equals(1);
        sb.seek = 2;
        expect(sb.seek).to.be.equals(2);
        sb.seek = 3;
        expect(sb.seek).to.be.equals(3);
      });

      it("再生中でも可能", () => {
        sb.play();
        sb.seek = 1;
        expect(sb.seek).to.be.equals(1);
        sb.seek = 2;
        expect(sb.seek).to.be.equals(2);
        sb.seek = 3;
        expect(sb.seek).to.be.equals(3);
      });
    });

    context("再生", () => {
      it("停止 -> 再生", () => {
        sb.stop();
        expect(sb.state).to.be.equals(SoundState.Stop);
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
      });
      it("再生 -> 再生", () => {
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
      });
      it("一時停止 -> 再生", () => {
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
      });
      it("フェード -> 再生", () => {
        sb.play();
        sb.fade(0, 1000, false);
        expect(sb.state).to.be.equals(SoundState.Fade);
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
      });
      it("フェードイン -> 再生", () => {
        sb.play();
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
      });
      it("フェードアウト -> 再生", () => {
        sb.play();
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
      });
    });

    context("一時停止", () => {
      it("停止 -> 一時停止", () => {
        sb.stop();
        expect(sb.state).to.be.equals(SoundState.Stop);
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
      });
      it("再生 -> 一時停止", () => {
        sb.stop();
        expect(sb.state).to.be.equals(SoundState.Stop);
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
      });
      it("一時停止 -> 一時停止", () => {
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
      });
      it("フェード -> 一時停止", () => {
        sb.fade(0, 1000, false);
        expect(sb.state).to.be.equals(SoundState.Fade);
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
      });
      it("フェードイン -> 一時停止", () => {
        sb.fadein(0, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
      });
      it("フェードアウト -> 一時停止", () => {
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
      });
    });

    context("フェード", () => {
      it("停止 -> フェード", () => {
        sb.stop();
        expect(sb.state).to.be.equals(SoundState.Stop);
        sb.fade(0, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
      });
      it("再生 -> フェード", () => {
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
        sb.fade(0, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
      });
      it("一時停止 -> フェード", () => {
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
        sb.fade(0, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
      });
      it("フェード -> フェード", () => {
        sb.fade(1, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
        sb.fade(0, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
      });
      it("フェードイン -> フェード", () => {
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
        sb.fade(0, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
      });
      it("フェードアウト -> フェード", () => {
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
        sb.fade(0, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
      });
    });

    context("フェードイン", () => {
      it("停止 -> フェードイン", () => {
        sb.stop();
        expect(sb.state).to.be.equals(SoundState.Stop);
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
      });
      it("再生 -> フェードイン", () => {
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
      });
      it("一時停止 -> フェードイン", () => {
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
      });
      it("フェード -> フェードイン", () => {
        sb.fade(0, 1000, false);
        expect(sb.state).to.be.equals(SoundState.Fade);
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
      });
      it("フェードイン -> フェードイン", () => {
        sb.fadein(0, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
      });
      it("フェードアウト -> フェードイン", () => {
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
        sb.fadein(1, 1000);
        expect(sb.state).to.be.equals(SoundState.Fadein);
      });
    });

    context("フェードアウト", () => {
      it("停止 -> フェードアウト", () => {
        sb.stop();
        expect(sb.state).to.be.equals(SoundState.Stop);
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
      });
      it("再生 -> フェードアウト", () => {
        sb.play();
        expect(sb.state).to.be.equals(SoundState.Play);
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
      });
      it("一時停止 -> フェードアウト", () => {
        sb.pause();
        expect(sb.state).to.be.equals(SoundState.Pause);
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
      });
      it("フェード -> フェードアウト", () => {
        sb.fade(1, 1000, true);
        expect(sb.state).to.be.equals(SoundState.Fade);
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
      });
      it("フェードイン -> フェードアウト", () => {
        sb.fadein(1, 100);
        expect(sb.state).to.be.equals(SoundState.Fadein);
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
      });
      it("フェードアウト -> フェードアウト", () => {
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
        sb.fadeout(1000, true);
        expect(sb.state).to.be.equals(SoundState.Fadeout);
      });
    });

    context("store/restore", () => {
      // TODO:
    });
  });
});
