import { Logger } from "./logger";
import { Resource } from "./resource";

export interface IOnSoundStopParams {
  bufferNum: number;
  stopBy: string;
  jump: boolean;
  call: boolean;
  file: string | null;
  label: string | null;
}

export interface ISoundBufferCallbacks {
  onStop(param: IOnSoundStopParams): void;
  onFadeComplete(bufferNum: number): void;
}

export enum SoundState {
  Stop = 0,
  Play,
  Pause,
  Fade,
  Fadein,
  Fadeout,
}

export class SoundBuffer {
  public readonly bufferNum: number;
  protected callback: ISoundBufferCallbacks;
  protected resource: Resource;

  // TODO: readonlyにする
  public howl: Howl | null = null;
  public filePath: string | null = null;

  protected _state: SoundState = SoundState.Stop;
  protected _volume: number = 1.0;
  protected _gvolume: number = 1.0;
  protected _seek: number = 0;
  protected _loop: boolean = false;
  protected fadeStartVolume: number = 0;
  protected fadeTargetVolume: number = 0;
  protected fadeTime: number = 0;
  protected stopAfterFade: boolean = false;

  public onStopJump: boolean = false;
  public onStopCall: boolean = false;
  public onStopExp: string | null = null;
  public onStopFile: string | null = null;
  public onStopLabel: string | null = null;

  public constructor(resource: Resource, bufferNum: number, callback: ISoundBufferCallbacks) {
    this.resource = resource;
    this.bufferNum = bufferNum;
    this.callback = callback;
  }

  public async loadSound(filePath: string): Promise<void> {
    Logger.debug("SoundBuffer.loadSound call: ", filePath);
    this.filePath = filePath;

    try {
      this.stop("loadSound");
      this.howl = await this.resource.loadSoundHowler(filePath);
      Logger.debug("SoundBuffer.loadSound success: ", this.howl);
      this.setHowlerEvent();
      this.setHowlerOptions();
    } catch (e) {
      Logger.debug("SoundBuffer.loadSound fail: ", filePath);
      throw e;
    }
  }

  public get hasSound(): boolean {
    return this.howl != null;
  }

  public freeSound(): void {
    this.stop("freeSound");
    this.filePath = null;
    if (this.howl != null) {
      this.howl.unload();
      this.howl = null;
    }
  }

  public clearOnStop(): void {
    this.onStopJump = false;
    this.onStopCall = false;
    this.onStopExp = null;
    this.onStopFile = null;
    this.onStopLabel = null;
  }

  protected setHowlerEvent(): void {
    if (this.howl != null) {
      this.howl.off("playerror").on("playerror", () => {
        throw new Error(`音声の再生に失敗しました(${this.filePath})`);
      });
      this.howl.off("end").on("end", () => {
        if (!this.loop) {
          this.stop("onEndEvent");
        }
      });
      this.howl.off("fade").on("fade", () => {
        this.onFade();
      });
    }
  }

  protected setHowlerOptions(): void {
    if (this.howl != null) {
      this.volume = this._volume;
      this.gvolume = this._gvolume;
      this.seek = this._seek;
      this.loop = this._loop;
    }
  }

  public get state(): SoundState {
    return this._state;
  }

  public get volume(): number {
    return this._volume;
  }
  public set volume(volume: number) {
    if (volume < 0) {
      volume = 0;
    }
    if (volume > 1) {
      volume = 1;
    }
    this._volume = volume;
    if (this.howl != null) {
      this.howl.volume(this.volume * this.gvolume);
    }
  }

  public get gvolume(): number {
    return this._gvolume;
  }
  public set gvolume(gvolume: number) {
    if (gvolume < 0) {
      gvolume = 0;
    }
    if (gvolume > 1) {
      gvolume = 1;
    }
    this._gvolume = gvolume;
    if (this.howl != null) {
      this.howl.volume(this.volume * this.gvolume);
    }
  }

  public get seek(): number {
    return this._seek;
  }
  public set seek(seek: number) {
    this._seek = seek;
    if (this.howl != null) {
      this.howl.seek(seek);
    }
  }

  public get loop(): boolean {
    return this._loop;
  }
  public set loop(loop: boolean) {
    this._loop = loop;
    if (this.howl != null) {
      this.howl.loop(loop);
    }
  }

  public get playing(): boolean {
    return (
      this._state === SoundState.Play ||
      this._state === SoundState.Fade ||
      this._state === SoundState.Fadein ||
      this._state === SoundState.Fadeout
    );
  }

  public get fading(): boolean {
    return this._state === SoundState.Fade || this._state === SoundState.Fadein || this._state === SoundState.Fadeout;
  }

