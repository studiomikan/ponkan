import { Howl, Howler } from 'howler';
import { Logger } from './logger';
import { Resource } from './resource';
import { AsyncCallbacks } from './async-callbacks';
import { AsyncTask } from "./async-task";

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
  protected fadeTime : number = 0;
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
    this.fadeTime = time;
    this.stopAfterFade = autoStop;
    this.howl.fade(this.fadeStartVolume * this.volume2,
                   this.fadeTargetVolume * this.volume2, time);
    this._state = SoundState.Fade;
  }

  public fadein(volume: number, time: number) {
    this.stop();
    this.fadeStartVolume = 0;
    this.fadeTargetVolume = volume;
    this.fadeTime = time;
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
    this.fadeTime = time;
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

  protected static soundStoreParams: string[] = [
    "filePath",
    "bufferNum",
    "state",
    "seek",
    "loop",
    "volume",
    "volume2",
    "fadeStartVolume",
    "fadeTargetVolume",
    "fadeTime",
    "stopAfterFade",
  ];

  public store(tick: number): any {
    let data: any = {};
    let me: any = <any> this;

    Sound.soundStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });

    return data;
  }

  public restore(data: any, tick: number): void {
    let me: any = this as any;
    let ignore: string[] = [
      "state",
    ];
    let restoreParams = Sound.soundStoreParams.filter(param => ignore.indexOf(param) == -1);
    restoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    this.stop();
    if (data.state === SoundState.Play && data.loop) {
      this.play();
    }
    if (data.state === SoundState.Fade && !data.stopAfterFade && data.loop) {
      this.volume = data.fadeTargetVolume;
      this.play();
    }
    if (data.state === SoundState.Fadein && data.loop) {
      this.fadein(data.fadeTargetVolume, data.fadeTime);
    }
  }

}

export class SoundBuffer {
  public readonly bufferNum: number;
  protected resource: Resource;
  protected callbacks: ISoundCallbacks;
  protected _sound: Sound | null = null;
  public get sound(): Sound | null { return this._sound; }

  public constructor(resource: Resource, bufferNum: number, callbacks: ISoundCallbacks) {
    this.resource = resource;
    this.bufferNum = bufferNum;
    this.callbacks = callbacks;
  }

  public loadSound(filePath: string): AsyncCallbacks {
    Logger.debug("SoundBuffer.loadSound call: ", filePath);
    const cb: AsyncCallbacks = new AsyncCallbacks();
    this.resource.loadSound(filePath, this.bufferNum, this.callbacks).done((sound) => {
      Logger.debug("SoundBuffer.loadSound success: ", sound);
      this._sound = sound;
      cb.callDone(sound);
    }).fail(() => {
      Logger.debug("SoundBuffer.loadSound fail: ", filePath);
      cb.callFail();
    });
    return cb;
  }

  public unloadSound() {
    if (this._sound != null) {
      this._sound.destroy();
    }
    this._sound = null;
  }

  public store(tick: number): any {
    if (this.sound == null) {
      return { hasSound: false };
    } else {
      let data = this.sound.store(tick);
      data.hasSound = true;
      return data;
    }
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    this.unloadSound();

    if (data.hasSound) {
      asyncTask.add((params: any, index: number): AsyncCallbacks => {
        let cb = this.loadSound(data.filePath);
        cb.done((sound) => {
          sound.restore(data, tick);
        });
        return cb;
      });
    }
  }

}

