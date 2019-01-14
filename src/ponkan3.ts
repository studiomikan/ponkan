import { PonGame } from './base/pon-game'
import { Logger } from './base/logger'
import { Tag } from './base/tag'
import { Conductor, IConductorEvent } from './base/conductor'
import { TagValue, TagAction, generateTagActions } from './tag-action'
import { BaseLayer } from "./base/base-layer";
import { PonLayer } from "./layer/pon-layer";

export class Ponkan3 extends PonGame implements IConductorEvent {
  protected _conductor: Conductor;
  public get conductor(): Conductor { return this._conductor;}

  // タグ関係
  protected tagAction: any = {};

  // レイヤ関係
  protected layerCount = 20;
  public forePrimaryLayer: PonLayer;
  public backPrimaryLayer: PonLayer;
  public foreLayers: PonLayer[] = [];
  public backLayers: PonLayer[] = [];
  public currentPage: "fore" | "back" = "fore";

  public get tmpVar(): object { return this.resource.tmpVar; }
  public get gameVar(): object { return this.resource.gameVar; }
  public get systemVar(): object { return this.resource.systemVar; }

  public constructor(parentId: string) {
    super(parentId);
    this._conductor = new Conductor(this.resource, this);

    this.initTagAction();

    this.forePrimaryLayer = 
      this.addLayer(new PonLayer("Fore primary layer", this.resource));
    this.backPrimaryLayer = 
      this.addLayer(new PonLayer("Back primary layer", this.resource));
    this.backPrimaryLayer.visible = false;
    this.initLayers();

    // テスト
    const layer = this.forePrimaryLayer;
    layer.x = 100;
    layer.y = 100;
    layer.width = 200;
    layer.height = 200;
    layer.setBackgoundColor(0x808080, 1.0);
    layer.loadImage("okayu.jpg").done(() => {
      layer.addText("あいうえおかきくけこさしすせそ");
      layer.addTextReturn();
      layer.addText("Hello PIXI.js");
      layer.alpha = 1;

      const layer2 = new PonLayer(name, this.resource);
      layer2.width = 100;
      layer2.height = 100;
      layer2.setBackgoundColor(0xff0000, 1.0);
      // this.addLayer(layer2);
      layer.addChild(layer2);
    });
  }

  public destroy() {
    this.stop();
    this.forePrimaryLayer.destroy();
    this.backPrimaryLayer.destroy();
    super.destroy();
  }

  public start(): void {
    super.start();
    this.conductor.loadScript('start.pon').done(() => {
      Logger.debug("onLoadScript success");
      this.conductor.start();
    }).fail(() => {
      Logger.debug("onLoadScript fail");
    });
  }

  public stop(): void {
    super.stop();
  }

  protected update(tick: number): void {
    this.conductor.conduct(tick);
  }

  //=========================================================
  // タグ動作
  //=========================================================
  private initTagAction() {
    generateTagActions(this).forEach((tagAction) => {
      Logger.debug(tagAction);
      this.tagAction[tagAction.name] = tagAction;
    });
    Logger.debug("TagActionMap: ", this.tagAction);
  }

  //=========================================================
  // コンダクタ
  //=========================================================
  public onConductError(messages: string[]) {
    // TODO エラー処理
    messages.forEach((message) => {
      Logger.error(message);
    });
  }

  public onTag(tag: Tag): void {
    Logger.debug("onTag: ", tag);
  }

  public onLabel(labelName: string): void {
    Logger.debug("onLabel: ", labelName);
  }

  public onJs(js: string): void {
    Logger.debug("onJs: ", js);
    this.resource.evalJs(js);
  }

  //=========================================================
  // レイヤ
  //=========================================================
  private initLayers() {
    for (let i = 0; i < this.layerCount; i++) {
      this.foreLayers[i] = this.createLayer(`fore layer ${i}`);
      this.forePrimaryLayer.addChild(this.foreLayers[i]);
      this.backLayers[i] = this.createLayer(`back layer ${i}`);
      this.backPrimaryLayer.addChild(this.backLayers[i]);
    }
  }

  /**
   * レイヤを作成する。
   * rendererへの追加は行わないので、別途addLayerを呼ぶか、
   * 他のレイヤの子レイヤにする必要がある。
   */
  public createLayer(name: string) {
    const layer = new PonLayer(name, this.resource);
    this.addLayer(layer);
    return layer;
  }

  /**
   * 操作対象となるレイヤーを取得する
   * @param pageLayers ページのレイヤー
   * @param lay レイヤー指定の文字列
   * @return 操作対象レイヤー
   */
  protected getTargetLayers(pageLayers: PonLayer[], lay: string): PonLayer[] {
    let targetLayers: PonLayer[] = [];
    if (lay == null || lay === "" || lay === "all") {
      return pageLayers;
    } else if(lay.indexOf(",") != -1) {
      lay.split(",").forEach((l) => {
        this.getTargetLayers(pageLayers, l.trim()).forEach((layer) => {
          targetLayers.push(layer);
        });
      });
    } else if(lay.indexOf("-") != -1) {
      let numList: string[] = lay.split("-");
      let start: number = parseInt(numList[0], 10);
      let end: number = parseInt(numList[1], 10);
      if (start < 0) { throw new Error("レイヤ指定が範囲外です"); }
      if (end >= this.layerCount) { throw new Error("レイヤ指定が範囲外です"); }
      for (let i = start; i <= end; i++) {
        targetLayers.push(pageLayers[i]);
      }
    } else {
      let layerNum: number = parseInt(lay, 10);
      if (layerNum < 0 || this.layerCount <= layerNum) {
        throw new Error(`レイヤ指定が範囲外です(${lay})`);
      }
      targetLayers.push(pageLayers[layerNum]);
    }
    return targetLayers;
  }

  /**
   * 操作対象のレイヤーを取得する
   * @param values タグの値
   */
  public getLayers(values: any): PonLayer[] {
    let lay: string = "" + <string> values.lay;
    let page: string = "" + <string> values.page;
    let pageLayers : PonLayer[];
    if (page != null && page == "back") {
      pageLayers = this.backLayers;
    } else {
      pageLayers = this.foreLayers;
    }
    return this.getTargetLayers(pageLayers, lay);
  }

}

(<any>window).Ponkan3 = Ponkan3;
