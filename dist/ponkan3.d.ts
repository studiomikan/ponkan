import { BaseLayer } from "./base/base-layer";
import { PonGame } from "./base/pon-game";
import { PonKeyEvent } from "./base/pon-key-event";
import { PonMouseEvent } from "./base/pon-mouse-event";
import { PonWheelEvent } from "./base/pon-wheel-event";
import { IOnSoundStopParams, SoundBuffer } from "./base/sound";
import { Tag } from "./base/tag";
import { HistoryLayer } from "./layer/history-layer";
import { PonLayer } from "./layer/pon-layer";
import { PonPlugin } from "./plugin/pon-plugin";
export declare enum SkipType {
    INVALID = 0,
    UNTIL_CLICK_WAIT = 1,
    UNTIL_S = 2,
    WHILE_PRESSING_CTRL = 3
}
export declare type GlyphVerticalAlignType = "bottom" | "middle" | "top" | "text-top" | "text-middle";
export declare class Ponkan3 extends PonGame {
    raiseError: any;
    skipMode: SkipType;
    canSkipUnreadPart: boolean;
    canSkipUnreadPartByCtrl: boolean;
    autoModeFlag: boolean;
    autoModeInterval: number;
    autoModeStartTick: number;
    autoModeLayerNum: number;
    readonly tagActions: any;
    protected _layerCount: number;
    layerAlias: any;
    forePrimaryLayer: PonLayer;
    backPrimaryLayer: PonLayer;
    readonly foreLayers: PonLayer[];
    readonly backLayers: PonLayer[];
    currentPage: "fore" | "back";
    isQuaking: boolean;
    protected quakeStartTick: number;
    protected quakeTime: number;
    protected quakeMaxX: number;
    protected quakeMaxY: number;
    protected isQuakePhase: boolean;
    protected quakeFrameCount: number;
    protected quakeIntervalFrame: number;
    textSpeedMode: "user" | "system";
    unreadTextSpeed: number;
    readTextSpeed: number;
    userUnreadTextSpeed: number;
    userReadTextSpeed: number;
    clickSkipEnabled: boolean;
    nowaitModeFlag: boolean;
    addCharWithBackFlag: boolean;
    hideMessageFlag: boolean;
    hideMessageByRlickFlag: boolean;
    protected _messageLayerNum: number;
    messageLayerNum: number;
    protected _lineBreakGlyphLayerNum: number;
    lineBreakGlyphLayerNum: number;
    lineBreakGlyphPos: "eol" | "relative" | "absolute";
    lineBreakGlyphVerticalAlign: GlyphVerticalAlignType;
    lineBreakGlyphX: number;
    lineBreakGlyphY: number;
    lineBreakGlyphMarginX: number;
    lineBreakGlyphMarginY: number;
    protected _pageBreakGlyphLayerNum: number;
    pageBreakGlyphLayerNum: number;
    pageBreakGlyphPos: "eol" | "relative" | "absolute";
    pageBreakGlyphVerticalAlign: GlyphVerticalAlignType;
    pageBreakGlyphX: number;
    pageBreakGlyphY: number;
    pageBreakGlyphMarginX: number;
    pageBreakGlyphMarginY: number;
    rightClickJump: boolean;
    rightClickCall: boolean;
    rightClickFilePath: string | null;
    rightClickLabel: string | null;
    rightClickEnabled: boolean;
    historyLayer: HistoryLayer;
    enabledHistory: boolean;
    soundBufferAlias: any;
    soundBufferCount: number;
    readonly soundBuffers: SoundBuffer[];
    protected onSoundStopParamsList: IOnSoundStopParams[];
    protected currentOnSoundStopParams: IOnSoundStopParams | null | undefined;
    protected saveDataPrefix: string;
    protected latestSaveComment: string;
    protected latestSaveData: any;
    protected tempSaveData: any;
    readonly tmpVar: any;
    readonly gameVar: any;
    readonly systemVar: any;
    protected pluginMap: any;
    protected plugins: PonPlugin[];
    constructor(parentId: string, config?: any);
    destroy(): void;
    start(): Promise<void>;
    stop(): void;
    /**
     * Ponkan3を一時停止する。
     * HTMLファイルによるシステム画面などを表示する際は、このメソッドで停止する。
     * 再開にはresumeメソッドを使う。
     */
    pause(countPage?: boolean, stopSkip?: boolean): void;
    resume(): void;
    addPlugin(name: string, plugin: PonPlugin): void;
    removePlugin(name: string): void;
    getPlugin(name: string): PonPlugin;
    protected update(tick: number): void;
    protected beforeDraw(tick: number): void;
    error(e: Error): void;
    showLayerDebugInfo(): void;
    hideLayerDebugInfo(): void;
    getDebugInfo(): any;
    dumpDebugInfo(): void;
    protected readonly eventReceivesLayer: BaseLayer;
    onMouseEnter(e: PonMouseEvent): void;
    onMouseLeave(e: PonMouseEvent): void;
    onMouseMove(e: PonMouseEvent): void;
    onMouseDown(e: PonMouseEvent): void;
    onMouseUp(e: PonMouseEvent): void;
    /** マウスホイールによる読み進め処理が連続して発生しないようにするためのフラグ */
    protected onMouseWheelLocked: boolean;
    onMouseWheel(e: PonWheelEvent): boolean;
    onPrimaryClick(): boolean;
    onPrimaryRightClick(): Promise<boolean>;
    onKeyDown(e: PonKeyEvent): boolean;
    onKeyUp(e: PonKeyEvent): boolean;
    private initTagAction;
    private addTagAction;
    addCommandShortcut(ch: string, command: string): void;
    delCommandShortcut(ch: string): void;
    execCommand(commandName: string, values?: any): void;
    onTag(tag: Tag, line: number, tick: number): "continue" | "break";
    onLabel(labelName: string, line: number, tick: number): "continue" | "break";
    onSaveMark(saveMarkName: string, comment: string, line: number, tick: number): "continue" | "break";
    onJs(js: string, printFlag: boolean, line: number, tick: number): "continue" | "break";
    onChangeStable(isStable: boolean): void;
    onReturnSubroutin(forceStart?: boolean): void;
    readonly isSkipping: boolean;
    startSkipByTag(): void;
    startSkipByCtrl(): void;
    stopWhilePressingCtrlSkip(): void;
    stopUntilClickSkip(): void;
    stopSkip(): void;
    readonly autoModeLayer: PonLayer;
    startAutoMode(): void;
    stopAutoMode(): void;
    reserveAutoClick(tick: number): void;
    private initSoundBuffers;
    getSoundBuffer(num: string): SoundBuffer;
    onSoundStop(params: IOnSoundStopParams): Promise<void>;
    onSoundFadeComplete(bufferNum: number): void;
    waitSoundCompleteCallback(sb: SoundBuffer): void;
    waitSoundStopClickCallback(sb: SoundBuffer): void;
    waitSoundFadeCompleteCallback(sb: SoundBuffer): void;
    waitSoundFadeClickCallback(sb: SoundBuffer): void;
    private initLayers;
    layerCount: number;
    /**
     * レイヤを作成する。
     * rendererへの追加は行わないので、他のレイヤの子レイヤにする必要がある。
     */
    createLayer(name: string): PonLayer;
    /**
     * 操作対象となるレイヤーを取得する
     * @param pageLayers ページのレイヤー
     * @param lay レイヤー指定の文字列
     * @return 操作対象レイヤー
     */
    protected getTargetLayers(pageLayers: PonLayer[], lay: string): PonLayer[];
    /**
     * 操作対象のレイヤーを取得する
     * @param values タグの値
     */
    getLayers(values: any): PonLayer[];
    readonly hasMovingLayer: boolean;
    waitMoveClickCallback(): void;
    waitMoveCompleteCallback(): void;
    waitFrameAnimClickCallback(layers: PonLayer[]): void;
    waitFrameAnimCompleteCallback(layers: PonLayer[]): void;
    readonly hasPlayingVideoLayer: boolean;
    waitVideoClickCallback(): void;
    waitVideoCompleteCallback(): void;
    startQuake(tick: number, time: number, maxX: number, maxY: number): void;
    stopQuake(): void;
    protected quake(tick: number): void;
    readonly textSpeed: number;
    /**
     * メッセージレイヤ（表）
     */
    readonly messageLayer: PonLayer;
    readonly backMessageLayer: PonLayer;
    readonly lineBreakGlyphLayer: PonLayer;
    readonly pageBreakGlyphLayer: PonLayer;
    showLineBreakGlyph(tick: number): void;
    showPageBreakGlyph(tick: number): void;
    showBreakGlyph(tick: number, lay: PonLayer, pos: "eol" | "relative" | "absolute", verticalAlign: GlyphVerticalAlignType, x: number, y: number, marginX: number, marginY: number): void;
    private resetLineBreakGlyphPos;
    private resetPageBreakGlyphPos;
    private resetBreakGlyphPos;
    hideBreakGlyph(): void;
    hideMessages(): void;
    showMessages(): void;
    hideMessagesByRightClick(): void;
    showMessagesByRightClick(): void;
    onAddChar(sender: PonLayer, ch: string): void;
    onTextReturn(sender: PonLayer): void;
    showHistoryLayer(): void;
    hideHistoryLayer(): void;
    historyTextReturn(): void;
    addTextToHistory(text: string): void;
    backlay(lay: string): void;
    copylay(srclay: string, destlay: string, srcpage: string, destpage: string): void;
    flipPrimaryLayers(): void;
    /**
     * [override]
     * トランジション完了時にTransManagerから呼ばれる。
     * この時点で表ページ・裏ページの入れ替えは完了している。
     */
    onCompleteTrans(): boolean;
    waitTransClickCallback(): void;
    waitTransCompleteCallback(): void;
    onWindowClose(): boolean;
    protected static ponkanSystemStoreParams: string[];
    protected static ponkanSystemStoreIgnoreParams: string[];
    saveSystemData(): void;
    loadSystemData(saveDataPrefix: string): void;
    protected getSaveDataName(num: number): string;
    save(tick: number, num: number): void;
    getNowDateStr(): string;
    protected static ponkanStoreParams: string[];
    protected generateSaveData(saveMarkName: string, comment: string, tick: number): any;
    tempSave(tick: number, num: number): void;
    load(tick: number, num: number): Promise<void>;
    tempLoad(tick: number, num: number, sound?: boolean, toBack?: boolean): Promise<void>;
    copySaveData(srcNum: number, destNum: number): void;
    readonly emptySaveData: any;
    deleteSaveData(num: number): void;
    getSaveDataInfo(num: number): any;
    existSaveData(num: number): boolean;
    getSaveDataScreenShot(num: number): string;
    splitStrByLength(str: string, length: number): string[];
}
