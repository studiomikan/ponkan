import { AsyncCallbacks } from "./base/async-callbacks";
import { AsyncTask } from "./base/async-task";
import { BaseLayer, IBaseLayerEventListener } from "./base/base-layer";
import { Conductor, ConductorState, IConductorEvent } from "./base/conductor";
import { Logger } from "./base/logger";
import { PonEventHandler } from "./base/pon-event-handler";
import { PonGame } from "./base/pon-game";
import { PonKeyEvent } from "./base/pon-key-event";
import { PonMouseEvent } from "./base/pon-mouse-event";
import { PonWheelEvent } from "./base/pon-wheel-event";
import { ISoundBufferCallbacks, SoundBuffer } from "./base/sound";
import { Tag } from "./base/tag";
import * as Util from "./base/util";
import { HistoryLayer } from "./layer/history-layer";
import { PonLayer } from "./layer/pon-layer";
import { PonPlugin } from "./plugin/pon-plugin";
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

export class Ponkan3 extends PonGame {
  // ゲーム設定
  public raiseError: any = {
    unknowntag: true,
  };

  protected initialAsyncTask: AsyncTask;

  public skipMode: SkipType = SkipType.INVALID;
  public canSkipUnreadPart: boolean = false;
  public canSkipUnreadPartByCtrl: boolean = true;
  public autoModeFlag: boolean = false;
  public autoModeInterval: number = 1000;
  public autoModeStartTick: number = -1;
  public autoModeLayerNum: number = DEFAULT_AUTO_MODE_LAYER_NUM;
  // public canStopSkipByTag: boolean = false;

  // タグ関係
  public readonly tagActions: any = {};

  // レイヤ関係
  protected _layerCount: number = DEFAULT_LAYER_COUNT;
  public layerAlias: any = {};
  public forePrimaryLayer: PonLayer;
  public backPrimaryLayer: PonLayer;
  public get foreLayers(): PonLayer[] { return this.forePrimaryLayer.children as PonLayer[]; }
  public get backLayers(): PonLayer[] { return this.backPrimaryLayer.children as PonLayer[]; }
  public currentPage: "fore" | "back" = "fore";
  public isQuaking: boolean = false;
  protected quakeStartTick: number = -1;
  protected quakeTime: number = 0;
  protected quakeMaxX: number = 20;
  protected quakeMaxY: number = 20;
  protected isQuakePhase: boolean = true;
  protected quakeFrameCount: number = 0;
  protected quakeIntervalFrame: number = 4;

  // メッセージ関係
  public textSpeedMode: "user" | "system" = "user";
  public unreadTextSpeed: number = 100; // "system" の時の速度
  public readTextSpeed: number = 100; // "system" の時の速度
  public userUnreadTextSpeed: number = 100; // "user" の時の速度
  public userReadTextSpeed: number = 100; // "user" の時の速度
  public clickSkipEnabled: boolean = true;
  public nowaitModeFlag: boolean = false;
  public addCharWithBackFlag: boolean = false;
  public hideMessageFlag: boolean = false;
  public hideMessageByRlickFlag: boolean = false;
  protected _messageLayerNum: number = 20;
  public get messageLayerNum(): number { return this._messageLayerNum; }
  public set messageLayerNum(num: number) {
    if (this.messageLayerEventListener != null) {
      this.messageLayer.delEventListener(this.messageLayerEventListener);
    }
    this._messageLayerNum = num;
    const _this = this;
    this.messageLayerEventListener = {
      onChangeX(sender: BaseLayer, x) { _this.onChangeMessageLayerPos(); },
      onChangeY(sender: BaseLayer, y) { _this.onChangeMessageLayerPos(); }
    };
    this.messageLayer.addEventListener(this.messageLayerEventListener);
  }
  public messageLayerEventListener: IBaseLayerEventListener | null = null;

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

  // 右クリック
  public rightClickJump: boolean = false;
  public rightClickCall: boolean = false;
  public rightClickFilePath: string | null = null;
  public rightClickLabel: string | null = null;
  public rightClickEnabled: boolean = true;

  // メッセージ履歴
  public historyLayer: HistoryLayer;
  public enabledHistory: boolean = true;

  // サウンド関係
  public soundBufferAlias: any = {};
  public soundBufferCount: number = DEFAULT_SOUND_BUFFER_COUNT;
  public readonly soundBuffers: SoundBuffer[] = [];

  // セーブ＆ロード
  protected saveDataPrefix: string = "ponkan-game";
  protected latestSaveComment: string = "";
  protected latestSaveData: any = {};
  protected tempSaveData: any = {};

  public get tmpVar(): any { return this.resource.tmpVar; }
  public get gameVar(): any { return this.resource.gameVar; }
  public get systemVar(): any { return this.resource.systemVar; }

  // プラグイン
  protected plugins: PonPlugin[] = [];

