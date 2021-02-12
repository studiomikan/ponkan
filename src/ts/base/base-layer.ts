import * as PIXI from "pixi.js";
import { PonGame } from "./pon-game";
import { PonMouseEvent } from "./pon-mouse-event";
import { IPonSpriteCallbacks, PonSprite } from "./pon-sprite";
import { IPonVideoCallbacks, PonVideo } from "./pon-video";
import { PonWheelEvent } from "./pon-wheel-event";
import { Resource } from "./resource";
import { Logger } from "./logger";
import { LayerTextCanvas } from "./layer-text-canvas";

/**
 * すべてのレイヤーの基本となるレイヤー
 */
export class BaseLayer {
  /** 親レイヤー */
  protected parent: BaseLayer | null = null;
  /** レイヤー名 */
  public readonly name: string;
  /** リソース */
  protected readonly resource: Resource;
  /** 持ち主 */
  protected readonly owner: PonGame;

  /** マスクとして使う兄弟レイヤーのインデックス */
  private maskSibling: number | null = null;
  /** 子レイヤーのマスクが更新されたのを検知する用フラグ */
  private childrenMaskUpdated: boolean = false;

  /** スプライト表示用コンテナ */
  protected _container: PIXI.Container;
  public get container(): PIXI.Container {
    return this._container;
  }
  /** レイヤサイズでクリッピングするためのマスク */
  protected defaultMaskSprite: PIXI.Sprite;
  /** デバッグ情報を出力するためのコンテナ */
  protected debugContainer: PIXI.Container;
  public set debugInfoVisible(visible: boolean) {
    this.debugContainer.visible = visible;
  }
  public get debugInfoVisible(): boolean {
    return this.debugContainer.visible;
  }
  /** デバッグ情報: ボーダー */
  protected debugBorder: PIXI.Graphics;
  /** デバッグ情報: テキスト情報 */
  protected debugText: PIXI.Text;
  /** デバッグ情報: テキスト情報のスタイル */
  public debugTextStyle: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: ["GenShinGothic", "monospace"],
    fontSize: 12,
    fontWeight: "normal",
    fontStyle: "normal",
    fill: 0xffffff,
    stroke: 0x000000,
    strokeThickness: 3,
    trim: true,
  });

  /** 背景色用スプライト */
  protected backgroundSprite: PonSprite;
  protected hasBackgroundColor: boolean = false;
  protected _backgroundColor: number = 0x000000;
  protected _backgroundAlpha: number = 1.0;

  protected textContainer: PIXI.Container;
  protected textSpriteCallbacks: IPonSpriteCallbacks;
  protected childContainer: PIXI.Container;
  protected childSpriteCallbacks: IPonSpriteCallbacks;
  protected imageContainer: PIXI.Container;
  protected imageSpriteCallbacks: IPonSpriteCallbacks;
  protected canvasSpriteCallbacks: IPonVideoCallbacks;
  protected videoCallbacks: IPonVideoCallbacks;

  private _x = 0;
  private _y = 0;
  private _quakeOffsetX: number = 0;
  private _quakeOffsetY: number = 0;
  /** quakeを無視する */
  public ignoreQuake: boolean = false;

  /** 読み込んでいる画像 */
  protected image: HTMLImageElement | null = null;
  protected imageFilePath: string | null = null;
  /** 画像用スプライト */
  protected imageSprite: PonSprite | null = null;
  public get imageWidth(): number {
    return this.image !== null ? this.image.width : 0;
  }
  public get imageHeight(): number {
    return this.image !== null ? this.image.height : 0;
  }

  /** 読み込んでいるCanvas */
  protected canvas: HTMLCanvasElement | null = null;
  protected canvasSprite: PonSprite | null = null;
  public get canvasWidth(): number {
    return this.canvas !== null ? this.canvas.width : 0;
  }
  public get canvasHeight(): number {
    return this.canvas !== null ? this.canvas.height : 0;
  }

  /** 動画スプライト */
  protected videoFilePath: string | null = null;
  public video: PonVideo | null = null;
  public set videoWidth(width: number) {
    if (this.video != null) {
      this.video.width = width;
    }
  }
  public get videoWidth(): number {
    return this.video != null ? this.video.width : 0;
  }
  public set videoHeight(height: number) {
    if (this.video != null) {
      this.video.height = height;
    }
  }
  public get videoHeight(): number {
    return this.video != null ? this.video.height : 0;
  }
  public set videoLoop(loop: boolean) {
    if (this.video != null) {
      this.video.loop = loop;
    }
  }
  public get videoLoop(): boolean {
    return this.video != null ? this.video.loop : false;
  }
  public set videoVolume(volume: number) {
    if (this.video != null) {
      this.video.volume = volume;
    }
  }
  public get videoVolume(): number {
    return this.video != null ? this.video.volume : 0;
  }

  // 子レイヤ
  private _children: BaseLayer[] = [];
  // // イベントリスナ
  // private eventListenerList: BaseLayerEventListener[] = [];

  /** イベント遮断フラグ。trueにするとマウスイベントの伝播を遮断する。 */
  public blockLeftClickFlag: boolean = false;
  public blockRightClickFlag: boolean = false;
  public blockCenterClickFlag: boolean = false;
  public blockMouseMove: boolean = false;
  public blockWheelFlag: boolean = false;

  // 文字関係
  public textCanvas: LayerTextCanvas = new LayerTextCanvas();

  public get children(): BaseLayer[] {
    return this._children;
  }
  public get x(): number {
    return this._x;
  }
  public set x(x) {
    this._x = x;
    this.container.x = this._x + this._quakeOffsetX;
  }
  public get y(): number {
    return this._y;
  }
  public set y(y) {
    this._y = y;
    this.container.y = this._y + this._quakeOffsetY;
  }
  public get quakeOffsetX(): number {
    return this._quakeOffsetX;
  }
  public set quakeOffsetX(x) {
    this._quakeOffsetX = x;
    this.container.x = this._x + this._quakeOffsetX;
  }
  public get quakeOffsetY(): number {
    return this._quakeOffsetY;
  }
  public set quakeOffsetY(y) {
    this._quakeOffsetY = y;
    this.container.y = this._y + this._quakeOffsetY;
  }
  public get width(): number {
    return this.defaultMaskSprite.width;
  }
  public set width(width: number) {
    this.defaultMaskSprite.width = width;
    this.backgroundSprite.width = width;
    if (this.textCanvas.width != width) {
      this.clearText();
      this.textCanvas.width = width;
    }
  }
  public get height(): number {
    return this.defaultMaskSprite.height;
  }
  public set height(height: number) {
    this.defaultMaskSprite.height = height;
    this.backgroundSprite.height = height;
    if (this.textCanvas.height != height) {
      this.clearText();
      this.textCanvas.height = height;
    }
  }
  public get visible(): boolean {
    return this.container.visible;
  }
  public set visible(visible: boolean) {
    this.container.visible = visible;
  }
  public get alpha(): number {
    return this.container.alpha;
  }
  public set alpha(alpha: number) {
    this.container.alpha = alpha;
  }

  public get backgroundColor(): number {
    return this._backgroundColor;
  }
  public set backgroundColor(backgroundColor: number) {
    this.setBackgroundColor(backgroundColor, this._backgroundAlpha);
  }
  public set backgroundAlpha(backgroundAlpha: number) {
    this.setBackgroundColor(this._backgroundColor, backgroundAlpha);
  }
  public get backgroundAlpha(): number {
    return this._backgroundAlpha;
  }

  public get imageX(): number {
    return this.imageSprite === null ? 0 : this.imageSprite.x;
  }
  public set imageX(imageX: number) {
    if (this.imageSprite != null) {
      this.imageSprite.x = imageX;
    }
  }
  public get imageY(): number {
    return this.imageSprite === null ? 0 : this.imageSprite.y;
  }
  public set imageY(imageY: number) {
    if (this.imageSprite != null) {
      this.imageSprite.y = imageY;
    }
  }

  public get canvasX(): number {
    return this.canvasSprite === null ? 0 : this.canvasSprite.x;
  }
  public set canvasX(canvasX: number) {
    if (this.canvasSprite != null) {
      this.canvasSprite.x = canvasX;
    }
  }
  public get canvasY(): number {
    return this.canvasSprite === null ? 0 : this.canvasSprite.y;
  }
  public set canvasY(canvasY: number) {
    if (this.canvasSprite != null) {
      this.canvasSprite.y = canvasY;
    }
  }

  public get scaleX(): number {
    return this.container.scale.x;
  }
  public set scaleX(scaleX: number) {
    this.container.scale.x = scaleX;
  }
  public get scaleY(): number {
    return this.container.scale.y;
  }
  public set scaleY(scaleY: number) {
    this.container.scale.y = scaleY;
  }

  public constructor(name: string, resource: Resource, owner: PonGame) {
    this.name = name;
    this.resource = resource;
    this.owner = owner;

    this._container = new PIXI.Container();

    this.defaultMaskSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.defaultMaskSprite.width = 32;
    this.defaultMaskSprite.height = 32;
    this.container.addChild(this.defaultMaskSprite);
    this.container.mask = this.defaultMaskSprite;

    this.imageContainer = new PIXI.Container();
    this.container.addChild(this.imageContainer);
    this.imageSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.removeChild(child);
      },
    };
    this.textSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.textContainer.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.textContainer.removeChild(child);
      },
    };
    this.canvasSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.removeChild(child);
      },
    };
    this.videoCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.imageContainer.removeChild(child);
      },
    };

    this.backgroundSprite = new PonSprite(this.imageSpriteCallbacks);

    this.textContainer = new PIXI.Container();
    this.container.addChild(this.textContainer);
    this.textCanvas.width = this.width;
    this.textCanvas.height = this.height;
    this.textCanvas.addTo(this.textContainer);
    this.clearText();

    this.childContainer = new PIXI.Container();
    this.container.addChild(this.childContainer);
    this.childSpriteCallbacks = {
      pixiContainerAddChild: (child: PIXI.DisplayObject): void => {
        this.childContainer.addChild(child);
      },
      pixiContainerRemoveChild: (child: PIXI.DisplayObject): void => {
        this.childContainer.removeChild(child);
      },
    };

    this.debugContainer = new PIXI.Container();
    this.debugContainer.visible = false;
    this.container.addChild(this.debugContainer);
    this.debugBorder = new PIXI.Graphics();
    this.debugContainer.addChild(this.debugBorder);
    this.debugText = new PIXI.Text(this.name, this.debugTextStyle);
    this.debugContainer.addChild(this.debugText);

    this.visible = false;
    // Logger.debug("new layer =>", this);
  }

  /**
   * 破棄
   */
  public destroy(): void {
    this.clearText();
    this.freeImage();
    this.freeCanvas();
    this.freeVideo();
    this.defaultMaskSprite.destroy();
    this.backgroundSprite.destroy();
    if (this.imageSprite != null) {
      this.imageSprite.destroy();
    }
    if (this.canvasSprite != null) {
      this.canvasSprite.destroy();
    }
    if (this.video != null) {
      this.video.destroy();
    }

    this.textContainer.destroy();
    this.imageContainer.destroy();
    this.childContainer.destroy();
    this.debugContainer.destroy();
    this.container.destroy();

    this.children.forEach((child) => {
      child.destroy();
    });
    this._children = [];
  }

  public addChild(childLayer: BaseLayer): BaseLayer {
    this.children.push(childLayer);
    this.container.addChild(childLayer.container);
    childLayer.parent = this;
    return childLayer;
  }

  /**
   * 子レイヤーを削除する。
   * 管理から削除されるだけで、レイヤー自体は初期化されたりしない。
   */
  public deleteChildLayer(childLayer: BaseLayer): void {
    const index = this._children.indexOf(childLayer);
    if (index >= 0) {
      this._children.splice(index, 1);
      childLayer.parent = null;
    }
  }

  /**
   * 子レイヤーをすべて削除する。
   * 管理から削除されるだけで、レイヤー自体は初期化されたりしない。
   */
  public deleteAllChildren(): void {
    for (const child of this._children) {
      child.parent = null;
    }
    this._children = [];
  }

  public child(index: number): BaseLayer {
    return this.children[index];
  }

  public setMaskSibling(maskSibling: number): void {
    this.maskSibling = maskSibling;
    if (this.parent != null) this.parent.childrenMaskUpdated = true;
  }

  public clearMaskSibling(): void {
    this.maskSibling = null;
    if (this.parent != null) this.parent.childrenMaskUpdated = true;
  }

  private applyChildrenMask(): void {
    for (const child of this.children) {
      if (child.maskSibling == null) {
        child.container.mask = child.defaultMaskSprite;
      } else {
        const maskLay = this.children[child.maskSibling];
        if (maskLay == null || maskLay.imageSprite == null) {
          child.container.mask = child.defaultMaskSprite;
        } else {
          child.container.mask = maskLay.imageSprite?.pixiDisplayObject as PIXI.Container;
        }
      }
    }
  }

  public update(tick: number): void {
    for (const child of this.children) {
      child.update(tick);
    }
  }

  public beforeDraw(tick: number): void {
    // デバッグ情報の描画
    if (this.visible && this.debugContainer.visible) {
      this.debugBorder.width = this.width;
      this.debugBorder.height = this.height;
      this.debugBorder.x = 0;
      this.debugBorder.y = 0;
      this.debugBorder.lineStyle(2, 0xff0000);
      this.debugBorder.drawRect(0, 0, this.debugBorder.width, this.debugBorder.height);
      this.debugText.text = `${this.name}: x=${this.x} y=${this.y} width=${this.width} height=${this.height}`;
    }
    // テキスト更新
    this.textCanvas.beforeDraw(tick);
    // this.textCanvas.draw(tick);
    // キャンバスの更新
    if (this.visible && this.canvas !== null && this.canvasSprite !== null) {
      this.canvasSprite.beforeDraw(tick);
    }
    // マスク反映
    if (this.childrenMaskUpdated) {
      this.applyChildrenMask();
      this.childrenMaskUpdated = false;
    }
    // 子レイヤーのイベント呼ぶ
    for (const child of this.children) {
      child.beforeDraw(tick);
    }
  }

  public applyQuake(quakeX: number, quakeY: number): void {
    if (this.ignoreQuake) {
      this.quakeOffsetX = 0;
      this.quakeOffsetY = 0;
    } else {
      this.quakeOffsetX = quakeX;
      this.quakeOffsetY = quakeY;
    }
  }

  public clearQuake(): void {
    this.quakeOffsetX = 0;
    this.quakeOffsetY = 0;
  }

  /**
   * 座標が、指定のレイヤーの内側かどうかを調査する
   */
  public static isInsideOfLayer(layer: BaseLayer, x: number, y: number): boolean {
    const top: number = layer.y;
    const right: number = layer.x + layer.width;
    const bottom: number = layer.y + layer.height;
    const left: number = layer.x;
    return left <= x && x <= right && top <= y && y <= bottom;
  }

  protected isInsideEvent(e: PonMouseEvent): boolean {
    const x = e.x;
    const y = e.y;
    return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
  }

  protected isBlockedEvent(e: PonMouseEvent | PonWheelEvent, eventName: string): boolean {
    if (e instanceof PonMouseEvent) {
      if (eventName === "down" || eventName === "up") {
        if (this.blockLeftClickFlag && e.isLeft) {
          return true;
        }
        if (this.blockRightClickFlag && e.isRight) {
          return true;
        }
        if (this.blockCenterClickFlag && e.isCenter) {
          return true;
        }
      }
      if (eventName === "move") {
        if (this.blockMouseMove) {
          return true;
        }
      }
    } else {
      if (this.blockWheelFlag) {
        return true;
      }
    }
    return false;
  }

  // MEMO マウスイベントについて
  //
  // 基本的にイベントは子レイヤー→親レイヤーの順番で処理することとする。
  // 同レベルの子レイヤーはレイヤー番号の降順に呼ばれる。
  // このルールを守るため、すべてのレイヤはイベント処理の最初で以下の処理を実行する。
  //   ```
  //   super.onMouseXXXXX(e);
  //   if (e.stopPropagationFlag || e.forceStopFlag) { return; }
  //   ```
  //
  // e.forceStop();
  //    以降のすべてのイベント処理をキャンセルする。
  //    これが呼ばれると e.forceStopFlag が true になっているので、
  //    同レベルの子レイヤーのイベント呼び出しなどもキャンセルする。
  // e.stopPropagation();
  //    イベント伝播を停止する。
  //    これが呼ばれると e.stopPropagationFlag が true になっているので、
  //    その場合は親レイヤーのイベント処理をしてはいけない。

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMouseEnter(e: PonMouseEvent): void {
    /* empty */
  }
  public _onMouseEnter(e: PonMouseEvent): void {
    this.onMouseEnter(e);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMouseLeave(e: PonMouseEvent): void {
    /* empty */
  }
  public _onMouseLeave(e: PonMouseEvent): void {
    this.onMouseLeave(e);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMouseMove(e: PonMouseEvent): void {
    /* empty */
  }
  public _onMouseMove(e: PonMouseEvent): void {
    // 子レイヤーのmousemove
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      child.isInsideBuffer = BaseLayer.isInsideOfLayer(child, e.x, e.y);
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._onMouseMove(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }

    if (e.stopPropagationFlag || e.forceStopFlag) {
      return;
    }
    this.onMouseMove(e);
  }

  /** onMouseEnter等を発生させるためのバッファ */
  protected isInsideBuffer: boolean = false;
  public callMouseEnterTargetChild: BaseLayer[] = [];
  protected callMouseLeaveTargetChild: BaseLayer[] = [];
  public _preCallMouseEnterLeave(e: PonMouseEvent): void {
    // 孫レイヤーのenter/leaveを予約する
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._preCallMouseEnterLeave(e2);
    }
    // このレイヤの子レイヤーのmouseenter/mouseleaveを予約する
    this.callMouseEnterTargetChild = [];
    this.callMouseLeaveTargetChild = [];
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      const isInside = BaseLayer.isInsideOfLayer(child, e.x, e.y);
      if (isInside !== child.isInsideBuffer) {
        if (isInside) {
          this.callMouseEnterTargetChild.push(child);
        } else {
          this.callMouseLeaveTargetChild.push(child);
        }
      }
      child.isInsideBuffer = isInside;
    }
  }

  public _callOnMouseEnter(e: PonMouseEvent): void {
    // 孫レイヤーについて処理
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._callOnMouseEnter(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }
    if (e.stopPropagationFlag || e.forceStopFlag) {
      return;
    }
    // このレイヤの子レイヤーについて、予約されているイベントを呼ぶ
    for (let i = this.callMouseEnterTargetChild.length - 1; i >= 0; i--) {
      const child = this.callMouseEnterTargetChild[i];
      if (!child.visible) {
        continue;
      }
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._onMouseEnter(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }
  }

  public _callOnMouseLeave(e: PonMouseEvent): void {
    // 孫レイヤーについて処理
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._callOnMouseLeave(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }
    if (e.stopPropagationFlag || e.forceStopFlag) {
      return;
    }
    // このレイヤの子レイヤーについて、予約されているイベントを呼ぶ
    for (let i = this.callMouseLeaveTargetChild.length - 1; i >= 0; i--) {
      const child = this.callMouseLeaveTargetChild[i];
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._onMouseLeave(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMouseDown(e: PonMouseEvent): void {
    /* empty */
  }
  public _onMouseDown(e: PonMouseEvent): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._onMouseDown(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }

    if (e.stopPropagationFlag || e.forceStopFlag) {
      return;
    }
    this.onMouseDown(e);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMouseUp(e: PonMouseEvent): void {
    /* empty */
  }
  public _onMouseUp(e: PonMouseEvent): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      const e2 = new PonMouseEvent(e.x - child.x, e.y - child.y, e.button);
      child._onMouseUp(e2);
      if (e2.stopPropagationFlag) {
        e.stopPropagation();
      }
      if (e2.forceStopFlag) {
        e.forceStop();
        return;
      }
    }

    if (e.stopPropagationFlag || e.forceStopFlag) {
      return;
    }
    this.onMouseUp(e);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onMouseWheel(e: PonWheelEvent): boolean {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child: BaseLayer = this.children[i];
      if (!child.visible) {
        continue;
      }
      child.onMouseWheel(e);
      // TODO 伝播をきちんとする
      // if (e.stopPropagationFlag) { e.stopPropagation(); }
      // if (e.forceStopFlag) { return; }
    }
    if (this.isBlockedEvent(e, "wheel")) {
      return false;
    }
    return true;
  }

  public onChangeStable(isStable: boolean): void {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].onChangeStable(isStable);
    }
  }

  /**
   * 背景色を設定する
   * @param color 色 0xRRGGBB
   * @param alpha アルファ値 0.0〜1.0
   */
  public setBackgroundColor(color: number, alpha = 1.0): void {
    this.freeImage();
    this.freeCanvas();
    this.freeVideo();
    this.backgroundSprite.fillColor(color, alpha);
    this._backgroundColor = color;
    this._backgroundAlpha = alpha;
    this.hasBackgroundColor = true;
  }

  /**
   * 背景色をクリアする
   */
  public clearBackgroundColor(): void {
    this.backgroundSprite.clearColor();
    this.hasBackgroundColor = false;
  }

  public get text(): string {
    return this.textCanvas.text;
  }

  /**
   * 表示しているテキストの内容を文字列で取得
   * @return テキスト
   */
  public get messageText(): string {
    return this.text;
  }

  /**
   * レイヤにテキストを追加する
   */
  public addText(text: string): void {
    this.textCanvas.addText(text);
  }

  /**
   * レイヤに1文字追加する
   */
  public addChar(ch: string): void {
    this.textCanvas.addChar(ch);
  }

  /**
   * 次の文字の表示位置を取得する
   * @param chWidth 追加しようとしている文字の横幅
   * @return 表示位置
   */
  public getNextTextPos(chWidth: number): { x: number; y: number; newLineFlag: boolean } {
    return this.textCanvas.getNextTextPos(chWidth);
  }

  /**
   * テキストを改行する
   */
  public addTextReturn(): void {
    this.textCanvas.addTextReturn();
  }

  /**
   * テキストの表示位置を指定する。
   * 内部的には、指定前とは別の行として扱われる。
   * @param x x座標
   * @param y y座標
   */
  public setCharLocate(x: number | null, y: number | null): void {
    this.textCanvas.setCharLocate(x, y);
  }

  /**
   * 現在のテキスト描画位置でインデントするように設定する
   */
  public setIndentPoint(): void {
    this.textCanvas.setIndentPoint();
  }

  /**
   * インデント位置をクリアする
   */
  public clearIndentPoint(): void {
    this.textCanvas.clearIndentPoint();
  }

  public reserveRubyText(rubyText: string): void {
    this.textCanvas.reserveRubyText(rubyText);
  }

  /**
   * テキストをクリアする。
   * 描画していたテキストは全削除される。
   * テキストの描画開始位置は初期化される。
   * インデント位置は初期化される。
   */
  public clearText(): void {
    this.textCanvas.clear();
  }

  /**
   * 画像を読み込む。
   * 同時に、レイヤサイズを画像に合わせて変更する。
   * @param filePath ファイルパス
   */
  public async loadImage(filePath: string): Promise<void> {
    // Logger.debug("BaseLayer.loadImage call: ", filePath);
    this.clearBackgroundColor();
    this.freeImage();
    this.freeCanvas();
    this.freeVideo();
    try {
      this.image = await this.resource.loadImage(filePath);
      // Logger.debug("BaseLayer.loadImage success: ", image);
      this.imageFilePath = filePath;
      this.imageSprite = new PonSprite(this.imageSpriteCallbacks);
      this.imageSprite.setImage(this.image);
      this.width = this.imageSprite.width;
      this.height = this.imageSprite.height;
      this.imageX = 0;
      this.imageY = 0;
      if (this.parent != null) this.parent.childrenMaskUpdated = true;
    } catch (e) {
      Logger.error(e);
      throw e;
    }
  }

  /**
   * 画像を開放する
   */
  public freeImage(): void {
    if (this.imageSprite != null) {
      this.imageSprite.destroy();
    }
    this.imageSprite = null;
    this.image = null;
    this.imageFilePath = null;
    if (this.parent != null) this.parent.childrenMaskUpdated = true;
  }

  /**
   * キャンバスを読み込む。
   * 同時に、レイヤサイズをキャンバスに合わせて変更する。
   * @param canvask
   */
  public loadCanvas(canvas: HTMLCanvasElement): void {
    this.clearBackgroundColor();
    this.freeImage();
    this.freeCanvas();
    this.freeVideo();
    try {
      this.canvas = canvas;
      this.canvasSprite = new PonSprite(this.canvasSpriteCallbacks);
      this.canvasSprite.setCanvas(canvas);
      this.width = this.canvasSprite.width;
      this.height = this.canvasSprite.height;
      this.canvasX = 0;
      this.canvasY = 0;
    } catch (e) {
      Logger.error(e);
      throw e;
    }
  }

  /**
   * キャンバスを開放する
   */
  public freeCanvas(): void {
    if (this.canvasSprite != null) {
      this.canvasSprite.destroy();
    }
    this.canvasSprite = null;
    this.canvas = null;
  }

  /**
   * 動画を読み込む。
   * @param filePath ファイルパス
   * @param width 動画の幅
   * @param height 動画の高さ
   * @param autoPlay 自動再生するかどうか
   * @param loop ループ再生するかどうか
   * @param volume 音量
   */
  public loadVideo(
    filePath: string,
    width: number,
    height: number,
    autoPlay: boolean,
    loop: boolean,
    volume: number,
  ): Promise<BaseLayer> {
    this.clearBackgroundColor();
    this.freeImage();
    this.freeCanvas();
    this.freeVideo();

    const videoTexture = this.resource.loadVideoTexture(filePath, autoPlay);
    const video = new PonVideo(videoTexture, this.videoCallbacks);
    video.width = width;
    video.height = height;
    video.loop = loop;
    video.volume = volume;
    video.source.autoplay = autoPlay;

    return new Promise<BaseLayer>((resolve, reject): void => {
      let timeoutTimer = -1;
      const onCanPlay = (): void => {
        if (timeoutTimer != -1) {
          window.clearTimeout(timeoutTimer);
        }
        video.source.removeEventListener("canplaythrough", onCanPlay);
        this.video = video;
        this.videoFilePath = filePath;
        this.width = this.video.width;
        this.height = this.video.height;
        resolve(this);
      };
      video.source.addEventListener("canplaythrough", onCanPlay);
      timeoutTimer = window.setTimeout(() => {
        video.source.removeEventListener("canplaythrough", onCanPlay);
        reject(this);
      }, 30000); // TODO: タイムアウト時間を変更できるようにする

      video.source.addEventListener("ended", () => {
        this.owner.conductor.trigger("video");
      });
    });
  }

  public playVideo(): void {
    if (this.video != null) {
      this.video.play();
    }
  }

  public pauseVideo(): void {
    if (this.video != null) {
      this.video.pause();
    }
  }

  public stopVideo(): void {
    if (this.video != null) {
      this.video.stop();
    }
  }

  public freeVideo(): void {
    if (this.video != null) {
      this.video.stop();
      this.video.destroy();
    }
    this.video = null;
    this.videoFilePath = null;
  }

  public get isPlayingVideo(): boolean {
    return this.video != null && this.video.playing;
  }

  public get isLoopPlayingVideo(): boolean {
    return this.video != null && this.video.loop;
  }

  protected static baseLayerStoreParams: string[] = [
    "name",
    "maskSibling",
    "x",
    "y",
    "quakeOffsetX",
    "quakeOffsetY",
    "scaleX",
    "scaleY",
    "width",
    "height",
    "visible",
    "alpha",
    "backgroundColor",
    "backgroundAlpha",
    "hasBackgroundColor",
    "ignoreQuake",
    "imageFilePath",
    "imageX",
    "imageY",
    "canvasX",
    "canvasY",
    "videoFilePath",
    "videoWidth",
    "videoHeight",
    "videoLoop",
    "videoVolume",
    "isPlayingVideo",
  ];

  protected static baseLayerIgnoreParams: string[] = [
    "backgroundColor",
    "backgroundAlpha",
    "hasBackgroundColor",
    "isPlayingVideo",
  ];

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * 保存する。
   * 子レイヤーの状態は保存されないことに注意が必要。
   */
  public store(tick: number): any {
    const data: any = {};
    const me: any = this as any;
    BaseLayer.baseLayerStoreParams.forEach((p) => (data[p] = me[p]));
    data.textCanvas = this.textCanvas.store(tick);
    return data;
  }
  /* eslint-enalbe @typescript-eslint/no-unused-vars */

  /**
   * 復元する。
   * 子レイヤーの状態は変化しないことに注意。
   * 継承先で子レイヤーを使用している場合は、継承先で独自に復元処理を実装する
   */
  public async restore(data: any, tick: number, clear: boolean): Promise<void> {
    const storeParams = (): void => {
      const me: any = this as any;
      const restoreParams = BaseLayer.baseLayerStoreParams.filter(
        (param) => BaseLayer.baseLayerIgnoreParams.indexOf(param) === -1,
      );
      restoreParams.forEach((p) => (me[p] = data[p]));
    };

    // テキスト
    this.textCanvas.restore(data.textCanvas, tick, clear);

    // 背景色
    this.clearBackgroundColor();
    if (data.hasBackgroundColor) {
      this.setBackgroundColor(data.backgroundColor, data.backgroundAlpha);
    }

    // MEMO: 画像、動画は復元されるが、キャンバスは復元されない。
    this.freeImage();
    this.freeCanvas();
    this.freeVideo();
    if (data.imageFilePath != null && data.imageFilePath !== "" && data.imageFilePath !== this.imageFilePath) {
      // 画像がある場合は非同期で読み込んでその後にサイズ等を復元する
      await this.loadImage(data.imageFilePath);
      storeParams();
      this.restoreAfterLoadImage(data, tick);
    } else if (
      data.videoFilePath != null &&
      data.videoFilePath != "" &&
      data.videoFilePath != this.videoFilePath &&
      data.videoLoop
    ) {
      // 動画がある場合は非同期で読み込んでその後にサイズ等を復元する
      this.freeVideo();
      await this.loadVideo(
        data.videoFilePath,
        data.videoWidth,
        data.videoHeight,
        data.isPlayingVideo,
        data.videoLoop,
        data.videoVolume,
      );
      storeParams();
      this.restoreAfterLoadImage(data, tick);
    } else {
      storeParams();
      this.restoreAfterLoadImage(data, tick);
    }
  }

  protected restoreAfterLoadImage(data: any, tick: number): void {
    // 継承先でオーバーライドして使うこと
  }

  public copyTo(dest: BaseLayer): void {
    // 背景色のコピー
    dest.clearBackgroundColor();
    if (this.hasBackgroundColor) {
      dest.setBackgroundColor(this.backgroundColor, this.backgroundAlpha);
    }

    // 画像のコピー
    dest.freeImage();
    if (this.image !== null) {
      dest.imageSprite = new PonSprite(dest.imageSpriteCallbacks);
      dest.imageSprite.setImage(this.image);
      dest.image = this.image;
    }

    // キャンバスのコピー
    dest.freeCanvas();
    if (this.canvas !== null) {
      dest.canvasSprite = new PonSprite(dest.canvasSpriteCallbacks);
      dest.canvasSprite.setCanvas(this.canvas);
      dest.canvas = this.canvas;
    }

    // 動画のコピー
    dest.freeVideo();
    if (this.video !== null && this.videoFilePath != null && this.videoFilePath !== dest.videoFilePath) {
      const texture = this.resource.cloneVideoTexture(this.video.texture);
      dest.video = new PonVideo(texture, dest.videoCallbacks);
    }

    // その他のパラメータのコピー
    const me: any = this as any;
    const you: any = dest as any;
    const params = BaseLayer.baseLayerStoreParams.filter(
      (param) => BaseLayer.baseLayerIgnoreParams.indexOf(param) === -1,
    );
    params.forEach((p) => (you[p] = me[p]));

    // テキストのコピー
    dest.clearText();
    this.textCanvas.copyTo(dest.textCanvas);
  }

  /**
   * コンフィグを反映する。
   * このメソッドでは単純に値の設定のみ行うため、
   * 画像読み込みなどの非同期処理が必要なものには対応していない。
   */
  public applyConfig(config: any): void {
    if (config != null) {
      const me = this as any;
      Object.keys(config).forEach((key) => {
        if (key in me) {
          me[key] = config[key];
        }
      });
      if (config.textCanvasConfig != null) {
        this.textCanvas.applyConfig(config.textCanvasConfig);
      }
    }
  }
}
