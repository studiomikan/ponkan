import { Howl, Howler } from 'howler';


export class Sound {
  public filePath: string;
  protected howl: Howl;

  public constructor(filePath: string, howl: Howl) {
    this.filePath = filePath;
    this.howl = howl;
  }

  public play() {
    this.howl.play();
  }

  public stop() {
    this.howl.stop();
  }


}

export class SoundBuffer {
}


