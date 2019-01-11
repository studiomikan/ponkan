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
    // for (let i = 0; i < this.layerCount; i++) {
    //   this.foreLayers[i] = this.createLayer(`fore layer ${i + 1}`);
    //   this.backLayers[i] = this.createLayer(`back layer ${i + 1}`);
    // }
  }

  public createLayer(name: string) {
    const layer = new PonLayer(name, this.resource);
    this.addLayer(layer);
    return layer;
  }

}

(<any>window).Ponkan3 = Ponkan3;
