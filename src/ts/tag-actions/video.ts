import { Ponkan3 } from '../ponkan3';
import { TagAction, TagActionResult, TagValue } from '../tag-action';
import { PonEventHandler } from '../base/pon-event-handler';

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // 動画再生関係
    // ======================================================================
    /// @category 動画再生
    /// @description 動画を再生する
    /// @details
    ///   指定のレイヤーに動画ファイルを読み込み、再生します。
    ///   動画の再生はストリーミング方式で行われます。\n
    ///   ネットワーク回線によっては、動画がスムーズに再生できない可能性があります。
    ///
    ///   動画のサイズ（幅・高さ）は無視され、指定した幅・高さで再生されます。
    ///   また、レイヤーサイズも同じサイズに変更されます。
    ///
    ///   対応する動画ファイル形式は、プレイするブラウザに依存します。
    new TagAction(
      ['loadvideo', 'video'],
      [
        /// @param 対象レイヤー
        new TagValue('lay', 'string', true, null),
        /// @param 対象ページ
        new TagValue('page', 'string', false, 'current'),
        /// @param 動画ファイル
        new TagValue('file', 'string', true, null),
        /// @param 動画の幅(px)
        new TagValue('width', 'number', true, null),
        /// @param 動画の高さ(px)
        new TagValue('height', 'number', true, null),
        /// @param 読み込み完了後に自動的に再生するかどうか
        new TagValue('autoplay', 'boolean', false, true),
        /// @param ループ再生するかどうか
        new TagValue('loop', 'boolean', false, false),
        /// @param 音量(0.0〜1.0)
        new TagValue('volume', 'number', false, 1.0),
        /// @param 表示非表示
        new TagValue('visible', 'boolean', false, null),
        /// @param x座標(px)
        new TagValue('x', 'number', false, null),
        /// @param y座標(px)
        new TagValue('y', 'number', false, null),
        /// @param レイヤーのAlpha(0.0〜1.0)
        new TagValue('alpha', 'number', false, 1.0),
      ],
      (values: any, tick: number): TagActionResult => {
        const task: Promise<unknown>[] = [];
        p.getLayers(values).forEach(layer => {
          task.push(
            ((): Promise<unknown> => {
              if (values.x != null) {
                layer.x = values.x;
              }
              if (values.y != null) {
                layer.y = values.y;
              }
              if (values.visible != null) {
                layer.visible = values.visible;
              }
              if (values.alpha != null) {
                layer.alpha = values.alpha;
              }
              return layer.loadVideo(
                values.file,
                values.width,
                values.height,
                values.autoplay,
                values.loop,
                values.volume,
              );
            })(),
          );
        });
        Promise.all(task)
          .then(() => {
            p.conductor.start();
          })
          .catch(() => {
            throw new Error(`動画読み込みに失敗しました。(${values.file})`);
          });
        return p.conductor.stop();
      },
    ),
    /// @category 動画再生
    /// @description 動画を解放する
    /// @details
    ///   動画を解放します。
    ///   動画再生が完了したら、必ずこのコマンドで解放するようにしてください。
    new TagAction(
      ['freevideo'],
      [
        /// @param 対象レイヤー
        new TagValue('lay', 'string', true, null),
        /// @param 対象ページ
        new TagValue('page', 'string', false, 'current'),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.freeVideo();
        });
        return 'continue';
      },
    ),
    /// @category 動画再生
    /// @description 動画の設定
    /// @details
    ///   動画に関して設定します。
    new TagAction(
      ['videoopt'],
      [
        /// @param 対象レイヤー
        new TagValue('lay', 'string', true, null),
        /// @param 対象ページ
        new TagValue('page', 'string', false, 'current'),
        /// @param 音量(0.0〜1.0)
        new TagValue('volume', 'number', false, null),
        /// @param ループ再生するかどうか
        new TagValue('loop', 'boolean', false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          if (values.volume != null) {
            layer.videoVolume = values.volume;
          }
          if (values.loop != null) {
            layer.videoLoop = values.loop;
          }
        });
        return 'continue';
      },
    ),
    /// @category 動画再生
    /// @description 動画を再生する
    /// @details
    ///   動画再生を開始します。
    new TagAction(
      ['playvideo'],
      [
        /// @param 対象レイヤー
        new TagValue('lay', 'string', true, null),
        /// @param 対象ページ
        new TagValue('page', 'string', false, 'current'),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.playVideo();
        });
        return 'continue';
      },
    ),
    /// @category 動画再生
    /// @description 動画を一時停止する
    /// @details
    ///   動画再生を一時停止します。
    ///   再生再開するにはplayvideoコマンドを使用します。
    new TagAction(
      ['pausevideo'],
      [
        /// @param 対象レイヤー
        new TagValue('lay', 'string', true, null),
        /// @param 対象ページ
        new TagValue('page', 'string', false, 'current'),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.pauseVideo();
        });
        return 'continue';
      },
    ),
    /// @category 動画再生
    /// @description 動画を停止する
    /// @details
    ///   動画再生を終了します。
    new TagAction(
      ['stopvideo'],
      [
        /// @param 対象レイヤー
        new TagValue('lay', 'string', true, null),
        /// @param 対象ページ
        new TagValue('page', 'string', false, 'current'),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getLayers(values).forEach(layer => {
          layer.stopVideo();
        });
        return 'continue';
      },
    ),
    /// @category 動画再生
    /// @description 動画再生の終了を待つ
    /// @details
    ///   動画再生の終了を待ちます。\n
    ///   動画再生中のレイヤーが無い場合やループ再生の場合はなにもしません。
    new TagAction(
      ['waitvideo'],
      [
        /// @param スキップ可能かどうか
        new TagValue('canskip', 'boolean', false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        console.log('@@waitvideo', values);
        if (!p.hasPlayingVideoLayer) {
          return 'continue';
        }
        if (p.isSkipping && values.canskip) {
          p.waitVideoClickCallback();
          return 'break';
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                'click',
                (): void => {
                  p.waitVideoClickCallback();
                },
                'waitvideo',
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              'video',
              (): void => {
                p.waitVideoCompleteCallback();
              },
              'waitvideo',
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
