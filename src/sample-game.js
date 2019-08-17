Ponkan3.Logger.level = Ponkan3.Logger.LEVEL_DEBUG;
var width = 1280;
var height = 720;
var ponkan = new Ponkan3("game", {
  gameVersion: "0.0.0",
  gameDataDir: "./gamedata",
  developMode: true,
  saveDataPrefix: "ponkan-sample",
  width: width,
  height: height,
  soundBufferCount: 5,

  screenShot: {
    width: 231,
    height: 130,
    nodata: "image/nodata.png",
  },

  // デフォルトのレイヤ設定
  // layersDefault: {},

  // 履歴レイヤ
  history: {
    backgroundImage: "image/history.png", // 背景画像
    wheelScrollCount: 3,   // マウスホイールのスクロール量
    // テキスト表示部分
    text: {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      textColor: 0xFFFFFF,
      textFontFamily: ["GenShinGothic"],
      textFontSize: 28,
      textPitch: 0,
      textLineHeight: 28,
      textLinePitch: 7,
      textMarginTop: 130,
      textMarginRight: 30,
      textMarginBottom: 100,
      textMarginLeft: 30,
      textShadowVisible: true,
      textShadowAlpha: 0.7,
      textShadowBlur: 5,
      textShadowColor: 0x000000,
      textShadowDistance: 2,
      textEdgeColor: 0x000000,
      textEdgeWidth: 0,
      scrollOffLines: 3,  // 上下のスクロールボタンで、指定した行の分は重複させる
      maxLinesCount: 20000,  // 履歴の最大行数
    },
    // 上スクロールボタン
    upButton: {
      x: width - 58,
      y: 100,
      imageFile: "image/history_up.png",
    },
    // 下スクロールボタン
    downButton: {
      x: width - 58,
      y: 130 + 500 + 2,
      imageFile: "image/history_down.png",
    },
    // スクロールバー
    scrollBar: {
      x: width - 58,
      y: 130 + 1,
      width: 30,
      height: 500,
      textColor: 0x888888,
      backgroundColor: 0xFFFFFF,
      backgroundAlpha: 0.5,
      bgColors: [0xFFFFFF, 0xFFFFFF, 0xFFFFFF],
      bgAlphas: [1.0, 1.0, 1.0]
    },
    // 閉じるボタン
    closeButton: {
      x: width - 30 - 24,
      y: 23,
      imageFile: "image/close_button.png",
    }
  }
});
WebFont.load({
  classes: false,
  custom: { families: ["GenShinGothic"] },
  active: function () {
    console.log("WebFont: ", "active.");
    ponkan.start();
  },
  inactive: function () {
    console.log("WebFont: ", "inactive.");
    alert("フォントの読み込みに失敗");
  },
});