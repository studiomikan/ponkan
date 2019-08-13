import { Logger } from "./logger";
import { Resource } from "./resource";
import { Tag } from "./tag";

export class Macro {
  public readonly name: string;
  public readonly tags: Tag[];
  protected tagPoint: number = 0;
  public params: any = {};

  public constructor(name: string, tags: Tag[]) {
    this.name = name;
    this.tags = tags;
  }

  public clone(): Macro {
    const newTags: Tag[] = [];
    this.tags.forEach((tag) => {
      newTags.push(tag.clone());
    });
    return new Macro(this.name, newTags);
  }

  public getCurrentTag(): Tag | null {
    if (this.tags.length <= this.tagPoint) {
      return null;
    } else {
      return this.tags[this.tagPoint];
    }
  }

  /**
   * 次のタグを取得する。
   * スクリプトファイル終端の場合はnullが返る
   * @return 次のタグ。終端の場合はnull
   */
  public getNextTag(): Tag | null {
    if (this.tags.length <= this.tagPoint) {
      return null;
    } else {
      return this.tags[this.tagPoint++];
    }
  }

  public clearTagPoint(): void {
    this.tagPoint = 0;
  }

}
