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
      x: 190,
      y: 130,
      width: 900,
      height: 500,
      textFontFamily: ["GenShinGothic"],
      textFontSize: 28,
      textPitch: 2,
      textLineHeight: 28,
      textLinePitch: 7,
      textMarginTop: 0,
      textMarginRight: 0,
      textMarginBottom: 0,
      textMarginLeft: 0,
      // scrollOffLines: 3,  // 上下のスクロールボタンで、指定した行の分は重複させる
    },
    // 上スクロールボタン
    upButton: {
      x: width - 24 - 150,
      y: 130,
      width: 24,
      height: 24,
      textColor: 0x888888,
      textFontSize: 10,
      textLineHeight: 10,
      bgColors: [0xFFFFFF, 0xFFFFFF, 0xFFFFFF],
      bgAlphas: [1.0, 1.0, 1.0]
    },
    // 下スクロールボタン
    downButton: {
      x: width - 24 - 150,
      y: 130 + 500 - 24,
      width: 24,
      height: 24,
      textColor: 0x888888,
      textFontSize: 10,
      textLineHeight: 10,
      bgColors: [0xFFFFFF, 0xFFFFFF, 0xFFFFFF],
      bgAlphas: [1.0, 1.0, 1.0]
    },
    // スクロールバー
    scrollBar: {
      x: width - 24 - 150,
      y: 130 + 24 + 1,
      width: 24,
      height: 500 - 24 - 24 - 2,
      textColor: 0x888888,
      backgroundColor: 0xFFFFFF,
      backgroundAlpha: 0.5,
      bgColors: [0xFFFFFF, 0xFFFFFF, 0xFFFFFF],
      bgAlphas: [1.0, 1.0, 1.0]
    },
    // 閉じるボタン
    closeButton: {
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