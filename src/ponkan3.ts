import { PonGame } from './base/pon-game'
import { Tag } from './base/tag'
import { Conductor, ConductorEvent } from './base/conductor'

class Ponkan3 extends PonGame implements ConductorEvent {
  public conductor: Conductor;

  public constructor(parentId: string) {
    super(parentId);

    this.conductor = new Conductor(this.resource);

  }

  public onTag(tag: Tag) {
  }

}

(<any>window).Ponkan3 = Ponkan3;

