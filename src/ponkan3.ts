import { AsyncCallbacks } from "./base/async-callbacks";
import { AsyncTask } from "./base/async-task";
import { BaseLayer } from "./base/base-layer";
import { Conductor, ConductorState, IConductorEvent } from "./base/conductor";
import { Logger } from "./base/logger";
import { PonGame } from "./base/pon-game";
import { PonMouseEvent } from "./base/pon-mouse-event";
import { PonKeyEvent } from "./base/pon-key-event";
import { ISoundCallbacks, Sound, SoundBuffer } from "./base/sound";
import { Tag } from "./base/tag";
import * as Util from "./base/util.ts";
import { PonLayer } from "./layer/pon-layer";
import { applyJsEntity, castTagValues, generateTagActions, TagAction, TagValue } from "./tag-action";

export enum SkipType {
  INVALID = 0,
  UNTIL_CLICK_WAIT,
  UNTIL_S,
  WHILE_PRESSING_CTRL,
}

const DEFAULT_LAYER_COUNT = 40;
const DEFAULT_MESSAGE_LAYER_NUM = 20;
const DEFAULT_LINE_BREAK_LAYER_NUM = 21;
const DEFAULT_PAGE_BREAK_LAYER_NUM = 22;
const DEFAULT_AUTO_MODE_LAYER_NUM = 23;
const DEFAULT_SOUND_BUFFER_COUNT = 5;

export class Ponkan3 extends PonGame implements IConductorEvent {
  // ゲーム設定
  public raiseError: any = {
    unknowntag: true,
  };

  // conductor
  protected _conductor: Conductor;
  public get conductor(): Conductor { return this._conductor; }
  public skipMode: SkipType = SkipType.INVALID;
  public autoModeFlag: boolean = false;
  public autoModeInterval: number = 1000;
  public autoModeStartTick: number = -1;
  public autoModeLayerNum: number = DEFAULT_AUTO_MODE_LAYER_NUM;
  // public canStopSkipByTag: boolean = false;

  // タグ関係
  public readonly tagActions: any = {};

  // レイヤ関係
  protected _layerCount: number = DEFAULT_LAYER_COUNT;
  // public set layerCount(layerCount: number) { this._layerCount = layerCount; }
  public forePrimaryLayer: PonLayer;
  public backPrimaryLayer: PonLayer;
  public get foreLayers(): PonLayer[] { return this.forePrimaryLayer.children as PonLayer[]; }
  public get backLayers(): PonLayer[] { return this.backPrimaryLayer.children as PonLayer[]; }
  public currentPage: "fore" | "back" = "fore";

  // メッセージ関係
  protected currentTextSpeed: number = 100;
  public nowaitModeFlag: boolean = false;
  protected _messageLayerNum: number = 20;
  public get messageLayerNum(): number { return this._messageLayerNum; }
  public set messageLayerNum(num: number) { this._messageLayerNum = num; }

  protected _lineBreakGlyphLayerNum: number = DEFAULT_LINE_BREAK_LAYER_NUM;
  public get lineBreakGlyphLayerNum(): number { return this._lineBreakGlyphLayerNum; }
  public set lineBreakGlyphLayerNum(num: number) { this._lineBreakGlyphLayerNum = num; }
  public lineBreakGlyphPos: "eol" | "relative" | "absolute" = "eol";
  public lineBreakGlyphX: number = 0;
  public lineBreakGlyphY: number = 0;

  protected _pageBreakGlyphLayerNum: number = DEFAULT_PAGE_BREAK_LAYER_NUM;
  public get pageBreakGlyphLayerNum(): number { return this._pageBreakGlyphLayerNum; }
  public set pageBreakGlyphLayerNum(num: number) { this._pageBreakGlyphLayerNum = num; }
  public pageBreakGlyphPos: "eol" | "relative" | "absolute" = "eol";
  public pageBreakGlyphX: number = 0;
  public pageBreakGlyphY: number = 0;

  // サウンド関係
  public soundBufferCount: number = DEFAULT_SOUND_BUFFER_COUNT;
  public readonly soundBuffers: SoundBuffer[] = [];

