import { PonGame } from './base/pon-game'
import { Logger } from './base/logger'
import { Tag } from './base/tag'
import { Conductor, ConductorEvent } from './base/conductor'

class Ponkan3 extends PonGame implements ConductorEvent {
  public conductor: Conductor;

  public tmpVar: object = {};
  public gameVar: object = {};
  public systemVar: object = {};

  public constructor(parentId: string) {
    super(parentId);
    this.conductor = new Conductor(this.resource, this);
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
  }

}

(<any>window).Ponkan3 = Ponkan3;