  public constructor(parentId: string, config: any = {}) {
    super(parentId, config);
    if (config.saveDataPrefix != null) { this.saveDataPrefix = config.saveDataPrefix; }

    this.initialAsyncTask = new AsyncTask();

    this.initTagAction();

    this.forePrimaryLayer =
      this.addForePrimaryLayer(new PonLayer("Fore primary layer", this.resource, this)) as PonLayer;
    this.backPrimaryLayer =
      this.addBackPrimaryLayer(new PonLayer("Back primary layer", this.resource, this)) as PonLayer;
    this.initLayers(config);

    this.historyLayer = new HistoryLayer("HistoryLayer", this.resource, this);
    this.addForePrimaryLayer(this.historyLayer);
    this.historyLayer.visible = false;
    this.historyLayer.init(config, this.initialAsyncTask);

    this.initSoundBuffers(config);
  }

  public destroy() {
    this.stop();
    this.forePrimaryLayer.destroy();
    this.backPrimaryLayer.destroy();
    this.plugins.forEach((p) => p.destroy());
    super.destroy();
  }

  public start(): void {
    super.start();
    if (this.resource.existSystemData(this.saveDataPrefix)) {
      // this.resource.loadSystemData(this.saveDataPrefix);
      this.loadSystemData(this.saveDataPrefix, this.initialAsyncTask);
    }
    this.initialAsyncTask.run().done(() => {
      this.conductor.loadScript("start.pon").done(() => {
        // Logger.debug("onLoadScript success");
        this.conductor.start();
      }).fail(() => {
        // Logger.debug("onLoadScript fail");
      });
    });
  }

  public stop(): void {
    super.stop();
  }

  protected update(tick: number): void {
    // オートモードによるクリックエミュレーション
    if (this.autoModeFlag && this.autoModeStartTick >= 0) {
      const elapsed = tick - this.autoModeStartTick;
      if (elapsed >= this.autoModeInterval) {
        this.autoModeStartTick = -1;
        this.onPrimaryClick();
        // onPrimaryClickで解除されてしまうのでもう一回
        this.startAutoMode();
      }
    }

    this.conductor.conduct(tick);
    this.forePrimaryLayer.update(tick);
    this.backPrimaryLayer.update(tick);
    this.historyLayer.update(tick);

    // オートモード中は強制的に状態を表示
    this.autoModeLayer.visible = this.autoModeFlag;
  }

  protected beforeDraw(tick: number): void  {
    this.quake(tick);
  }

