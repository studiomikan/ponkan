import { Howl, Howler } from 'howler';
import { Logger } from './logger';


export class Sound {
  public filePath: string;
  protected howl: Howl;

  public constructor(filePath: string, howl: Howl) {
    this.filePath = filePath;
    this.howl = howl;

    this.howl.off("playerror").on("playerror", () => {
      throw new Error(`音声の再生に失敗しました(${filePath})`);
    });

    Logger.debug("new Sound: ", this.howl.state(), this.howl);
  }

  public play() {
    if (!this.howl.playing()) {
      this.howl.play();
    }
  }

  public stop() {
    if (this.howl.playing()) {
      this.howl.stop();
    }
  }


}

