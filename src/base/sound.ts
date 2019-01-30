import { Howl, Howler } from 'howler';
import { Logger } from './logger';

export interface ISoundCallbacks {
  onFadeComplete(bufferNum: number): void;
}

export enum SoundState {
  Stop = 0,
  Play,
  Pause,
  Fade,
  Fadein,
  Fadeout
}

export class Sound {
  public readonly filePath: string;
  public readonly bufferNum: number;
  protected callbacks: ISoundCallbacks;
  protected howl: Howl;
  protected _state: SoundState = SoundState.Stop;
  protected _seek: number = 0;
  protected _loop: boolean = true;
  protected _volume: number = 1.0;
  protected _volume2: number = 1.0;
  protected fadeStartVolume: number = 0;
  protected fadeTargetVolume: number = 0;
  protected stopAfterFade: boolean = false;

  public constructor(filePath: string, howl: Howl, bufferNum: number, callbacks: ISoundCallbacks) {
    this.filePath = filePath;
    this.bufferNum = bufferNum;
    this.callbacks = callbacks;
    this.howl = howl;

    this.howl.off("playerror").on("playerror", () => {
      throw new Error(`音声の再生に失敗しました(${filePath})`);
    });

    this.howl.off("fade").on("fade", () => {
      this.onFade();
    });

    Logger.debug("new Sound: ", this.howl.state(), this.howl);
  }

  public destroy() {
    this.stop();
    this.howl.unload();
  }

  public play() {
    this.seek = 0;
    this.howl.play();
    this._state = SoundState.Play;
  }

  public stop() {
    this.howl.stop();
    if (this._state === SoundState.Fade) {
      this.volume = this.fadeTargetVolume;
    }
    this.howl.off("fade");
    this.howl.off("play");
    this._state = SoundState.Stop;
  }

  public pause() {
    this.howl.pause();
    this._state = SoundState.Pause;
  }

  public fade(volume: number, time: number, autoStop: boolean) {
    this.fadeStartVolume = this.volume;
    this.fadeTargetVolume = volume;
    this.stopAfterFade = autoStop;
    this.howl.fade(this.fadeStartVolume * this.volume2,
                   this.fadeTargetVolume * this.volume2, time);
    this._state = SoundState.Fade;
  }

  public fadein(time: number) {
    this.stop();
    this.fadeStartVolume = 0;
    this.fadeTargetVolume = 1.0;
    this.stopAfterFade = false;

    this.howl.once("play", () => {
      this.howl.fade(this.fadeStartVolume * this.volume2,
                     this.fadeTargetVolume * this.volume2, time);
    });
    this.volume = this.fadeStartVolume;
    this.play();
    this._state = SoundState.Fadein;
  }

  public fadeout(time: number, autoStop: boolean) {
    this.fadeStartVolume = this.volume;
    this.fadeTargetVolume = 0;
    this.stopAfterFade = autoStop;
    this.howl.fade(this.fadeStartVolume * this.volume2,
                   this.fadeTargetVolume * this.volume2, time);
    this._state = SoundState.Fadein;
  }

  protected onFade() {
    this._volume = this.fadeTargetVolume;
    this._state = SoundState.Play;
    if (this.stopAfterFade) {
      this.stop();
    }
    this.callbacks.onFadeComplete(this.bufferNum);
  }

  public get state(): SoundState { return this._state; }

  public set volume(volume: number) {
    this._volume = volume;
    this.howl.volume(this.volume * this.volume2);
  }
  public get volume(): number { return this._volume; }

  public set volume2(volume2: number) {
    this._volume2 = volume2;
    this.howl.volume(this.volume * this.volume2);
  }
  public get volume2(): number { return this._volume2; }


  public set seek(seek: number) { this.howl.seek(this._seek = seek); }
  public get seek(): number { return this._seek; }

  public set loop(loop: boolean) { this.howl.loop(this._loop = loop); }
  public get loop(): boolean { return this._loop; }
}

