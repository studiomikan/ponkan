import { PonGame } from "./base/pon-game";
import { PonMouseEvent } from "./base/pon-mouse-event";
import { BaseLayer } from "./base/base-layer";
import { Conductor, IConductorEvent } from "./base/conductor";
import { Logger } from "./base/logger";
import { Tag } from "./base/tag";
import { PonLayer } from "./layer/pon-layer";
import { generateTagActions, applyJsEntity, castTagValues, TagAction, TagValue } from "./tag-action";

export class Ponkan3 extends PonGame implements IConductorEvent {
  // ゲーム設定
  public raiseError: any = {
    unknowntag: true
  };

  // conductor
  protected _conductor: Conductor;
  public get conductor(): Conductor { return this._conductor; }
  public skipMode: "invalid" | "nextclick" | "linebreak" | "pagebreak" | "tag" | "force" = "invalid"
  /** タグで開始したスキップモードをクリックで停止できるかどうか */
  public canStopSkipByTag: boolean = false;

  // タグ関係
  protected tagActions: any = {};

  // レイヤ関係
  protected _layerCount: number = 20;
  public get layerCount(): number { return this._layerCount; }
  // public set layerCount(layerCount: number) { this._layerCount = layerCount; }
  public forePrimaryLayer: PonLayer;
  public backPrimaryLayer: PonLayer;
  public get foreLayers(): PonLayer[] { return <PonLayer[]> this.forePrimaryLayer.children; } 
  public get backLayers(): PonLayer[] { return <PonLayer[]> this.backPrimaryLayer.children; } 
  public currentPage: "fore" | "back" = "fore";

  // メッセージ関係
  protected _messageLayerNum: number = 20;
  public get messageLayerNum(): number { return this._messageLayerNum; }
  public set messageLayerNum(num: number) { this._messageLayerNum = num; }

  protected _lineBreakGlyphLayerNum : number = 21;
  public get lineBreakGlyphLayerNum(): number { return this._lineBreakGlyphLayerNum; }
  public set lineBreakGlyphLayerNum(num: number) { this._lineBreakGlyphLayerNum = num; }
  public lineBreakGlyphPos: "eol" | "relative" | "absolute" = "eol";
  public lineBreakGlyphX: number = 0;
  public lineBreakGlyphY: number = 0;

  protected _pageBreakGlyphLayerNum : number = 22;
  public get pageBreakGlyphLayerNum(): number { return this._pageBreakGlyphLayerNum; }
  public set pageBreakGlyphLayerNum(num: number) { this._pageBreakGlyphLayerNum = num; }
  public pageBreakGlyphPos: "eol" | "relative" | "absolute" = "eol";
  public pageBreakGlyphX: number = 0;
  public pageBreakGlyphY: number = 0;

  public textSpeed: number = 100;

  public get tmpVar(): object { return this.resource.tmpVar; }
  public get gameVar(): object { return this.resource.gameVar; }
  public get systemVar(): object { return this.resource.systemVar; }

  public constructor(parentId: string, config: any = {}) {
    super(parentId, config);
    this._conductor = new Conductor(this.resource, this);

    this.initTagAction();

    this.forePrimaryLayer =
      <PonLayer> this.addLayer(new PonLayer("Fore primary layer", this.resource));
    this.backPrimaryLayer =
      <PonLayer> this.addLayer(new PonLayer("Back primary layer", this.resource));
    this.backPrimaryLayer.visible = false;
    this.initLayers();

    // テスト
    // const layer = this.forePrimaryLayer;
    // layer.x = 100;
    // layer.y = 100;
    // layer.width = 200;
    // layer.height = 200;
    // layer.setBackgoundColor(0x808080, 1.0);
    // layer.loadImage("okayu.jpg").done(() => {
    //   layer.addText("あいうえおかきくけこさしすせそ");
    //   layer.addTextReturn();
    //   layer.addText("Hello PIXI.js");
    //   layer.alpha = 1;
    //
    //   const layer2 = new PonLayer(name, this.resource);
    //   layer2.width = 100;
    //   layer2.height = 100;
    //   layer2.setBackgoundColor(0xff0000, 1.0);
    //   // this.addLayer(layer2);
    //   layer.addChild(layer2);
    // });
  }

  public destroy() {
    this.stop();
    this.forePrimaryLayer.destroy();
    this.backPrimaryLayer.destroy();
    super.destroy();
  }

  public start(): void {
    super.start();
    this.conductor.loadScript("start.pon").done(() => {
      Logger.debug("onLoadScript success");
      this.conductor.start();
    }).fail(() => {
      Logger.debug("onLoadScript fail");
    });
  }

  public stop(): void {
    super.stop();
  }

  protected update(tick: number): void {
    this.conductor.conduct(tick);
    this.forePrimaryLayer.update(tick);
    this.backPrimaryLayer.update(tick);
  }

