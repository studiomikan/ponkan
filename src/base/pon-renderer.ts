import * as PIXI from 'pixi.js'

export class PonRenderer {
  private width: number;
  private height: number;
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer | null = null;
  private container: PIXI.Container | null = null;

  private testsprite: PIXI.Sprite | null = null;

  public constructor(parentElm: HTMLElement, width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, { backgroundColor: 0xFF000011 });
    parentElm.appendChild(this.renderer.view);

    this.container = new PIXI.Container();

    // テスト用
    let style = new PIXI.TextStyle({
      fontSize: 24,
      fontWeight: 'normal',
      fill: 0xffffff,
    })
    let sprite = new PIXI.Text("Hello PIXI.js", style);
    sprite.anchor.set(0)
    sprite.x = 0
    sprite.y = 0
    this.testsprite = sprite;
    this.container.addChild(sprite);
    // テスト用
  }

  public draw(tick: number) {
    if (this.renderer == null || this.container == null) return;
    if (this.testsprite != null) {
      this.testsprite.x++;
      this.testsprite.x = this.testsprite.x % 300;
    }
    this.renderer.render(this.container)
  }

  public get canvasElm(): HTMLCanvasElement {
    if (this.renderer == null || this.renderer.view == null)
      throw new Error(`Illegal access property. PonRenderer.canvasElm`)
    else
      return this.renderer.view;
  }
}

