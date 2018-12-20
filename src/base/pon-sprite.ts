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
  });

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
    this.clear();
    this.pixiSprite = new PIXI.Text(text, this.textStyle);
    this.pixiSprite.anchor.set(0)
    this.width = this.height = <number> +this.textStyle.fontSize;
    this.renderer.container.addChild(this.pixiSprite);
  }

  public fillColor(color: number, width: number, height: number) {
    this.clear();
    // TODO make
    this.width = width;
    this.height = height;
    this.pixiSprite = new PIXI.Graphics();
    this.pixiSprite.lineStyle(0);
    this.pixiSprite.beginFill(color, 1);
    this.pixiSprite.drawRect(0, 0, this.width, this.height);
    this.renderer.container.addChild(this.pixiSprite);
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

