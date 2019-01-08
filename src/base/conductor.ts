import { Logger } from './logger';
import { Resource } from './resource'
import { Tag } from './tag'
import { Script } from './script'

export interface ConductorEvent {
  onTag(tag: Tag): void;
}

export class Conductor {
  protected resource: Resource;
  protected script: Script;

  public constructor(resource: Resource) {
    this.resource = resource;
    this.script = new Script(";s");
  }

  public loadScript(filePath: string) {
  }

}

