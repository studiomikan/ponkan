import { BaseLayer } from "../base/base-layer";
import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { PonGame } from "../base/pon-game";
import { FrameAnimLayer } from "./frame-anim-layer";
import { TextButtonLayer } from "./text-button-layer";
import { ImageButtonLayer } from "./image-button-layer";
import { ToggleButtonLayer } from "./toggle-button-layer";
import { MovableLayer } from "./movable-layer";
import { Ponkan3 } from "../ponkan3";

export class PonLayer extends MovableLayer {

  public autoHideWithMessage: boolean = false;
  public visibleBuffer: boolean;
  public childImages: BaseLayer[] = [];

  public constructor(name: string, resource: Resource, owner: Ponkan3) {
    super(name, resource, owner);
    this.visibleBuffer = this.visible;
  }

  /**
   * [override]
   */
  public addChar(ch: string): void {
    super.addChar(ch);
    if (ch.length == 1) {
      (this.owner as Ponkan3).onAddChar(this, ch);
    }
  }

  /**
   * [override]
   */
  public addTextReturn(): void {
    super.addTextReturn();
    (this.owner as Ponkan3).onTextReturn(this);
  }

  /**
   * 画像を追加で読み込む。
   * @param filePath ファイルパス
   * @param x 描画先座標
   * @param y 描画先座標
   * @param alpha アルファ値
   */
  public loadChildImage(filePath: string, x: number, y: number, alpha: number): AsyncCallbacks {
    let child: BaseLayer = new BaseLayer(`ChildImage (filePath)`, this.resource, this.owner);
    this.addChild(child);
    this.childImages.push(child);

    child.x = x;
    child.y = y;
    let cb = child.loadImage(filePath);
    cb.done(() => {
      child.alpha = alpha;
      child.visible = true;
    });
    return cb;
  }

  public freeChildImages(): void {
    this.childImages.forEach((ci) => {
      ci.freeImage();
      ci.destroy();
      this.deleteChildLayer(ci);
    });
    this.childImages = [];
  }

  public freeImage(): void {
    super.freeImage();
  }

  protected static ponLayerStoreParams: string[] = [
    "autoHideWithMessage",
    "visibleBuffer"
  ];

  public storeVisible(): void {
    this.visibleBuffer = this.visible;
  }

  public restoreVisible(): void {
    this.visible = this.visibleBuffer;
  }

  public store(tick: number): any {
    let data: any = super.store(tick);
    let me: any = this as any;
    PonLayer.ponLayerStoreParams.forEach(p => data[p] = me[p]);
    data.childImages = this.childImages.map(ci => ci.store(tick));
    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number, clear: boolean): void {
    super.restore(asyncTask, data, tick, clear);
    let me: any = this as any;
    PonLayer.ponLayerStoreParams.forEach(p => me[p] = data[p]);

    if (data.childImages.length > 0) {
      if (data.childImages.length === this.childImages.length) {
        // 数が同じ場合（たとえばtemploadなどでロードしたときなど）は読み込み直さない
        data.childImages.forEach((childImageData: any, i: number) => {
          this.childImages[i].restore(asyncTask, childImageData, tick, clear);
        });
      } else {
        // 数が合わない場合は一度破棄して作り直す
        this.freeChildImages();
        data.childImages.forEach((childImageData: any) => {
          let ci = new BaseLayer(childImageData.name, this.resource, this.owner);
          this.addChild(ci);
          this.childImages.push(ci);
          ci.restore(asyncTask, childImageData, tick, clear);
        });
      }
    } else {
      this.freeChildImages();
    }
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    super.restoreAfterLoadImage(data, tick);
    if (data.childImages != null && data.childImages.length > 0) {
      for (let i = 0; i < data.childImages.length; i++) {
        (this.childImages[i] as PonLayer).restoreAfterLoadImage(data.childImages[i], tick);
      }
    }
  }

  public copyTo(dest: PonLayer): void {
    super.copyTo(dest);
    let me: any = this as any;
    let you: any = dest as any;
    PonLayer.ponLayerStoreParams.forEach(p => you[p] = me[p]);

    dest.freeChildImages();
    this.childImages.forEach((srcImage) => {
      let destImage = new BaseLayer(srcImage.name, this.resource, this.owner);
      dest.addChild(destImage);
      dest.childImages.push(destImage);
      srcImage.copyTo(destImage);
    });
  }
}
