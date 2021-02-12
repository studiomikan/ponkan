import { BaseLayer } from "../base/base-layer";
import { Resource } from "../base/resource";
import { Ponkan } from "../ponkan";
import { FilteredLayer } from "./filtered-layer";

// BaseLayer
//     |
//     +----------------------+-------------------+
//     |                      |                   |
// FrameAnimLayer          Button              HistoryLayer
//     |                      |
// TextButtonLayer         CommandButton
//     |
// ImageButtonLayer
//     |
// ToggleButtonLayer
//     |
// SliderLayer
//     |
// MovableLayer
//     |
// FilteredLayer
//     |
// PonLayer

export class PonLayer extends FilteredLayer {
  public autoHideWithMessage: boolean = false;
  public visibleBuffer: boolean;
  public childImages: BaseLayer[] = [];

  public constructor(name: string, resource: Resource, owner: Ponkan) {
    super(name, resource, owner);
    this.visibleBuffer = this.visible;
  }

  /**
   * [override]
   */
  public addChar(ch: string): void {
    super.addChar(ch);
    if (ch != null && ch.length > 0) {
      (this.owner as Ponkan).onAddChar(this, ch);
    }
  }

  /**
   * [override]
   */
  public addTextReturn(): void {
    super.addTextReturn();
    (this.owner as Ponkan).onTextReturn(this);
  }

  /**
   * 画像を追加で読み込む。
   * @param filePath ファイルパス
   * @param x 描画先座標
   * @param y 描画先座標
   * @param alpha アルファ値
   */
  public async loadChildImage(filePath: string, x: number, y: number, alpha: number): Promise<void> {
    const child: BaseLayer = new BaseLayer(`ChildImage (filePath)`, this.resource, this.owner);
    this.addChild(child);
    this.childImages.push(child);

    child.x = x;
    child.y = y;
    await child.loadImage(filePath);
    child.alpha = alpha;
    child.visible = true;
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

  protected static ponLayerStoreParams: string[] = ["autoHideWithMessage", "visibleBuffer"];

  public storeVisible(): void {
    this.visibleBuffer = this.visible;
  }

  public restoreVisible(): void {
    this.visible = this.visibleBuffer;
  }

  public store(tick: number): any {
    const data: any = super.store(tick);
    const me: any = this as any;
    PonLayer.ponLayerStoreParams.forEach((p) => (data[p] = me[p]));
    data.childImages = this.childImages.map((ci) => ci.store(tick));
    return data;
  }

  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    await super.restore(data, tick, clear);
    const me: any = this as any;
    PonLayer.ponLayerStoreParams.forEach((p) => (me[p] = data[p]));

    if (data.childImages.length > 0) {
      if (data.childImages.length === this.childImages.length) {
        // 数が同じ場合（たとえばtemploadなどでロードしたときなど）は読み込み直さない
        await Promise.all(
          data.childImages.map((childImageData: any, i: number) => {
            return this.childImages[i].restore(childImageData, tick, clear);
          }),
        );
      } else {
        // 数が合わない場合は一度破棄して作り直す
        this.freeChildImages();
        await Promise.all(
          data.childImages.map((childImageData: any) => {
            const ci = new BaseLayer(childImageData.name, this.resource, this.owner);
            this.addChild(ci);
            this.childImages.push(ci);
            return ci.restore(childImageData, tick, clear);
          }),
        );
      }
    } else {
      this.freeChildImages();
    }
  }

  // protected restoreAfterLoadImage(data: any, tick: number): void {
  //   super.restoreAfterLoadImage(data, tick);
  //   console.log("#########", data.childImages, this.childImages);
  //   if (data.childImages != null && data.childImages.length > 0) {
  //     for (let i = 0; i < data.childImages.length; i++) {
  //       (this.childImages[i] as PonLayer).restoreAfterLoadImage(data.childImages[i], tick);
  //     }
  //   }
  // }

  public copyTo(dest: PonLayer): void {
    super.copyTo(dest);
    const me: any = this as any;
    const you: any = dest as any;
    PonLayer.ponLayerStoreParams.forEach((p) => (you[p] = me[p]));

    dest.freeChildImages();
    this.childImages.forEach((srcImage) => {
      const destImage = new BaseLayer(srcImage.name, this.resource, this.owner);
      dest.addChild(destImage);
      dest.childImages.push(destImage);
      srcImage.copyTo(destImage);
    });
  }
}