  public error(e: Error): void {
    this.conductor.stop();
    super.error(e);
  }

  // =========================================================
  // マウス
  // =========================================================

  public onMouseEnter(e: PonMouseEvent): boolean  {
    return this.forePrimaryLayer.onMouseEnter(e);
  }
  public onMouseLeave(e: PonMouseEvent): boolean  {
    return this.forePrimaryLayer.onMouseLeave(e);
  }
  public onMouseMove(e: PonMouseEvent): boolean  {
    return this.forePrimaryLayer.onMouseMove(e);
  }
  public onMouseDown(e: PonMouseEvent): boolean  {
    return this.forePrimaryLayer.onMouseDown(e);
  }
  public onMouseUp(e: PonMouseEvent): boolean  {
    if (!this.forePrimaryLayer.onMouseUp(e)) {
      alert("fore is false");
      return false;
    }

    // コンダクターのスリープを解除する。
    // テキスト出力のウェイト、waitタグでのスリープ等を解除する。
    // TODO canskipタグの判定必要か検討する
    if (this.conductor.status === "sleep") {
      this.conductor.start();
      this.skipMode = "nextclick"
    }
    // skipタグで開始されたスキップモードを停止する
    if (this.skipMode === "tag" && this.canStopSkipByTag) {
      this.skipMode = "invalid"
    }

    // トリガーを発火
    this.trigger("click", this);

    return true;
  }

  // =========================================================
  // タグ動作
  // =========================================================
  private initTagAction() {
    generateTagActions(this).forEach((tagAction) => {
      Logger.debug(tagAction);
      this.tagActions[tagAction.name] = tagAction;
    });
    Logger.debug("TagActionMap: ", this.tagActions);
  }


  // =========================================================
  // コンダクタ
  // =========================================================
  public onTag(tag: Tag, tick: number): "continue" | "break" {
    Logger.debug("onTag: ", tag.name, tag.values);
    const tagAction: TagAction = this.tagActions[tag.name];
    if (tagAction === null || tagAction === undefined) {
      Logger.debug("Unknown Tag: ", tag.name, tag);
      if (this.raiseError.unknowntag) {
        throw new Error(`${tag.name}というタグは存在しません`);
      } else {
        return "continue";
      }
    }
    applyJsEntity(this.resource, tag.values);
    castTagValues(tag, tagAction);
    tagAction.values.forEach((def: TagValue) => {
      const value: any = tag.values[def.name];
      if (value === undefined || value === null) {
        if (def.required) {
          throw new Error(`${tag.name}タグの${def.name}は必須です。`);
        }
        if (def.defaultValue != null) {
          tag.values[def.name] = def.defaultValue;
        }
      }
    });

    
    console.log(tag.values);
    return tagAction.action(tag.values, tick);
  }

  public onLabel(labelName: string, tick: number): "continue" | "break" {
    Logger.debug("onLabel: ", labelName);
    // TODO
    return "continue";
  }

  public onJs(js: string, printFlag: boolean, tick: number): "continue" | "break" {
    Logger.debug("onJs: ", js);
    let text = this.resource.evalJs(js);
    if (printFlag) {
      let tag = new Tag("ch", { text: "" + text });
      return this.onTag(tag, tick);
    } else {
      return "continue";
    }
  }

  // =========================================================
  // レイヤ
  // =========================================================
  private initLayers() {
    [this.forePrimaryLayer, this.backPrimaryLayer].forEach((primaryLayer: PonLayer) => {
      primaryLayer.x = 0;
      primaryLayer.y = 0;
      primaryLayer.width = this.width;
      primaryLayer.height = this.height;
    });
    for (let i = 0; i < this.layerCount; i++) {
      this.forePrimaryLayer.addChild(this.createLayer(`fore layer ${i}`));
      this.backPrimaryLayer.addChild(this.createLayer(`back layer ${i}`));
    }
  }

  public set layerCount(layerCount: number) {
    if (layerCount < this._layerCount) {
      // 減少するとき
      [this.forePrimaryLayer, this.backPrimaryLayer].forEach((primaryLayer) => {
        let oldList = primaryLayer.children;
        for (let i = 0; i < oldList.length; i++) {
          if (i < layerCount) {
            primaryLayer.addChild(oldList[i]);
          } else {
            oldList[i].destroy();
          }
        }
      });
    } else {
      // 増加するとき
      for (let i = this.foreLayers.length; i < layerCount; i++) {
        this.forePrimaryLayer.addChild(this.createLayer(`fore layer ${i}`));
        this.backPrimaryLayer.addChild(this.createLayer(`back layer ${i}`));
      }
    }
    this._layerCount = layerCount;
  }

