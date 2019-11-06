import * as PIXI from "pixi.js";

/**
 * PonVideoのコールバック
 */
export interface IPonVideoCallbacks {
  /**
   * コンテナに動画を追加する
   * @param child 追加するスプライト
   */
  pixiContainerAddChild(child: PIXI.DisplayObject): void;
  /**
   * コンテナから動画を削除する
   * @param child 削除するスプライト
   */
  pixiContainerRemoveChild(child: PIXI.DisplayObject): void;
}


/**
 * 動画スプライト
 */
export class PonVideo {

  protected callbacks: IPonVideoCallbacks;
  protected videoTexture: PIXI.Texture;
  protected videoSprite: PIXI.Sprite;

  public get texture(): PIXI.Texture { return this.videoTexture; }
  public get sprite(): PIXI.Sprite { return this.videoSprite; }
  public get source(): HTMLVideoElement { return this.videoTexture.baseTexture.source as HTMLVideoElement; }

  public get width(): number { return this.videoSprite.width; }
  public set width(width: number) { this.videoSprite.width = width; }
  public get height(): number { return this.videoSprite.height; }
  public set height(height: number) { this.videoSprite.height = height; }

  public get loop(): boolean { return this.source.loop; }
  public set loop(loop: boolean) { this.source.loop = loop; }

  public get volume(): number { return this.source.volume; }
  public set volume(volume: number) { this.source.volume = volume; }

  public get playing(): boolean { return !this.source.ended; }

  /**
   * @param callbacks コールバック
   */
  public constructor(videoTexture: PIXI.Texture, callbacks: IPonVideoCallbacks) {
    this.callbacks = callbacks;
    this.videoTexture = videoTexture;
    this.source.preload = "auto"; // for PIXI.js bug: https://github.com/pixijs/pixi.js/issues/5996
    this.videoSprite = new PIXI.Sprite(this.videoTexture);
    this.videoSprite.width = 700;
    this.videoSprite.height = 700;
    this.callbacks.pixiContainerAddChild(this.videoSprite);
  }

  /**
   * 破棄
   */
  public destroy(): void {
    this.clear();
  }

  /**
   * スプライトをクリアする。
   * 内部で保持しているPIXIのスプライトを開放する。
   * このスプライトの保持している座標、サイズ、表示状態などはクリアされず、
   * そのままの状態を保つ。
   */
  public clear(): void {
    this.callbacks.pixiContainerRemoveChild(this.videoSprite);
    this.videoSprite.destroy();
  }

  public play(): void {
    this.source.play();
  }

  public stop(): void {
    this.source.pause();
    this.source.currentTime = 0;
  }

  public pause(): void {
    this.source.pause();
  }
}
