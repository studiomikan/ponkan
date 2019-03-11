import { Logger } from "./logger";
import { Resource } from "./resource";
import { Script } from "./script";

export class ReadUnread {
  protected resource: Resource;
  protected get systemVar(): any { return this.resource.systemVar; }

  public constructor(resource: Resource) {
    this.resource = resource;
  }

  public pass(script: Script, label: string): void {
    if (label == "") { return; }
    let s = this.systemVar;

    if (s.trail == null) {
      s.trail = {};
    }
    if (s.trail[script.filePath] == null) {
      s.trail[script.filePath] = {};
    }
    if (s.trail[script.filePath][label] == null) {
      s.trail[script.filePath][label] = 1;
    } else {
      s.trail[script.filePath][label]++;
    }
  }

  public isPassed(script: Script, label: string): boolean {
    let s = this.systemVar;
    return s.trail != null &&
           s.trail[script.filePath] != null &&
           s.trail[script.filePath][label] != null &&
           s.trail[script.filePath][label] > 0;
  }

}
