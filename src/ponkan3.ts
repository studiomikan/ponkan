import { PonGame } from './base/pon-game'
import { Logger } from './base/logger'
import { Tag } from './base/tag'
import { Conductor, ConductorEvent } from './base/conductor'
import { TagValue, TagAction, generateTagActions } from './tag-action'

export class Ponkan3 extends PonGame implements ConductorEvent {
  protected _conductor: Conductor;
  public get conductor(): Conductor { return this._conductor;}

  protected tagAction: any = {};

  public tmpVar: object = {};
  public gameVar: object = {};
  public systemVar: object = {};

  public constructor(parentId: string) {
    super(parentId);
    this._conductor = new Conductor(this.resource, this);

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
    this.evalJs(js);
  }

  public evalJs(js: string): any {
    let pon = this
    let tf = this.tmpVar;
    let gf = this.gameVar;
    let sf = this.systemVar;
    return (function() {
      return eval(js);
    })();
  }

}

(<any>window).Ponkan3 = Ponkan3;

