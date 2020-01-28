//--------------------------------------------------------------------------------------
// Ponkan3 設定ファイル
//--------------------------------------------------------------------------------------
window.PONKAN3_SETTINGS = {
  // ゲームバージョン
  // ゲームのバージョン番号を設定します。
  // バージョンアップして再公開する場合は、必ずここの値を変更してください。
  gameVersion: "0.0.0",

  // セーブデータ名のプレフィックス
  // セーブデータを保存する際の名前として使用されます。
  // 必ず初期値から変更するようにしてください。
  // もしこの値が同じだと、同じゲームのセーブデータだと判断されてしまいます。
  saveDataPrefix: "ponkan-sample",

  // 開発モードフラグ
  // 開発時は true にしておくと、ブラウザのキャッシュが効かないようになります。
  // リリース時は false にしておくと、ゲームの高速化およびトラフィック削減になります。
  developMode: true,

  // ゲームデータのディレクトリ
  // ゲームデータが格納されているディレクトリのパスを指定します。
  // 通常は gamedata から変更する必要はありません。
  gameDataDir: "./gamedata",

  // ゲーム画面の幅（単位：pixel）
  width: 1280,

  // ゲーム画面の高さ（単位：pixel）
  height: 720,

  // 音声バッファの数
  // 初期値は5です。それ以上の数は使用できません。
  // 5つで足りない場合は、必要な分を増やしてください。
  soundBufferCount: 5,

  // スクリーンショットの設定
  // セーブデータに保存されるスクリーンショットに関する設定です。
  screenShot: {
    // スクリーンショットの幅（単位：pixel）
    width: 231,
    // スクリーンショットの高さ（単位：pixel）
    height: 130,
    // スクリーンショットが存在しないときの画像
    // デフォルトの「no data」の画像から変更したいときはここを編集してください。
    nodata: "sysimage/nodata.png",
  },

  // テキストのスピード
  textspeed: {
    // 未読文章のスピード（ユーザーモード）
    unread: 20,
    // 既読文章のスピード（ユーザーモード）
    read: 20,
  },

  // デフォルトのレイヤ設定
  // レイヤーのデフォルト値を変更したい場合は、ここで設定することもできます。
  layersDefault: {
  },

  // 履歴（バックログ）の設定
  history: {

    // 履歴の背景画像
    backgroundImage: "sysimage/history.png",

    // マウスホイールのスクロール量
    // マウスホイールを操作したときに、テキストを何行スクロールするかを指定します。
    wheelScrollCount: 3,

    // 履歴のテキスト表示設定
    text: {
      // 履歴テキスト部分の表示座標
      x: 0,
      y: 0,

      // 履歴テキスト部分の表示サイズ
      width: 1280,
      height: 720,

      // 上下のスクロール時の重複行数
      // ページスクロールボタンでスクロールしたとき、ここで指定した行数分のテキストは
      // スクロール後の画面にも重複して表示されます。
      scrollOffLines: 3,

      // 履歴の最大行数
      maxLinesCount: 20000,

      textCanvasConfig: {
        // 履歴テキストの行の高さ
        lineHeight: 28,

        // 履歴テキストの行間（単位：pixel）
        linePitch: 7,

        // 履歴テキスト表示部分のマージン（上、右、下、左）
        marginTop: 130,
        marginRight: 30,
        marginBottom: 100,
        marginLeft: 30,

        styleConfig: {
          // 履歴テキストの文字色
          color: 0xFFFFFF,

          // 履歴テキストのフォント種別
          fontFamily: ["GenShinGothic"],

          // 履歴テキストのフォントサイズ
          fontSize: 28,

          // 履歴テキストの字間（単位：pixel）
          pitch: 0,

          // 履歴テキストに影を付けるかどうか
          shadow: true,

          // 履歴テキストの影のalpha
          shadowAlpha: 0.7,

          // 履歴テキストの影のぼかし
          shadowBlur: 5,

          // 履歴テキストの影の色
          shadowColor: 0x000000,

          // 履歴テキストの影と文字の距離
          shadowDistance: 2,

          // 履歴テキストの縁取りの太さ（0で非表示）
          edgeWidth: 0,

          // 履歴テキストの縁取りの色
          edgeColor: 0x000000,

          // 履歴テキストの縁取りのalpha
          edgeAlpha: 0x000000,
        }
      }
    },

    // 履歴の上スクロールボタンの設定
    upButton: {
      // ボタンの表示位置
      x: 1280 - 58,
      y: 100,

      // ボタン画像
      imageFile: "sysimage/history_up.png",
    },

    // 履歴の下スクロールボタン
    downButton: {
      // ボタンの表示位置
      x: 1280 - 58,
      y: 130 + 500 + 2,

      // ボタン画像
      imageFile: "sysimage/history_down.png",
    },

    // 履歴の閉じるボタン
    closeButton: {
      // ボタンの表示位置
      x: 1280 - 30 - 24,
      y: 23,

      // ボタン画像
      imageFile: "sysimage/close_button.png",
    },

    // 履歴のスクロールバー
    scrollBar: {
      // スクロールバーの表示位置
      x: 1280 - 58,
      y: 130 + 1,

      // スクロールバーの表示サイズ
      width: 30,
      height: 500,

      // スクロールバーの背景色
      backgroundColor: 0xFFFFFF,

      // スクロールバーの背景
      backgroundAlpha: 0.5,

      // スクロールバー上のボタンの色
      bgColors: [0xFFFFFF, 0xFFFFFF, 0xFFFFFF],

      // スクロールバー上のボタンのalpha
      bgAlphas: [1.0, 1.0, 1.0]
    }
  }
};
