import { BaseLayer } from "../base/base-layer";
import { AsyncCallbacks } from "../base/async-callbacks";
import { AsyncTask } from "../base/async-task";
import { Resource } from "../base/resource";
import { PonGame } from "../base/pon-game";
import { FrameAnimLayer } from "./frame-anim-layer";
import { TextButtonLayer } from "./text-button-layer";
import { ImageButtonLayer } from "./image-button-layer";
import { ToggleButtonLayer } from "./toggle-button-layer";

// export class PonLayer extends FrameAnimLayer {
export class PonLayer extends ToggleButtonLayer {

  public autoHideWithMessage: boolean = false;
  public visibleBuffer: boolean;

  public constructor(name: string, resource: Resource, owner: PonGame) {
    super(name, resource, owner);
    this.visibleBuffer = this.visible;
  }

  protected static ponLayerStoreParams: string[] = [
    "hideWithMessage"
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

    if (this.visible !== this.visibleBuffer) {
      // 万が一hidemessages中に呼ばれたときは、bufferの方を保存する
      data.visible = this.visibleBuffer;
    }

    return data;
  }

  public restore(asyncTask: AsyncTask, data: any, tick: number): void {
    let me: any = this as any;
    PonLayer.ponLayerStoreParams.forEach(p => me[p] = data[p]);
  }

  public copyTo(dest: PonLayer): void {
    super.copyTo(dest);
    let me: any = this as any;
    let you: any = dest as any;
    PonLayer.ponLayerStoreParams.forEach(p => you[p] = me[p]);
  }

}