  public error(e: Error): void {
    this.conductor.stop();
    let message: string = e.message;

    const filePath = this.conductor.latestScriptFilePath;
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

  protected get eventReceivesLayer(): BaseLayer {
    return this.historyLayer.visible ? this.historyLayer : this.forePrimaryLayer;
  }

  public onMouseEnter(e: PonMouseEvent): boolean  {
    return this.eventReceivesLayer.onMouseEnter(e);
  }
  public onMouseLeave(e: PonMouseEvent): boolean  {
    return this.eventReceivesLayer.onMouseLeave(e);
  }
  public onMouseMove(e: PonMouseEvent): boolean  {
    return this.eventReceivesLayer.onMouseMove(e);
  }
  public onMouseDown(e: PonMouseEvent): boolean  {
    return this.eventReceivesLayer.onMouseDown(e);
  }
  public onMouseUp(e: PonMouseEvent): boolean  {
    if (!this.eventReceivesLayer.onMouseUp(e)) {
      return false;
    }
    if (e.isRight) {
      return this.onPrimaryRightClick();
    } else {
      return this.onPrimaryClick();
    }
  }

  /** マウスホイールによる読み進め処理が連続して発生しないようにするためのフラグ */
  protected onMouseWheelLocked: boolean = false;
  public onMouseWheel(e: PonWheelEvent): boolean {
    if (this.historyLayer.visible) {
      return this.historyLayer.onMouseWheel(e);
    } else {
      if (!this.forePrimaryLayer.onMouseWheel(e)) {
        return false;
      } else if (this.conductor.isStable && this.enabledHistory && e.isUp) {
        this.showHistoryLayer();
        return false;
      } else if (!this.onMouseWheelLocked && e.isDown) {
        this.onMouseWheelLocked = true;
        window.setTimeout(() => {
          this.onMouseWheelLocked = false;
        }, 500);
        return this.onPrimaryClick();
      } else {
        return true;
      }
    }
  }

  public onPrimaryClick(): boolean {
    // 右クリックによるメッセージ隠し状態なら、解除して終わり
    if (this.hideMessageByRlickFlag) {
      this.showMessages();
      this.hideMessageByRlickFlag = false;
      return true;
    }

    // トリガーを発火
    if (this.conductor.trigger("click")) {
      return true;
    }

    // skipタグで開始されたスキップモードを停止する
    // FIXME 入力で停止できるかどうか、タグで指定できるようにするべきではないか。
    this.skipMode = SkipType.INVALID;

    // オートモードを停止する
    this.stopAutoMode();

    // コンダクターのスリープを解除する。
    // テキスト出力のウェイトの動作を解除し、次のwait系タグまで飛ばす。
    if (this.clickSkipEnabled &&
        this.conductor.status === ConductorState.Sleep &&
        this.conductor.sleepSender === "ch") {
      this.conductor.start();
      this.skipMode = SkipType.UNTIL_CLICK_WAIT;
    }

    return true;
  }

  public onPrimaryRightClick(): boolean {
    if (!this.rightClickEnabled) {
      return false;
    }
    if (!this.conductor.isStable) {
      return false;
    }

    if (this.autoModeFlag) {
      this.stopAutoMode();
    }
    if (this.isSkipping) {
      this.stopSkip();
    }

    if (this.rightClickJump) {
      // ジャンプさせる
      this.conductor.jump(this.rightClickFilePath, this.rightClickLabel, false).done(() => {
        this.conductor.start();
      });
    } else if (this.rightClickCall) {
      // 右クリックサブルーチン呼び出し
      this.callSubroutine(this.rightClickFilePath, this.rightClickLabel, false);
    } else {
      // デフォルト動作：メッセージレイヤを隠す／戻す
      if (this.hideMessageFlag) {
        if (this.hideMessageByRlickFlag) {
          // 右クリックによるメッセージ隠し中
          this.showMessagesByRightClick();
        } else {
          // タグによるメッセージ隠し中
          // clickにイベントハンドラが登録されてるのでそいつを呼んで復帰
          this.conductor.trigger("click");
        }
      } else {
        this.hideMessagesByRightClick();
      }
    }
    return false;
  }

  // =========================================================
  // キーボード
  // =========================================================

  public onKeyDown(e: PonKeyEvent): boolean {
    // Logger.debug("onKeyDown: ", e.key);
    if (this.historyLayer.visible) {
      // do nothing.
    } else {
      switch (e.key) {
        case "Ctrl": case "ctrl": case "Control":
          this.onPrimaryClick();
          this.startSkipByCtrl();
          break;
      }
    }
    return true;
  }

  public onKeyUp(e: PonKeyEvent): boolean {
    // Logger.debug("onKeyUp: ", e.key, this.historyLayer.visible);
    if (this.historyLayer.visible) {
      switch (e.key.toLowerCase()) {
        case "esc": case "escape":
          this.hideHistoryLayer();
          break;
        case "arrowup":
          if (this.conductor.isStable) { this.historyLayer.scrollUpPage(); }
          break;
        case "arrowdown":
          if (this.conductor.isStable) { this.historyLayer.scrollDownPage(); }
          break;
      }
    } else {
      switch (e.key.toLowerCase()) {
        case "ctrl": case "control":
          this.stopWhilePressingCtrlSkip();
          break;
        case "esc": case "escape":
          this.onPrimaryRightClick();
          break;
        case "enter":
          this.onPrimaryClick();
          break;
        case "arrowup":
          if (this.conductor.isStable && this.enabledHistory) {
            this.showHistoryLayer();
          }
          break;
      }
    }
    return true;
  }

  // =========================================================
  // タグ動作
  // =========================================================
  private initTagAction() {
    generateTagActions(this).forEach((tagAction) => {
      // Logger.debug(tagAction);
      tagAction.names.forEach((name) => {
        this.tagActions[name] = tagAction;
      });
    });
    // Logger.debug("TagActionMap: ", this.tagActions);
  }

  public addCommandShortcut(ch: string, command: string) {
    if (ch.length !== 1) {
      throw new Error("コマンドショートカットには1文字しか指定できません");
    }
    this.conductor.commandShortcut[ch] = command;
  }

  public delCommandShortcut(ch: string) {
    delete this.conductor.commandShortcut[ch];
  }

  // =========================================================
  // コンダクタ
  // =========================================================
  public onLoadNewScript(labelName: string | null, countPage: boolean): void {
    if (labelName == null || labelName === "") {
      labelName = "__start__";
    }
  }

  public onTag(tag: Tag, line: number, tick: number): "continue" | "break" {
    // Logger.debug("onTag: ", tag.name, tag.values, tag);
    const tagAction: TagAction = this.tagActions[tag.name];
    if (tagAction === null || tagAction === undefined) {
      // Logger.debug("Unknown Tag: ", tag.name, tag);
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
    // Logger.debug("onLabel: ", labelName);
    return "continue";
  }

  public onSaveMark(saveMarkName: string, comment: string, line: number, tick: number): "continue" | "break" {
    // Logger.debug("onSaveMark: ", saveMarkName, comment);

    // 未読の場合はスキップを停止する
    if (!this.conductor.isPassed(saveMarkName)) {
      if (this.skipMode === SkipType.WHILE_PRESSING_CTRL) {
        if (!this.canSkipUnreadPartByCtrl) {
          this.stopSkip();
        }
      } else if (this.isSkipping) {
        if (!this.canSkipUnreadPart) {
          this.stopSkip();
        }
      }
    }

    if (comment != null && comment !== "") {
      this.latestSaveComment = comment;
    }
    this.latestSaveData = this.generateSaveData(saveMarkName, this.latestSaveComment, tick);
    return "continue";
  }

  public onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break" {
    // Logger.debug("onJs: ", js);
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
    this.plugins.forEach((p) => p.onChangeStable(isStable));
  }

  public onReturnSubroutin(forceStart: boolean = false): void {
    this.conductor.trigger("return_subroutin");
    if (forceStart) {
      this.hideBreakGlyph();
    }
  }

  // =========================================================
  // スキップ／オート関係
  // =========================================================

  public get isSkipping(): boolean  {
    return this.skipMode !== SkipType.INVALID;
  }

  public startSkipByTag(): void {
    if (this.conductor.isPassedLatestSaveMark() || this.canSkipUnreadPart) {
      this.skipMode = SkipType.UNTIL_S;
    }
  }

  public startSkipByCtrl(): void {
    if (this.conductor.isPassedLatestSaveMark() || this.canSkipUnreadPartByCtrl) {
      this.skipMode = SkipType.WHILE_PRESSING_CTRL;
    }
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

  private initSoundBuffers(config: any) {
    if (config.soundBufferCount != null) {
      this.soundBufferCount = +config.soundBufferCount;
    }

    const callbacks: ISoundBufferCallbacks = {
      onStop: (bufferNum: number) => {
        this.onSoundStop(bufferNum);
      },
      onFadeComplete: (bufferNum: number) => {
        this.onSoundFadeComplete(bufferNum);
      },
    };
    for (let i = 0; i < this.soundBufferCount; i++) {
      this.soundBuffers.push(new SoundBuffer(this.resource, i, callbacks));
    }
  }

  public getSoundBuffer(num: string): SoundBuffer {
    if (this.soundBufferAlias[num] != null) {
      return this.getSoundBuffer(this.soundBufferAlias[num]);
    }
    const soundBuffer: SoundBuffer | null = this.soundBuffers[+num];
    if (soundBuffer == null) {
      throw new Error(`音声バッファ${num}は範囲外です`);
    } else {
      return soundBuffer;
    }
  }

  // public getSound(num: number): Sound {
  //   const sound: Sound | null = this.soundBuffers[num].sound;
  //   if (sound == null) {
  //     throw new Error(`音声バッファ${num}は音声がロードされていません`);
  //   } else {
  //     return sound;
  //   }
  // }

  public onSoundStop(bufferNum: number) {
    this.conductor.trigger("soundstop");
  }

  public onSoundFadeComplete(bufferNum: number) {
    this.conductor.trigger("soundfade");
  }

  public waitSoundCompleteCallback(sb: SoundBuffer): void {
    this.conductor.clearEventHandlerByName("click");
    this.conductor.start();
  }

  public waitSoundStopClickCallback(sb: SoundBuffer): void {
    this.conductor.clearEventHandlerByName("soundstop");
    sb.stop();
    this.conductor.start();
  }

  public waitSoundFadeCompleteCallback(sb: SoundBuffer): void {
    this.conductor.clearEventHandlerByName("click");
    this.conductor.start();
  }

  public waitSoundFadeClickCallback(sb: SoundBuffer): void {
    this.conductor.clearEventHandlerByName("soundfade");
    sb.endFade();
    this.conductor.start();
  }

  // =========================================================
  // レイヤ
  // =========================================================

  private initLayers(config: any) {
    [this.forePrimaryLayer, this.backPrimaryLayer].forEach((primaryLayer: PonLayer) => {
      primaryLayer.x = 0;
      primaryLayer.y = 0;
      primaryLayer.width = this.width;
      primaryLayer.height = this.height;
      primaryLayer.visible = true;
      primaryLayer.setBackgroundColor(0x000000, 1.0);
    });
    for (let i = 0; i < this.layerCount; i++) {
      this.forePrimaryLayer.addChild(this.createLayer(`fore layer ${i}`));
      this.backPrimaryLayer.addChild(this.createLayer(`back layer ${i}`));
    }

    // デフォルト設定の反映
    if (config.layersDefault != null) {
      this.foreLayers.forEach((lay) => lay.applyConfig(config.layersDefault));
      this.backLayers.forEach((lay) => lay.applyConfig(config.layersDefault));
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
    layer.visible = false;
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
    } else if (this.layerAlias[lay] != null) {
      return this.getTargetLayers(pageLayers, this.layerAlias[lay]);
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
    let page: string = "" + values.page as string;
    let pageLayers: PonLayer[];
    if (values.page == null || values.page === "current") {
      page = this.currentPage;
    }
    if (page === "back") {
      pageLayers = this.backLayers;
    } else {
      pageLayers = this.foreLayers;
    }
    return this.getTargetLayers(pageLayers, lay);
  }

  public get hasMovingLayer(): boolean {
    return this.foreLayers.filter((layer) => layer.isMoving && !layer.isLoopMoving).length > 0 ||
           this.backLayers.filter((layer) => layer.isMoving && !layer.isLoopMoving).length > 0;
  }

  public waitMoveClickCallback() {
    this.conductor.clearEventHandlerByName("move");
    this.foreLayers.forEach((layer) => layer.stopMove());
    this.backLayers.forEach((layer) => layer.stopMove());
    this.conductor.start();
  }

  public waitMoveCompleteCallback() {
    this.conductor.clearEventHandlerByName("click");
    this.conductor.start();
  }

  public waitFrameAnimClickCallback(layers: PonLayer[]) {
    this.conductor.clearEventHandlerByName("frameanim");
    layers.forEach((layer) => {
      layer.stopFrameAnim();
    });
    this.conductor.start();
  }

  public waitFrameAnimCompleteCallback(layers: PonLayer[]) {
    if (layers.filter((l) => l.frameAnimRunning).length === 0) {
      this.conductor.clearEventHandlerByName("click");
      this.conductor.start();
    }
  }

  // =========================================================
  // Quake
  // =========================================================

  public startQuake(tick: number, time: number, maxX: number, maxY: number): void {
    this.isQuaking = true;
    this.quakeStartTick = tick;
    this.quakeTime = time;
    this.quakeMaxX = maxX;
    this.quakeMaxY = maxY;
    this.isQuakePhase = true;
    this.quakeFrameCount = 0;
  }

  public stopQuake(): void {
    this.isQuaking = false;
    this.quakeStartTick = -1;
    this.quakeTime = 0;
    this.quakeMaxX = 20;
    this.quakeMaxY = 20;
    this.isQuakePhase = true;
    this.quakeFrameCount = 0;

    this.forePrimaryLayer.x = 0;
    this.forePrimaryLayer.y = 0;
    this.backPrimaryLayer.x = 0;
    this.backPrimaryLayer.y = 0;

    this.conductor.trigger("quake");
  }

  protected quake(tick: number): void {
    if (this.quakeFrameCount++ % this.quakeIntervalFrame !== 0) {
      return;
    }
    const elapsed: number = tick - this.quakeStartTick;
    if (elapsed > this.quakeTime) {
      this.stopQuake();
      return;
    }
    let x: number;
    let y: number;
    if (this.quakeMaxY === this.quakeMaxX) {
      x = Math.floor(Math.random() * this.quakeMaxX * 2 - this.quakeMaxX);
      y = Math.floor(Math.random() * this.quakeMaxY * 2 - this.quakeMaxY);
    } else if (this.quakeMaxX < this.quakeMaxY) {
      // 縦揺れ
      x = Math.floor(Math.random() * this.quakeMaxX * 2 - this.quakeMaxX);
      y = Math.floor((this.isQuakePhase ? Math.random() : -Math.random()) * this.quakeMaxY);
    } else {
      // 横揺れ
      x = Math.floor((this.isQuakePhase ? Math.random() : -Math.random()) * this.quakeMaxX);
      y = Math.floor(Math.random() * this.quakeMaxY * 2 - this.quakeMaxY);
    }
    this.forePrimaryLayer.x = x;
    this.forePrimaryLayer.y = y;
    this.backPrimaryLayer.x = x;
    this.backPrimaryLayer.y = y;
    this.isQuakePhase = !this.isQuakePhase;
  }

  // =========================================================
  // メッセージ
  // =========================================================

  public get textSpeed(): number {
    if (this.nowaitModeFlag) {
      return 0;
    } else if (this.conductor.isPassedLatestSaveMark()) {
      return this.textSpeedMode === "user" ? this.userReadTextSpeed : this.readTextSpeed;
    } else {
      return this.textSpeedMode === "user" ? this.userUnreadTextSpeed : this.unreadTextSpeed;
    }
  }

  /**
   * メッセージレイヤ（表）
   */
  public get messageLayer(): PonLayer {
    return this.foreLayers[this.messageLayerNum];
  }

  public get backMessageLayer(): PonLayer {
    return this.backLayers[this.messageLayerNum];
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
    this.resetBreakGlyphPos(lay, pos, x, y);
    // }
    if (lay.hasFrameAnim) {
      lay.stopFrameAnim();
      lay.startFrameAnim(tick);
    }
    lay.visible = true;
  }

  private resetBreakGlyphPos(
    lay: PonLayer,
    pos: "eol" | "relative" | "absolute" = "eol",
    x: number,
    y: number,
  ): void {
    const mesLay = this.messageLayer;
    if (pos === "eol") {
      const glyphPos = mesLay.getNextTextPos(" ", lay.width, lay.height);
      lay.x = mesLay.x + glyphPos.x;
      lay.y = mesLay.y + glyphPos.y;
    } else if (pos === "relative") {
      lay.x = mesLay.x + x;
      lay.y = mesLay.y + y;
    } else if (pos === "absolute") {
      lay.x = x;
      lay.y = y;
    }
  }

  public hideBreakGlyph(): void {
     this.pageBreakGlyphLayer.visible = false;
     this.lineBreakGlyphLayer.visible = false;
  }

  public hideMessages(): void {
    this.foreLayers.forEach((layer) => layer.storeVisible());
    this.foreLayers.forEach((layer) => {
      if (layer.autoHideWithMessage) {
        layer.visible = false;
      }
    });
    this.messageLayer.visible = false;
    this.lineBreakGlyphLayer.visible = false;
    this.pageBreakGlyphLayer.visible = false;
    this.plugins.forEach((p) => p.onChangeMessageVisible(false));
    this.hideMessageFlag = true;
  }

  public showMessages(): void {
    this.foreLayers.forEach((layer) => {
      layer.restoreVisible();
    });
    this.plugins.forEach((p) => p.onChangeMessageVisible(true));
    this.hideMessageFlag = false;
  }

  public hideMessagesByRightClick(): void {
    if (this.conductor.isStable && this.conductor === this.mainConductor) {
      this.hideMessages();
      this.hideMessageByRlickFlag = true;
    }
  }

  public showMessagesByRightClick(): void {
    if (this.hideMessageByRlickFlag) {
      this.showMessages();
      this.hideMessageByRlickFlag = false;
    }
  }

  private onChangeMessageLayerPos() {
    if (this.pageBreakGlyphPos === "eol" || this.pageBreakGlyphPos === "relative") {
      this.resetBreakGlyphPos(this.pageBreakGlyphLayer, this.pageBreakGlyphPos,
                              this.pageBreakGlyphX, this.pageBreakGlyphY);
    }
    if (this.lineBreakGlyphPos === "eol" || this.lineBreakGlyphPos === "relative") {
      this.resetBreakGlyphPos(this.lineBreakGlyphLayer, this.lineBreakGlyphPos,
                              this.lineBreakGlyphX, this.lineBreakGlyphY);
    }
  }

  // =========================================================
  // メッセージ履歴
  // =========================================================

  public onAddChar(sender: PonLayer, ch: string): void {
    if (sender === this.messageLayer) {
      this.historyLayer.addHistoryChar(ch);
    }
  }

  public onTextReturn(sender: PonLayer): void {
    if (sender === this.messageLayer) {
      this.historyLayer.addHistoryTextReturn();
    }
  }

  public showHistoryLayer(): void {
    this.historyLayer.goToEnd();
    this.historyLayer.show();
  }

  public hideHistoryLayer(): void {
    this.historyLayer.hide();
  }

  public historyTextReturn(): void {
    this.historyLayer.addHistoryTextReturn();
  }

  public addTextToHistory(text: string): void {
    for (let i = 0; i < text.length; i++) {
      this.historyLayer.addHistoryChar(text[i]);
    }
  }

  // =========================================================
  // トランジション
  // =========================================================

  public backlay(lay: string): void {
    const fore: PonLayer[] = this.getLayers({lay, page: "fore"});
    const back: PonLayer[] = this.getLayers({lay, page: "back"});
    for (let i = 0; i < fore.length; i++) {
      fore[i].copyTo(back[i]);
    }
    this.plugins.forEach((p) => p.onCopyLayer(true));
  }

  public copylay(srclay: string, destlay: string, srcpage: string, destpage: string): void {
    const srcLayers: PonLayer[] = this.getLayers({lay: srclay, page: srcpage});
    const destLayers: PonLayer[] = this.getLayers({lay: destlay, page: destpage});
    if (srcLayers.length !== destLayers.length) {
      throw new Error("コピー元と先のレイヤ数が異なります(copylay)");
    }
    for (let i = 0; i < srcLayers.length; i++) {
      if (srcLayers[i] !== destLayers[i]) {
        srcLayers[i].copyTo(destLayers[i]);
      }
    }
    this.plugins.forEach((p) => p.onCopyLayer(true));
  }

  // [override]
  public flipPrimaryLayers(): void {
    super.flipPrimaryLayers();
    const tmp = this.forePrimaryLayer;
    this.forePrimaryLayer = this.backPrimaryLayer;
    this.backPrimaryLayer = tmp;
    this.plugins.forEach((p) => p.onFlipLayers());

    this.removeForePrimaryLayer(this.historyLayer);
    this.removeBackPrimaryLayer(this.historyLayer);
    this.addForePrimaryLayer(this.historyLayer);
  }

  /**
   * [override]
   * トランジション完了時にTransManagerから呼ばれる。
   * この時点で表レイヤ・裏レイヤの入れ替えは完了している。
   */
  public onCompleteTrans(): boolean {
    this.currentPage = "fore";
    return super.onCompleteTrans();
  }

  public waitTransClickCallback() {
    this.conductor.clearEventHandlerByName("trans");
    this.transManager.stop();
    this.conductor.start();
  }

  public waitTransCompleteCallback() {
    this.conductor.clearEventHandlerByName("click");
    this.conductor.start();
  }

  // =========================================================
  // セーブ・ロード
  // =========================================================

  public onWindowClose(): boolean {
    this.saveSystemData();
    return true;
  }

  protected static ponkanSystemStoreParams: string[] = [
    "scaleMode",
    "_fixedScaleWidth",
    "_fixedScaleHeight",
    "autoModeInterval",
    "userReadTextSpeed",
    "userUnreadTextSpeed",
    "canSkipUnreadPart",
    "canSkipUnreadPartByCtrl",
  ];

  protected static ponkanSystemStoreIgnoreParams: string[] = [
    "scaleMode",
    "_fixedScaleWidth",
    "_fixedScaleHeight",
  ];

  public saveSystemData(): void {
    const data = this.systemVar;
    const me = this as any;

    // システム
    data.system = {};
    Ponkan3.ponkanSystemStoreParams.forEach((param: string) => {
      data.system[param] = me[param];
    });

    // サウンド
    data.soundBuffers = [];
    this.soundBuffers.forEach((sound) => {
      data.soundBuffers.push(sound.storeSystem());
    });

    // 保存
    this.resource.saveSystemData(this.saveDataPrefix);
  }

  public loadSystemData(saveDataPrefix: string, asyncTask: AsyncTask): void {
    // 読み込み
    this.resource.loadSystemData(saveDataPrefix);
    const data = this.systemVar;
    const me = this as any;

    // システム
    if (data.system != null) {
      const restoreParams = Ponkan3.ponkanSystemStoreParams.filter(
        (param) => Ponkan3.ponkanSystemStoreIgnoreParams.indexOf(param) === -1);
      restoreParams.forEach((param: string) => {
        if (data.system[param] != null) { me[param] = data.system[param]; }
      });
      if (data.system.scaleMode != null) {
        switch (data.system.scaleMode) {
          case Ponkan3.ScaleMode.FULLSCREEN:
          case Ponkan3.ScaleMode.FIT:
            this.scaleMode = Ponkan3.ScaleMode.FIT;
            break;
          case Ponkan3.ScaleMode.FIXED:
            if (data.system._fixedScaleWidth != null && data.system._fixedScaleHeight != null) {
              this.scaleMode = Ponkan3.ScaleMode.FIXED;
              this.setFixedScaleSize(data.system._fixedScaleWidth, data.system._fixedScaleHeight);
            } else {
              this.scaleMode = Ponkan3.ScaleMode.FIT;
            }
            break;
        }
      }
    }

    // サウンド
    if (data.soundBuffers != null) {
      this.soundBuffers.forEach((sound, index) => {
        // data.soundBuffers.push(sound.storeSystem());
        if (data.soundBuffers[index] != null) {
          sound.restoreSystem(asyncTask, data.soundBuffers[index]);
        }
      });
    }
  }

  protected getSaveDataName(num: number): string {
    return `${this.saveDataPrefix}_${num}`;
  }

  public save(tick: number, num: number): void {

    Logger.debug("==SAVE=============================================");
    Logger.debug(num, this.latestSaveData);

    // セーブデータの保存
    let saveStr: string;
    try {
      saveStr = JSON.stringify(this.latestSaveData);
    } catch (e) {
      Logger.error(e);
      throw new Error("セーブデータの保存に失敗しました。JSON文字列に変換できません");
    }
    this.resource.storeToLocalStorage(this.getSaveDataName(num), saveStr);
    console.log("SAVE! ", this.latestSaveData);

    // システムデータの保存
    const comment: string = this.latestSaveData.comment;
    if (this.systemVar.saveDataInfo == null) { this.systemVar.saveDataInfo = []; }
    this.systemVar.saveDataInfo[num] = {
      isEmpty: false,
      date: this.getNowDateStr(),
      name: this.latestSaveData.name,
      comment: this.latestSaveData.comment,
      text: this.latestSaveData.text,
      screenShot: this.screenShot.getDataUrl(),
    };
    Logger.debug(this.systemVar.saveDataInfo[num]);

    this.saveSystemData();
    Logger.debug("===================================================");
  }

  public getNowDateStr(): string {
    const d: Date = new Date();
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).substring(0, 2);
    const day = ("0" + d.getDate()).substring(0, 2);
    const hours = ("0" + d.getHours()).substring(0, 2);
    const minutes = ("0" + d.getMinutes()).substring(0, 2);
    const seconds = ("0" + d.getSeconds()).substring(0, 2);
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    // const millisecond = d.getMilliseconds();
    // return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${millisecond}`;
  }

  protected static ponkanStoreParams: string[] = [
    // "skipMode",
    // "canStopSkipByTag",
    // "autoModeFlag",
    // "autoModeInterval",
    "layerCount",
    "currentPage",
    "textSpeedMode",
    "unreadTextSpeed",
    "readTextSpeed",
    // "userUnreadTextSpeed",
    // "userReadTextSpeed",
    "nowaitModeFlag",
    "addCharWithBackFlag",
    "messageLayerNum",
    "lineBreakGlyphLayerNum",
    "lineBreakGlyphPos",
    "lineBreakGlyphX",
    "lineBreakGlyphY",
    "pageBreakGlyphLayerNum",
    "pageBreakGlyphPos",
    "pageBreakGlyphX",
    "pageBreakGlyphY",
    "rightClickJump",
    "rightClickCall",
    "rightClickFilePath",
    "rightClickLabel",
    "rightClickEnabled",
    "enabledHistory",
  ];

  protected generateSaveData(saveMarkName: string, comment: string, tick: number): any {
    const data: any = {};
    const me: any = this as any;

    data.tick = tick;
    data.saveMarkName = saveMarkName;
    data.comment = comment;
    data.text = this.messageLayer.text;

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

    // プラグイン
    this.plugins.forEach((p) => p.onStore(data, tick));

    return data;
  }

  public tempSave(tick: number, num: number): void {
    const name = "" + num;
    this.tempSaveData[name] = this.generateSaveData("tempsave", "tempsave", tick);
    this.tempSaveData[name].gameVar = null; // tempsaveではゲーム変数は保存しない
  }

  public load(tick: number, num: number): AsyncCallbacks {
    const asyncTask = new AsyncTask();
    const me: any = this as any;
    const dataStr: string = this.resource.restoreFromLocalStorage(this.getSaveDataName(num));
    const data: any = JSON.parse(dataStr);

    Logger.debug("LOAD! ", data);

    Ponkan3.ponkanStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    // layer
    this.forePrimaryLayer.restore(asyncTask, data.forePrimaryLayer, tick, true);
    this.backPrimaryLayer.restore(asyncTask, data.backPrimaryLayer, tick, true);
    for (let i = 0; i < data.foreLayers.length; i++) {
      this.foreLayers[i].restore(asyncTask, data.foreLayers[i], tick, true);
      this.backLayers[i].restore(asyncTask, data.backLayers[i], tick, true);
    }

    // sound
    this.soundBuffers.forEach((sb) => {
      sb.stop();
    });
    for (let i = 0; i < data.soundBuffers.length; i++) {
      if (this.soundBuffers[i] != null) {
        this.soundBuffers[i].restore(asyncTask, data.soundBuffers[i], tick);
      }
    }

    // conductor
    this.conductor.restore(asyncTask, data.conductor, tick);

    if (data.gameVar != null) {
      this.resource.gameVar = Util.objClone(data.gameVar);
    }

    // スキップとオートモードは停止させる
    asyncTask.add((params: any, index: number): AsyncCallbacks => {
      const cb = new AsyncCallbacks();
      window.setTimeout(() => {
        this.stopSkip();
        this.stopAutoMode();
        cb.callDone();
      }, 0);
      return cb;
    });

    // プラグイン
    this.plugins.forEach((p) => p.onRestore(asyncTask, data, tick, false, true, false));

    return asyncTask.run();
  }

  public tempLoad(tick: number, num: number, sound: boolean = false, toBack: boolean = false): AsyncCallbacks {
    const asyncTask = new AsyncTask();
    const me: any = this as any;
    const data: any = this.tempSaveData["" + num];

    Logger.debug(data);

    Ponkan3.ponkanStoreParams.forEach((param: string) => {
      me[param] = data[param];
    });

    // layer
    if (toBack) {
      this.backPrimaryLayer.restore(asyncTask, data.forePrimaryLayer, tick, false);
      for (let i = 0; i < data.foreLayers.length; i++) {
        this.backLayers[i].restore(asyncTask, data.foreLayers[i], tick, false);
      }
    } else {
      this.forePrimaryLayer.restore(asyncTask, data.forePrimaryLayer, tick, false);
      this.backPrimaryLayer.restore(asyncTask, data.backPrimaryLayer, tick, false);
      for (let i = 0; i < data.foreLayers.length; i++) {
        this.foreLayers[i].restore(asyncTask, data.foreLayers[i], tick, false);
        this.backLayers[i].restore(asyncTask, data.backLayers[i], tick, false);
      }
    }

    // sound
    if (sound) {
      this.soundBuffers.forEach((sb) => {
        sb.stop();
      });
      for (let i = 0; i < data.soundBuffers.length; i++) {
        if (this.soundBuffers[i] != null) {
          this.soundBuffers[i].restore(asyncTask, data.soundBuffers[i], tick);
        }
      }
    }

    // プラグイン
    this.plugins.forEach((p) => p.onRestore(asyncTask, data, tick, true, sound, toBack));

    return asyncTask.run();
  }

  public copySaveData(srcNum: number, destNum: number): void {
    this.resource.copyLocalStorage(this.getSaveDataName(srcNum), this.getSaveDataName(destNum));
  }

  public get emptySaveData(): any {
    return  {
      isEmpty: true,
      date: "----/--/-- --:--:--",
      name: "",
      comment: "NO DATA",
      message: "",
      text: "",
      screenShot: this.screenShot.nodata,
    };
  }

  public deleteSaveData(num: number): void {
    delete this.systemVar.saveDataInfo[num];
    this.resource.storeToLocalStorage(this.getSaveDataName(num), "");
    this.saveSystemData();
  }

  public getSaveDataInfo(num: number): any {
    if (this.existSaveData(num)) {
      const data = this.systemVar.saveDataInfo[num];
      if (data.screenShot == null || data.screenShot === "") {
        data.screenShot = this.screenShot.nodata;
      }
      const empty = this.emptySaveData;
      if (data.date == null) { data.date = empty.date; }
      if (data.name == null) { data.name = empty.name; }
      if (data.comment == null) { data.comment = empty.comment; }
      if (data.message == null) { data.message = empty.message; }
      if (data.text == null) { data.text = empty.text; }
      if (data.screenShot == null) { data.screenShot = empty.screenShot; }
      return data;
    } else {
      return this.emptySaveData;
    }
  }

  public existSaveData(num: number): boolean {
    return this.systemVar != null &&
           this.systemVar.saveDataInfo != null &&
           this.systemVar.saveDataInfo[num] != null;
  }

  public getSaveDataScreenShot(num: number): string {
    return this.getSaveDataInfo(num).screenShot;
  }

  public splitStrByLength(str: string, length: number): string[] {
    const splitedAry: string[] = [];
    if (str == null || length == null || length < 1) {
      return splitedAry;
    }
    let index: number = 0;
    let start: number = index;
    let end: number = start + length;
    while (start < str.length) {
      splitedAry[index] = str.substring(start, end);
      index++;
      start = end;
      end = start + length;
    }
    return splitedAry;
  }

}

(window as any).Ponkan3 = Ponkan3;
