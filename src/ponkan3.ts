import { PonGame } from './base/pon-game'
import { Logger } from './base/logger'
import { Tag } from './base/tag'
import { Conductor, IConductorEvent } from './base/conductor'
import { TagValue, TagAction, generateTagActions } from './tag-action'
import { LayerManager } from './layer/layer-manager'

export class Ponkan3 extends PonGame implements IConductorEvent {
  protected _conductor: Conductor;
  public get conductor(): Conductor { return this._conductor;}

  protected _layerManager: LayerManager;
  public get layerManager(): LayerManager { return this._layerManager }

  protected tagAction: any = {};

  public get tmpVar(): object { return this.resource.tmpVar; }
  public get gameVar(): object { return this.resource.gameVar; }
  public get systemVar(): object { return this.resource.systemVar; }

  public constructor(parentId: string) {
    super(parentId);
    this._conductor = new Conductor(this.resource, this);
    this._layerManager = new LayerManager(this.resource);

    this.initTagAction();
  }

  private initTagAction() {
    generateTagActions(this).forEach((tagAction) => {
      Logger.debug(tagAction);
      this.tagAction[tagAction.name] = tagAction;
    });
    Logger.debug("TagActionMap: ", this.tagAction);
  }

  protected update(tick: number): void {
    this.conductor.conduct(tick);
  }

  public onConductError(messages: string[]) {
    // TODO エラー処理
    messages.forEach((message) => {
      Logger.error(message);
    });
  }

  public onLoadScript(): void {
    Logger.debug("onLoadScript");
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

}

(<any>window).Ponkan3 = Ponkan3;
