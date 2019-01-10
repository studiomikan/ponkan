import { Logger } from "../base/logger";
import { Resource } from "../base/resource";
import { Tag } from "../base/tag";
import { generateTagActions, TagAction, TagValue } from "../tag-action";

import { BaseLayer, IBaseLayerCallback } from "../base/base-layer";
import { PonLayer } from "./pon-layer";

export class LayerManager implements IBaseLayerCallback {
  protected resource: Resource;
  protected layerCount = 20;
  private foreLayers: PonLayer[] = [];
  private backLayers: PonLayer[] = [];

  public constructor(resource: Resource) {
    this.resource = resource;

    for (let i = 0; i < this.layerCount; i++) {
      this.foreLayers[i] = this.createLayer(`fore layer ${i + 1}`);
    }

  }

  public createLayer(name: string): PonLayer {
    const layer = new PonLayer(this.resource, this);
    return layer;
  }

  public onLoadImage(layer: BaseLayer, image: HTMLImageElement): void {
    Logger.debug("OnLoadImage ", layer, image);
  }

}
