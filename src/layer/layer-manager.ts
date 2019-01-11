// import { Logger } from "../base/logger";
// import { Resource } from "../base/resource";
// import { Tag } from "../base/tag";
// import { generateTagActions, TagAction, TagValue } from "../tag-action";
//
// import { BaseLayer, IBaseLayerCallback } from "../base/base-layer";
// import { PonLayer } from "./pon-layer";
//
// export class LayerManager implements IBaseLayerCallback {
//   protected resource: Resource;
//   protected layerCount = 20;
//   private foreLayers: PonLayer[] = [];
//   private backLayers: PonLayer[] = [];
//
//   public constructor(resource: Resource) {
//     this.resource = resource;
//     //
//     // for (let i = 0; i < this.layerCount; i++) {
//     //   this.foreLayers[i] = this.createLayer(`fore layer ${i + 1}`);
//     //   this.backLayers[i] = this.createLayer(`back layer ${i + 1}`);
//     // }
//
//   }
//
//   // public createlayer(name: string): ponlayer {
//   //   const layer = new PonLayer( this.resource, this);
//   //   return layer;
//   // }
//
//
// }