  public get tmpVar(): any { return this.resource.tmpVar; }
  public get gameVar(): any { return this.resource.gameVar; }
  public get systemVar(): any { return this.resource.systemVar; }

  protected saveDataPrefix: string = "ponkan-game";
  protected latestSaveData: any = {};

  public constructor(parentId: string, config: any = {}) {
    super(parentId, config);
    if (config.saveDataPrefix != null) { this.saveDataPrefix = config.saveDataPrefix; }

    this._conductor = new Conductor(this.resource, this);

    this.initTagAction();

    this.forePrimaryLayer =
      this.addForePrimaryLayer(new PonLayer("Fore primary layer", this.resource, this)) as PonLayer;
    this.backPrimaryLayer =
      this.addBackPrimaryLayer(new PonLayer("Back primary layer", this.resource, this)) as PonLayer;
    this.initLayers();

    this.initSounds(config);

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
    //   // this.addForePrimaryLayer(layer2);
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
    this.resource.loadSystemData(this.saveDataPrefix);
    this.conductor.loadScript("start.pon").done(() => {
      Logger.debug("onLoadScript success");
      this.conductor.start();
    }).fail(() => {
      Logger.debug("onLoadScript fail");
    });
  }

  public stop(): void {
    super.stop();
    this.resource.saveSystemData(this.saveDataPrefix);
  }

  protected update(tick: number): void {
    // オートモードによるクリックエミュレーション
    if (this.autoModeFlag && this.autoModeStartTick >= 0) {
      let elapsed = tick - this.autoModeStartTick;
      if (elapsed >= this.autoModeInterval) {
        console.log('@@@@@@@@@@@@@AUTO CLICk', elapsed);
        this.onPrimaryClick();
        this.autoModeStartTick = -1;
        // onPrimaryClickで解除されてしまうのでもう一回
        this.startAutoMode();
      }
    }
    this.conductor.conduct(tick);
    this.forePrimaryLayer.update(tick);
    this.backPrimaryLayer.update(tick);
  }

