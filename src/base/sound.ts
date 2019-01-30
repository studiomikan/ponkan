import { Howl, Howler } from 'howler';
import { Logger } from './logger';

export enum SoundState {
  Stop = 0,
  Play,
  Pause,
  Fade,
  Fadein,
  Fadeout
}

export class Sound {
  public filePath: string;
  protected howl: Howl;
  protected _state: SoundState = SoundState.Stop;
  protected _seek: number = 0;
  protected _loop: boolean = true;

  public constructor(filePath: string, howl: Howl) {
    this.filePath = filePath;
    this.howl = howl;

    this.howl.off("playerror").on("playerror", () => {
      throw new Error(`音声の再生に失敗しました(${filePath})`);
    });

    Logger.debug("new Sound: ", this.howl.state(), this.howl);
  }

  public destroy() {
    this.stop();
    this.howl.unload();
  }

  public play() {
    if (!this.howl.playing()) {
      this.howl.play();
      this._state = SoundState.Play;
    }
  }

  public stop() {
    if (this.howl.playing()) {
      this.howl.stop();
      this._state = SoundState.Stop;
    }
  }

  public pause() {
    this.howl.pause();
    this._state = SoundState.Pause;
  }

  public get state(): SoundState { return this._state; }

  public set volume(volume: number) { this.howl.volume(volume); }
  public get volume(): number { return this.howl.volume(); }

  public set seek(seek: number) { this.howl.seek(this._seek = seek); }
  public get seek(): number { return this._seek; }

  public set loop(loop: boolean) { this.howl.loop(this._loop = loop); }
  public get loop(): boolean { return this._loop; }


  // TODO フェード
}

