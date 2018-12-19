import * as PIXI from 'pixi.js'
import {PonRenderer} from 'pon-renderer'

export class PonSprite {
  private renderer: PonRenderer;
  private width: number = 0;
  private height: number = 0;
  private spriteType: string = "text";
  private pixiSprite: PIXI.Text | PIXI.Sprite | PIXI.Graphics | null = null;

  private textStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: 'normal',
    fill: 0xffffff,
  })

  public constructor(renderer: PonRenderer) {
    this.renderer = renderer;
    // let sprite = new PIXI.Text("Hello PIXI.js", style);
    // sprite.anchor.set(0)
    // sprite.x = 0
    // sprite.y = 0
    // this.testsprite = sprite;
    // this.container.addChild(sprite);
  }

  public clear() {
    this.width = 0;
    this.height = 0;
    this.spriteType = 'text';
    this.pixiSprite = null;
  }

  public createText(text: string) {
    let sprite = new PIXI.Text(text, this.textStyle);
    sprite.anchor.set(0)
    this.pixiSprite = sprite;
    this.renderer.container.addChild(sprite);
  }

  public fillColor(color: number) {
    this.clear();
    // TODO make
  }

  public onUpdate(tick: number) {
  }

  public onDraw(tick: number) {
  }

  public get x(): number { return this.pixiSprite == null ? 0 : this.pixiSprite.x; }
  public get y(): number { return this.pixiSprite == null ? 0 : this.pixiSprite.y; }
  public set x(x) { if (this.pixiSprite != null) this.pixiSprite.x = x; }
  public set y(y) { if (this.pixiSprite != null) this.pixiSprite.y = y; }
}