  public error(e: Error): void {
    this.conductor.stop();
    let message: string = e.message;

    const filePath: string = this.conductor.script.filePath;
    const latestTag: Tag | null = this.conductor.script.getLatestTag();
    if (latestTag !== null) {
      message = `(${filePath}:${latestTag.line}) ` + message;
    } else {
      message = `(${filePath}:1) ` + message;
    }

    super.error(new Error(message));
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
      return false;
    }
    return this.onPrimaryClick();
  }

  public onPrimaryClick(): boolean {
    // skipタグで開始されたスキップモードを停止する
    // FIXME 入力で停止できるかどうか、タグで指定できるようにするべきではないか。
    this.skipMode = SkipType.INVALID;

    // オートモードを停止する
    this.stopAutoMode();

    // コンダクターのスリープを解除する。
    // テキスト出力のウェイト、waitタグの動作を解除し、次のwait系タグまで飛ばす。
    // TODO canskipタグの判定必要か検討する
    if (this.conductor.status === ConductorState.Sleep) {
      this.conductor.start();
      this.skipMode = SkipType.UNTIL_CLICK_WAIT;
    }

    // トリガーを発火
    this.trigger("click", this);

    return true;
  }

  // =========================================================
  // キーボード
  // =========================================================

  public onKeyDown(e: PonKeyEvent): boolean {
    Logger.debug("onKeyDown: ", e.key);
    switch (e.key) {
      case "Ctrl": case "ctrl": case "Control":
        this.onPrimaryClick();
        this.startSkipByCtrl();
        break;
    }
    return true;
  }

  public onKeyUp(e: PonKeyEvent): boolean {
    Logger.debug("onKeyUp: ", e.key);
    switch (e.key) {
      case "Ctrl": case "ctrl": case "Control":
        this.stopWhilePressingCtrlSkip();
        break;
      case "Enter": case "enter":
        this.onPrimaryClick();
        break;
    }
    return true;
  }

  // =========================================================
  // タグ動作
  // =========================================================
  private initTagAction() {
    generateTagActions(this).forEach((tagAction) => {
      Logger.debug(tagAction);
      tagAction.names.forEach((name) => {
        this.tagActions[name] = tagAction;
      });
    });
    Logger.debug("TagActionMap: ", this.tagActions);
  }

  // =========================================================
  // コンダクタ
  // =========================================================
  public onTag(tag: Tag, line: number, tick: number): "continue" | "break" {
    Logger.debug("onTag: ", tag.name, tag.values, tag);
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

    return tagAction.action(tag.values, tick);
  }

  public onLabel(labelName: string, line: number, tick: number): "continue" | "break" {
    Logger.debug("onLabel: ", labelName);
    // TODO
    return "continue";
  }

  public onSaveMark(saveMarkName: string, comment: string, line: number, tick: number): "continue" | "break" {
    Logger.debug("onSaveMark: ", saveMarkName, comment);
    this.updateSaveData(saveMarkName, comment, tick);
    return "continue";
  }

  public onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break" {
    Logger.debug("onJs: ", js);
    const text = this.resource.evalJs(js);
    if (printFlag) {
      const tag = new Tag("ch", { text: "" + text }, line);
      return this.onTag(tag, line, tick);
    } else {
      return "continue";
    }
  }

  public onChangeStable(isStable: boolean): void {
    this.forePrimaryLayer.onChangeStable(isStable);
    this.backPrimaryLayer.onChangeStable(isStable);
  }

  // =========================================================
  // スキップ／オート関係
  // =========================================================

  public get isSkipping(): boolean  {
    return this.skipMode !== SkipType.INVALID;
  }

  public startSkipByTag(): void {
    this.skipMode = SkipType.UNTIL_S;
  }

  public startSkipByCtrl(): void {
    this.skipMode = SkipType.WHILE_PRESSING_CTRL;
  }

  public stopWhilePressingCtrlSkip(): void {
    if (this.skipMode === SkipType.WHILE_PRESSING_CTRL) {
      this.stopSkip();
    }
  }

  public stopUntilClickSkip(): void {
    if (this.skipMode === SkipType.UNTIL_CLICK_WAIT) {
      this.stopSkip();
    }
  }

  public stopSkip(): void {
    this.skipMode = SkipType.INVALID;
  }

  public get autoModeLayer(): PonLayer {
    return this.foreLayers[this.autoModeLayerNum];
  }

  public startAutoMode(): void {
    this.autoModeFlag = true;
    this.autoModeStartTick = -1;
    this.autoModeLayer.visible = true;
  }

  public stopAutoMode(): void {
    this.autoModeFlag = false;
    this.autoModeStartTick = -1;
    this.autoModeLayer.visible = false;
  }

  public reserveAutoClick(tick: number): void {
    if (this.autoModeFlag) {
      this.autoModeStartTick = tick;
    }
  }

  // =========================================================
  // サウンド
  // =========================================================

  private initSounds(config: any) {
    if (config.soundBufferCount != null) {
      this.soundBufferCount = +config.soundBufferCount;
    }

    const callbacks: ISoundCallbacks = {
      onFadeComplete: (bufferNum: number) => {
        this.onSoundFadeComplete(bufferNum);
      },
    };
    for (let i = 0; i < this.soundBufferCount; i++) {
      this.soundBuffers.push(new SoundBuffer(this.resource, i, callbacks));
    }
  }

  public getSoundBuffer(num: number): SoundBuffer {
    const soundBuffer: SoundBuffer | null = this.soundBuffers[num];
    if (soundBuffer == null) {
      throw new Error(`音声バッファ${num}番は範囲外です`);
    } else {
      return soundBuffer;
    }
  }

  public getSound(num: number): Sound {
    const sound: Sound | null = this.soundBuffers[num].sound;
    if (sound == null) {
      throw new Error(`音声バッファ${num}は音声がロードされていません`);
    } else {
      return sound;
    }
  }

  public onSoundFadeComplete(bufferNum: number) {
    // TODO waitfadeなどの対応
    Logger.debug("onSoundFadeComplete: ", bufferNum);
  }

  // =========================================================
  // レイヤ
  // =========================================================

  // [override]
  public flipPrimaryLayers(): void {
    let tmp = this.forePrimaryLayer;
    this.forePrimaryLayer = this.backPrimaryLayer;
    this.backPrimaryLayer = tmp;
    super.flipPrimaryLayers();
  }

  private initLayers() {
    [this.forePrimaryLayer, this.backPrimaryLayer].forEach((primaryLayer: PonLayer) => {
      primaryLayer.x = 0;
      primaryLayer.y = 0;
      primaryLayer.width = this.width;
      primaryLayer.height = this.height;
      primaryLayer.setBackgroundColor(0x000000, 1.0);
    });
    for (let i = 0; i < this.layerCount; i++) {
      this.forePrimaryLayer.addChild(this.createLayer(`fore layer ${i}`));
      this.backPrimaryLayer.addChild(this.createLayer(`back layer ${i}`));
    }
  }

  public get layerCount(): number { return this._layerCount; }
  public set layerCount(layerCount: number) {
    if (layerCount < this._layerCount) {
      // 減少するとき
      [this.forePrimaryLayer, this.backPrimaryLayer].forEach((primaryLayer) => {
        const oldList = primaryLayer.children;
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
   * レイヤを作成する。
   * rendererへの追加は行わないので、他のレイヤの子レイヤにする必要がある。
   */
  public createLayer(name: string) {
    const layer = new PonLayer(name, this.resource, this);
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
    } else if (lay === "mes" || lay === "message") {
      targetLayers.push(pageLayers[this.messageLayerNum]);
    } else if (lay === "linebreak") {
      targetLayers.push(pageLayers[this.lineBreakGlyphLayerNum]);
    } else if (lay === "pagebreak") {
      targetLayers.push(pageLayers[this.pageBreakGlyphLayerNum]);
    } else if (lay === "auto" || lay === "automode") {
      targetLayers.push(pageLayers[this.autoModeLayerNum]);
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

  public get textSpeed(): number {
    if (this.nowaitModeFlag) {
      return 0;
    } else {
      return this.currentTextSpeed;
    }
  }

  public set textSpeed(textSpeed: number) {
    this.currentTextSpeed = textSpeed;
  }

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
    y: number,
  ): void {
    const mesLay = this.messageLayer;
    if (pos === "eol") {
      const glyphPos = mesLay.getNextTextPos(lay.width);
      lay.x = mesLay.x + glyphPos.x;
      lay.y = mesLay.y + glyphPos.y + mesLay.textLineHeight - lay.height;
    } else if (pos === "relative") {
      lay.x = mesLay.x + x;
      lay.y = mesLay.y + y;
    } else if (pos === "absolute") {
      lay.x = x;
      lay.y = y;
    }
    if (lay.hasFrameAnim) {
      lay.stopFrameAnim();
      lay.startFrameAnim(tick);
    }
    lay.visible = true;
  }

  public hideBreakGlyph(): void {
     this.pageBreakGlyphLayer.visible = false;
     this.lineBreakGlyphLayer.visible = false;
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

  // =========================================================
  // トランジション
  // =========================================================

  public waitTransClickCallback() {
    Logger.debug("click on trans. called waitTransClickCallback");
    this.clearEventHandler("trans");
    this.transManager.stop();
    this.conductor.start();
  }

  public waitTransCompleteCallback() {
    Logger.debug("complete trans. called waitTransCompleteCallback");
    this.clearEventHandler("click");
    this.conductor.start();
  }


  // =========================================================
  // セーブ・ロード
  // =========================================================

  public onWindowClose(): boolean {
    this.resource.saveSystemData(this.saveDataPrefix);
    return true;
  }

  public save(num: number, tick: number): void {
    // TODO 実装
    Logger.debug("==SAVE=============================================");
    Logger.debug(num, this.latestSaveData);
    Logger.debug("===================================================");

    let saveStr: string;
    try {
      saveStr = JSON.stringify(this.latestSaveData);
    } catch (e) {
      Logger.error(e);
      throw new Error("セーブデータの保存に失敗しました。JSON文字列に変換できません");
    }
    this.resource.storeToLocalStorage(`${this.saveDataPrefix}_${num}`, saveStr);

    const comment: string = this.latestSaveData.comment;
    if (this.systemVar.saveComments == null) { this.systemVar.saveComments = []; }
    this.systemVar.saveComments[num] = {
      date: this.getNowDateStr(),
      name: this.latestSaveData.name,
      comment: this.latestSaveData.comment,
    };
    this.resource.saveSystemData(this.saveDataPrefix);
  }

  public getNowDateStr(): string {
    const d: Date = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const millisecond = d.getMilliseconds();
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${millisecond}`;
  }

  protected static ponkanStoreParams: string[] = [
    // "skipMode",
    // "canStopSkipByTag",
    // "autoModeFlag",
    "autoModeInterval",
    "layerCount",
    "currentPage",
    "currentTextSpeed",
    "nowaitModeFlag",
    "messageLayerNum",
    "lineBreakGlyphLayerNum",
    "lineBreakGlyphPos",
    "lineBreakGlyphX",
    "lineBreakGlyphY",
    "pageBreakGlyphLayerNum",
    "pageBreakGlyphPos",
    "pageBreakGlyphX",
    "pageBreakGlyphY",
  ];

  protected updateSaveData(saveMarkName: string, comment: string, tick: number): void {
    const data: any = this.latestSaveData = {};
    const me: any = this as any;

    data.tick = tick;
    data.saveMarkName = saveMarkName;
    data.comment = comment;

    Ponkan3.ponkanStoreParams.forEach((param: string) => {
      data[param] = me[param];
    });

    data.gameVar = Util.objClone(this.gameVar);
    data.conductor = this.conductor.store(saveMarkName, tick);

    data.forePrimaryLayer = this.forePrimaryLayer.store(tick);
    data.foreLayers = [];
    this.foreLayers.forEach((layer) => {
      data.foreLayers.push(layer.store(tick));
    });
    data.backPrimaryLayer = this.backPrimaryLayer.store(tick);
    data.backLayers = [];
    this.backLayers.forEach((layer) => {
      data.backLayers.push(layer.store(tick));
    });

    data.soundBuffers = [];
    this.soundBuffers.forEach((sound) => {
      data.soundBuffers.push(sound.store(tick));
    });
  }

  public load(num: number, tick: number): AsyncCallbacks {
    const asyncTask = new AsyncTask();
    const me: any = this as any;
    const dataStr: string = this.resource.restoreFromLocalStorage(`${this.saveDataPrefix}_${num}`);
    const data: any = JSON.parse(dataStr);

    console.log(data);

    Ponkan3.ponkanStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    // layer
    this.forePrimaryLayer.restore(asyncTask, data.forePrimaryLayer, tick);
    this.backPrimaryLayer.restore(asyncTask, data.backPrimaryLayer, tick);

    for (let i = 0; i < data.foreLayers.length; i++) {
      this.foreLayers[i].restore(asyncTask, data.foreLayers[i], tick);
      this.backLayers[i].restore(asyncTask, data.backLayers[i], tick);
    }

    // sound
    this.soundBuffers.forEach((sb) => {
      if (sb.sound != null) { sb.sound.stop(); }
    });
    for (let i = 0; i < data.soundBuffers.length; i++) {
      if (this.soundBuffers[i] != null) {
        this.soundBuffers[i].restore(asyncTask, data.soundBuffers[i], tick);
      }
    }

    // conductor
    this.conductor.restore(asyncTask, data.conductor, tick);

    // スキップとオートモードは停止させる
    asyncTask.add((params: any, index: number): AsyncCallbacks => {
      let cb = new AsyncCallbacks();
      window.setTimeout(() => {
        this.stopSkip();
        this.stopAutoMode();
      }, 0);
      return cb;
    });

    return asyncTask.run();
  }

}

(window as any).Ponkan3 = Ponkan3;
