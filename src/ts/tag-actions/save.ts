import { Ponkan3 } from '../ponkan3';
import { TagAction, TagActionResult, TagValue } from '../tag-action';

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // セーブ＆ロード関係
    // ======================================================================
    /// @category セーブ／ロード
    /// @description 最新状態をセーブする
    /// @details
    ///   最後に通過したセーブポイントの状態をセーブします。
    ///   セーブ／ロードの詳細は [セーブ／ロード](../save-and-load/)を参照してください。
    new TagAction(
      ['save'],
      [
        /// @param セーブ番号
        new TagValue('num', 'number', true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.save(tick, values.num);
        return 'continue';
      },
    ),
    /// @category セーブ／ロード
    /// @description セーブデータから復元する
    /// @details
    ///   指定のセーブデータをロードします。
    new TagAction(
      ['load'],
      [
        /// @param セーブ番号
        new TagValue('num', 'number', true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.load(tick, values.num)
          .then(() => {
            p.conductor.start();
          })
          .catch(() => {
            throw new Error(`セーブデータのロードに失敗しました(${values.num})`);
          });
        return p.conductor.stop();
      },
    ),
    /// @category セーブ／ロード
    /// @description 一時セーブする
    /// @details
    ///   一時領域に、このコマンドを実行したときの状態を保存します。
    ///
    ///   ここで保存したセーブデータは通常のセーブデータとは別に保持されます。
    ///   また、あくまで一時領域に保存するだけなので、ゲームが終了するときに破棄されます。
    ///
    ///   右クリックサブルーチンの開始時にこのコマンドで状態を保存しておき、
    ///   右クリックサブルーチンが終わったときに `tempload` でまとめて復元する、というような用途で使用します。
    new TagAction(
      ['tempsave'],
      [
        /// @param セーブ番号
        new TagValue('num', 'number', true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.tempSave(tick, values.num);
        return 'continue';
      },
    ),
    /// @category セーブ／ロード
    /// @description 一時セーブデータから復元する
    /// @details
    ///   `tempsave` で保存した一時セーブデータをロードします。
    ///
    ///   `toback: true` を指定したときは、一時セーブデータの表ページ―の情報を
    ///   裏ページ側に復元します。レイヤーの状態をトランジションで復元したい場合などに利用します。
    new TagAction(
      ['tempload'],
      [
        /// @param セーブ番号
        new TagValue('num', 'number', true, null),
        /// @param 音声もロードするかどうか
        new TagValue('sound', 'boolean', false, false),
        /// @param 表ページを裏ページとして復元するかどうか
        new TagValue('toback', 'boolean', false, false),
      ],
      (values: any, tick: number): TagActionResult => {
        p.tempLoad(tick, values.num, values.sound, values.toback)
          .then(() => {
            p.conductor.start();
          })
          .catch(() => {
            throw new Error(`セーブデータのロードに失敗しました(${values.num})`);
          });
        return p.conductor.stop();
      },
    ),
    /// @category セーブ／ロード
    /// @description 現在の画面でスクリーンショットを固定する
    /// @details
    ///   現在の画面の状態でスクリーンショットを取ります。\n
    ///   取得されたスクリーンショットは `save` コマンドで保存されます。\n
    ///   セーブ画面に入った直後にこのコマンドでスクリーンショットの状態を固定し、
    ///   セーブ画面から抜けるときに `unlockscreenshot` で解除する、というような使い方をします。
    new TagAction(
      ['lockscreenshot'],
      [],
      (values: any, tick: number): TagActionResult => {
        p.lockScreenShot();
        return 'continue';
      },
    ),
    /// @category セーブ／ロード
    /// @description スクリーンショットの固定を解除する
    /// @details
    new TagAction(
      ['unlockscreenshot'],
      [],
      (values: any, tick: number): TagActionResult => {
        p.unlockScreenShot();
        return 'continue';
      },
    ),
    /// @category セーブ／ロード
    /// @description セーブデータをコピーする
    /// @details
    new TagAction(
      ['copysavedata', 'copysave'],
      [
        /// @param コピー元のセーブ番号
        new TagValue('srcnum', 'number', true, null),
        /// @param コピー先のセーブ番号
        new TagValue('destnum', 'number', true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.copySaveData(values.srcnum, values.destnum);
        return 'continue';
      },
    ),
    /// @category セーブ／ロード
    /// @description セーブデータを削除する
    /// @details
    new TagAction(
      ['deletesavedata', 'delsavedata', 'delsave'],
      [
        /// @param セーブ番号
        new TagValue('num', 'number', true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.deleteSaveData(values.num);
        return 'continue';
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
