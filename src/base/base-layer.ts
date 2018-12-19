import * as PIXI from 'pixi.js'
import {PonRenderer} from 'pon-renderer'
import {PonSprite} from 'pon-sprite'

export class BaseLayer {
  protected renderer: PonRenderer;
  protected _container: PIXI.Container;
  protected _width: number = 32;
  protected _height: number = 32;
  protected _visible: boolean = false;
  public backgroundSprite: PonSprite | null = null;
  public textSprites: PonSprite[] = [];

  public get container(): PIXI.Container{ return this._container; }
  public get width(): number { return this._width; }
  public set width(width: number) { this._width = width; }
  public get height(): number { return this._height; }
  public set height(height: number) { this._height = height; }
  public get visible(): boolean { return this._visible; }
  public set visible(visible: boolean) { this._visible= visible; }

  public constructor(renderer: PonRenderer) {
    this.renderer = renderer;
    this._container = new PIXI.Container();
    this.renderer.addChild(this._container);
  }

  public setBackgoundColor(color: number) {
  }

  public addChar(ch: string) {
  }

  public clearText() {
  }

}

