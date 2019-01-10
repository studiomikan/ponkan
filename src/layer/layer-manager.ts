import { Logger } from '../base/logger'
import { Resource } from '../base/resource'
import { Tag } from '../base/tag'
import { TagValue, TagAction, generateTagActions } from '../tag-action'

import { BaseLayer, BaseLayerCallback } from '../base/base-layer'
import { PonLayer } from './pon-layer.ts'

export class LayerManager implements BaseLayerCallback {
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
    let layer = new PonLayer(this.resource, this);
    return layer;
  }

  public onLoadImage(layer: BaseLayer, image: HTMLImageElement): void {
    Logger.debug("OnLoadImage ", layer, image);
  }

}