  /**
   * プライマリレイヤを作成する。
   * rendererへの追加は行わないので、別途addLayerを呼ぶか、
   * 他のレイヤの子レイヤにする必要がある。
   */
  public createLayer(name: string) {
    const layer = new PonLayer(name, this.resource);
    this.addLayer(<BaseLayer>layer);
    return layer;
  }

  /**
   * 操作対象となるレイヤーを取得する
   * @param pageLayers ページのレイヤー
   * @param lay レイヤー指定の文字列
   * @return 操作対象レイヤー
   */
  protected getTargetLayers(pageLayers: PonLayer[], lay: string): PonLayer[] {
    const targetLayers: PonLayer[] = [];
    if (lay == null || lay === "" || lay === "all") {
      return pageLayers;
    } else if (lay.indexOf(",") !== -1) {
      lay.split(",").forEach((l) => {
        this.getTargetLayers(pageLayers, l.trim()).forEach((layer) => {
          targetLayers.push(layer);
        });
      });
    } else if (lay.indexOf("-") !== -1) {
      const numList: string[] = lay.split("-");
      const start: number = parseInt(numList[0], 10);
      const end: number = parseInt(numList[1], 10);
      if (start < 0) { throw new Error("レイヤ指定が範囲外です"); }
      if (end >= this.layerCount) { throw new Error("レイヤ指定が範囲外です"); }
      for (let i = start; i <= end; i++) {
        targetLayers.push(pageLayers[i]);
      }
    } else if (lay == "mes" || lay == "message") {
      targetLayers.push(pageLayers[this.messageLayerNum]);
    } else if (lay == "linebreak") {
      targetLayers.push(pageLayers[this.lineBreakGlyphLayerNum]);
    } else if (lay == "pagebreak") {
      targetLayers.push(pageLayers[this.pageBreakGlyphLayerNum]);
    } else {
      const layerNum: number = parseInt(lay, 10);
      if (layerNum < 0 || this.layerCount <= layerNum) {
        throw new Error(`レイヤ指定が範囲外です(${lay})`);
      }
      targetLayers.push(pageLayers[layerNum]);
    }
    return targetLayers;
  }

  /**
   * 操作対象のレイヤーを取得する
   * @param values タグの値
   */
  public getLayers(values: any): PonLayer[] {
    const lay: string = "" + values.lay as string;
    const page: string = "" + values.page as string;
    let pageLayers: PonLayer[];
    if (page != null && page === "back") {
      pageLayers = this.backLayers;
    } else {
      pageLayers = this.foreLayers;
    }
    return this.getTargetLayers(pageLayers, lay);
  }

  // =========================================================
  // メッセージ
  // =========================================================
  /**
   * メッセージレイヤ（表）
   */
  public get messageLayer(): PonLayer {
    return this.foreLayers[this.messageLayerNum];
  }

  public get lineBreakGlyphLayer(): PonLayer {
    return this.foreLayers[this.lineBreakGlyphLayerNum];
  }

  public get pageBreakGlyphLayer(): PonLayer {
    return this.foreLayers[this.pageBreakGlyphLayerNum];
  }

  public showLineBreakGlyph(tick: number): void {
    this.showBreakGlyph(tick, this.lineBreakGlyphLayer, this.lineBreakGlyphPos,
                        this.lineBreakGlyphX, this.lineBreakGlyphY);
  }

  public showPageBreakGlyph(tick: number): void {
    this.showBreakGlyph(tick, this.pageBreakGlyphLayer, this.pageBreakGlyphPos,
                        this.pageBreakGlyphX, this.pageBreakGlyphY);
  }

  public showBreakGlyph(
    tick: number,
    lay: PonLayer,
    pos: "eol" | "relative" | "absolute" = "eol",
    x: number,
    y: number
  ) {
    let mesLay = this.messageLayer;
    if (pos == "eol") {
      let glyphPos = mesLay.getNextTextPos(lay.width);
      lay.x = mesLay.x + glyphPos.x;
      lay.y = mesLay.y + glyphPos.y + mesLay.textLineHeight - lay.height;
    } else if (pos == "relative") {
      lay.x = mesLay.x + x;
      lay.y = mesLay.y + y;
    } else if (pos == "absolute") {
      lay.x = x;
      lay.y = y;
    }
    if (lay.hasFrameAnim) {
      lay.stopFrameAnim();
      lay.startFrameAnim(tick);
    }
    lay.visible = true;
  }

  public waitClickCallback(param: string) {
    Logger.debug("waitClickCallback " + param);
    this.conductor.start();
    switch (param) {
      case "lb":
        this.lineBreakGlyphLayer.visible = false;
        break;
      case "pb":
        this.pageBreakGlyphLayer.visible = false;
        break;
    }
  }


}

(window as any).Ponkan3 = Ponkan3;
