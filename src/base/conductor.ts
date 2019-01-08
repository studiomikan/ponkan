import { Logger } from './logger';
import { Resource } from './resource'
import { Tag } from './tag'
import { Script } from './script'

export interface ConductorEvent {
  onConductError(messages: string[]): void;
  onLoadScript(): void;
  onLabel(labelName: string): void;
  onJs(js: string, printFlag: boolean): void;
  onTag(tag: Tag): void;
}

export class Conductor {
  protected resource: Resource;
  protected eventCallbacks: ConductorEvent;
  protected script: Script;

  public constructor(resource: Resource, eventCallbacks: ConductorEvent) {
    this.resource = resource;
    this.eventCallbacks = eventCallbacks
    this.script = new Script(";s");
  }

  public loadScript(filePath: string) {
    this.resource.loadScript(filePath).done(() => {
      this.eventCallbacks.onLoadScript();
    }).fail(() => {
      this.eventCallbacks.onConductError(['スクリプトの読み込みに失敗しました。', filePath]);
    });
  }

  public conduct(tick: number): void {
    let tag: Tag | null = this.script.getNextTag();
    if (tag == null) return;

    switch (tag.name) {
      case "__label__":
        this.eventCallbacks.onLabel(tag.values.__body__);
        break;
      case "__js__":
        this.eventCallbacks.onJs(tag.values.__body__, tag.values.print);
        break;
      default:
        this.eventCallbacks.onTag(tag);
        break;
    }
  }

}