  public play(): void {
    if (this.howl == null) {
      return;
      // throw new Error("音声が読み込まれていません");
    }
    if (this.fading) {
      this.endFade();
    }
    if (this.playing) {
      this.stop("play");
    }
    this.setHowlerEvent();
    this.setHowlerOptions();
    this.howl.play();
    this._state = SoundState.Play;
  }

  public stop(stopBy = "unknown"): void {
    if (this.howl != null) {
      this.howl.stop();
      this.howl.off("fade");
      this.howl.off("play");
      this.howl.off("end");
    }
    if (this._state === SoundState.Fade) {
      this.volume = this.fadeTargetVolume;
    }
    this._state = SoundState.Stop;
    if (this.onStopExp !== null) {
      this.resource.evalJs(this.onStopExp);
    }
    this.callback.onStop({
      bufferNum: this.bufferNum,
      stopBy: stopBy,
      jump: this.onStopJump,
      call: this.onStopCall,
      file: this.onStopFile,
      label: this.onStopLabel,
    });
    this.clearOnStop();
  }

  public pause(): void {
    if (this.howl == null) {
      return;
      // throw new Error("音声が読み込まれていません");
    }
    this.setHowlerEvent();
    this.howl.pause();
    this._state = SoundState.Pause;
  }

  public fade(volume: number, time: number, autoStop: boolean): void {
    if (this.howl == null) {
      return;
      // throw new Error("音声が読み込まれていません");
    }
    this.fadeStartVolume = this.volume;
    this.fadeTargetVolume = volume;
    this.fadeTime = time;
    this.stopAfterFade = autoStop;
    this.setHowlerEvent();
    this.setHowlerOptions();
    this.howl.fade(this.fadeStartVolume * this.gvolume, this.fadeTargetVolume * this.gvolume, time);
    this._state = SoundState.Fade;
  }

  public fadein(volume: number, time: number): void {
    if (this.howl == null) {
      return;
      // throw new Error("音声が読み込まれていません");
    }
    this.stop("fadein");
    this.fadeStartVolume = 0;
    this.fadeTargetVolume = volume;
    this.fadeTime = time;
    this.stopAfterFade = false;

    this.howl.once("play", () => {
      this.setHowlerEvent();
      if (this.howl != null) {
        this.howl.fade(this.fadeStartVolume * this.gvolume, this.fadeTargetVolume * this.gvolume, time);
      }
    });
    this.volume = this.fadeStartVolume;
    this.play();
    this._state = SoundState.Fadein;
  }

  public fadeout(time: number, autoStop: boolean): void {
    if (this.howl == null) {
      return;
      // throw new Error("音声が読み込まれていません");
    }
    this.fadeStartVolume = this.volume;
    this.fadeTargetVolume = 0;
    this.fadeTime = time;
    this.stopAfterFade = autoStop;
    this.setHowlerEvent();
    this.howl.fade(this.fadeStartVolume * this.gvolume, this.fadeTargetVolume * this.gvolume, time);
    this._state = SoundState.Fadeout;
  }

  public endFade(): void {
    if (!this.fading) {
      return;
    }
    this._volume = this.fadeTargetVolume;
    if (this.stopAfterFade) {
      this.stop("endFade");
    } else {
      this._state = SoundState.Play;
    }
  }

  protected onFade(): void {
    if (!this.fading) {
      return;
    }
    this.endFade();
    this.callback.onFadeComplete(this.bufferNum);
  }

  protected static soundBufferStoreParams: string[] = [
    "hasSound",
    "filePath",
    "bufferNum",
    "state",
    "seek",
    "loop",
    "volume",
    // "gvolume",
    "fadeStartVolume",
    "fadeTargetVolume",
    "fadeTime",
    "stopAfterFade",
    "jump",
    "call",
    "onStopExp",
    "onStopFile",
    "onStopLabel",
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public store(tick: number): any {
    const data: any = {};
    const me: any = this as any;

    SoundBuffer.soundBufferStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });

    return data;
  }

  public async restore(data: any, tick: number): Promise<void> {
    const me: any = this as any;
    const ignore: string[] = ["hasSound", "state"];
    const restoreParams = SoundBuffer.soundBufferStoreParams.filter(param => ignore.indexOf(param) === -1);
    restoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    this.stop("restore");

    if (data.hasSound) {
      await this.loadSound(data.filePath);
      this.restoreAfterLoad(data, tick);
    } else {
      this.restoreAfterLoad(data, tick);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public restoreAfterLoad(data: any, tick: number): void {
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

  public storeSystem(): any {
    return {
      gvolume: this.gvolume,
    };
  }

  public restoreSystem(data: any): void {
    if (data != null && data.gvolume != null) {
      this.gvolume = data.gvolume;
    }
  }
}
