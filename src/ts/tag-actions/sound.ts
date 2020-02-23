import { Ponkan } from "../ponkan";
import { TagAction, TagActionResult, TagValue } from "../tag-action";
import { PonEventHandler } from "../base/pon-event-handler";
import { SoundBuffer } from "../base/sound";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan): TagAction[] {
  return [
    // ======================================================================
    // サウンド関係
    // ======================================================================
    /// @category サウンド
    /// @description バッファ番号エイリアスを作成する
    /// @details
    ///   バッファのエイリアス（別名）を作成します。
    ///   エイリアスを作成すると、バッファ番号を指定するコマンドでバッファ番号のかわりにエイリアス名を使用することができるようになります。
    ///   たとえば以下のように、効果音を再生するバッファに se というようなエイリアスを作成することで、
    ///   スクリプト作成時の可読性が向上します。
    ///   ```
    ///   # 効果音はバッファ 0 に作成するので、エイリアスを作成する
    ///   ;bufalias name: "se", buf: "0"
    ///   # 以後、効果音は以下のように読み込める
    ///   ;loadsound "buf": "se", "file": "sound/pekowave1.mp3"
    ///   ```
    new TagAction(
      ["bufalias"],
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
        /// @param 対象レイヤー
        new TagValue("buf", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.soundBufferAlias[values.name] = values.buf;
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description バッファ番号エイリアスを削除する
    /// @details
    ///   バッファ番号エイリアスを削除します。
    new TagAction(
      ["delbufalias"],
      [
        /// @param エイリアス名
        new TagValue("name", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        delete p.soundBufferAlias[values.name];
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をロードする
    /// @details
    ///   指定の音声バッファに音声ファイルを読み込みます。
    new TagAction(
      ["loadsound", "sound"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param 読み込む音声ファイルパス
        new TagValue("file", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf)
          .loadSound(values.file)
          .then(sb => {
            p.conductor.start();
          })
          .catch(() => {
            p.error(new Error(`音声のロードに失敗しました(${values.file})`));
          });
        return p.conductor.stop();
      },
    ),
    /// @category サウンド
    /// @description 音声を開放する
    /// @details
    ///   指定の音声バッファの音声を解放します。
    ///   使用が終わった音声はこのコマンドで解放するようにしてください。
    new TagAction(
      ["freesound", "unloadsound"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).freeSound();
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声の設定
    /// @details
    ///   音声に関して設定します。
    new TagAction(
      ["soundopt"],
      [
        /// @param バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param 音量(0.0〜1.0)
        new TagValue("volume", "number", false, null),
        /// @param グローバル音量(0.0〜1.0)
        new TagValue("gvolume", "number", false, null),
        /// @param シーク位置(ms)
        new TagValue("seek", "number", false, null),
        /// @param ループ再生するかどうか
        new TagValue("loop", "boolean", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        const sb: SoundBuffer = p.getSoundBuffer(values.buf);
        if (values.volume != null) {
          sb.volume = values.volume;
        }
        if (values.gvolume != null) {
          sb.gvolume = values.gvolume;
        }
        if (values.seek != null) {
          sb.seek = values.seek;
        }
        if (values.loop != null) {
          sb.loop = values.loop;
        }
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声の設定
    /// @details
    ///   音声が最後まで再生されて停止したときの動作を設定します。
    ///   この設定は、音声が変更された、または音声が停止されたときにクリアされます。
    ///
    ///   stopsoundなどのタグで停止された場合には動作しません。
    ///   このコマンドを実行した場合は、できるだけ速く`s`コマンドでスクリプトを停止してください。
    new TagAction(
      ["setsoundstop"],
      [
        /// @param バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param jumpする場合はtrue
        new TagValue("jump", "boolean", false, true),
        /// @param callする場合はtrue
        new TagValue("call", "boolean", false, false),
        /// @param jumpまたはcallするスクリプトファイル名
        new TagValue("file", "string", false, null),
        /// @param jumpまたはcallするラベル名
        new TagValue("label", "string", false, null),
      ],
      (values: any, tick: number): TagActionResult => {
        const sb: SoundBuffer = p.getSoundBuffer(values.buf);
        if (values.jump != null) {
          sb.onStopJump = values.jump;
        }
        if (values.call != null) {
          sb.onStopCall = values.call;
        }
        if (values.file != null) {
          sb.onStopFile = values.file;
        }
        if (values.label != null) {
          sb.onStopLabel = values.label;
        }
        return "continue";
      },
    ),

    /// @category サウンド
    /// @description 音声を再生する
    /// @details
    ///   指定の音声バッファに読み込まれた音声を再生します。
    new TagAction(
      ["playsound"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).play();
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声を停止する
    /// @details
    ///   指定の音声バッファの再生を停止します。
    new TagAction(
      ["stopsound"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).stop("tag");
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードする
    /// @details
    ///   指定の音声バッファの音量をフェードします。\n
    ///   このコマンドではフェード完了まで待ちません。フェードを待つ場合は `waitfade` コマンドを使用してください。
    new TagAction(
      ["fadesound"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード後の音量(0.0〜1.0)
        new TagValue("volume", "number", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
        /// @param フェード終了後に再生停止するか
        new TagValue("autostop", "boolean", false, false),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).fade(values.volume, values.time, values.autostop);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードアウトして再生停止する
    /// @details
    ///   指定の音声バッファをフェードアウトします。\n
    ///   このコマンドではフェード完了まで待ちません。フェードを待つ場合は `waitfade` コマンドを使用してください。
    new TagAction(
      ["fadeoutsound", "fadeout"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
        /// @param フェード終了後に自動的に再生停止するか
        new TagValue("autostop", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).fadeout(values.time, values.autostop);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声をフェードインで再生開始する
    /// @details
    ///   指定の音声バッファをフェードインしながら再生開始します。
    ///   このコマンドではフェード完了まで待ちません。フェードを待つ場合は `waitfade` コマンドを使用してください。
    new TagAction(
      ["fadeinsound", "fadein"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param フェード後の音量(0.0〜1.0)
        new TagValue("volume", "number", true, null),
        /// @param フェード時間(ms)
        new TagValue("time", "number", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).fadein(values.volume, values.time);
        return "continue";
      },
    ),
    /// @category サウンド
    /// @description 音声の再生終了を待つ
    /// @details
    ///   指定の音声バッファの音声が最後まで再生されるのを待ちます。\n
    ///   再生中でない場合やループ再生中の場合はなにもしません。
    new TagAction(
      ["waitsoundstop", "waitsound"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        const s: SoundBuffer = p.getSoundBuffer(values.buf);
        if (!s.playing || s.loop) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitSoundStopClickCallback(s);
          return "continue";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.waitSoundStopClickCallback(s);
                },
                "waitsoundstop",
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              "soundstop",
              (): void => {
                p.waitSoundCompleteCallback(s);
              },
              "waitsoundstop",
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
    /// @category サウンド
    /// @description 音声のフェード終了を待つ
    /// @details
    ///   指定の音声バッファのフェードが完了するのを待ちます。
    new TagAction(
      ["waitsoundfade", "waitfade"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
        /// @param スキップ可能かどうか
        new TagValue("canskip", "boolean", false, true),
      ],
      (values: any, tick: number): TagActionResult => {
        const s: SoundBuffer = p.getSoundBuffer(values.buf);
        if (!s.fading) {
          return "continue";
        }
        if (p.isSkipping && values.canskip) {
          p.waitSoundFadeClickCallback(s);
          return "continue";
        } else {
          if (values.canskip) {
            p.conductor.addEventHandler(
              new PonEventHandler(
                "click",
                (): void => {
                  p.waitSoundFadeClickCallback(s);
                },
                "waitsoundfade",
              ),
            );
          }
          p.conductor.addEventHandler(
            new PonEventHandler(
              "soundfade",
              (): void => {
                p.waitSoundFadeCompleteCallback(s);
              },
              "waitsoundfade",
            ),
          );
          return p.conductor.stop();
        }
      },
    ),
    /// @category サウンド
    /// @description 音声のフェードを終了する
    /// @details
    ///   指定の音声バッファのフェードを終了します。\n
    ///   音声バッファの音量は即座にフェード後の音量になります。
    new TagAction(
      ["endfadesound", "endfade"],
      [
        /// @param 読み込み先バッファ番号
        new TagValue("buf", "string", true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        p.getSoundBuffer(values.buf).endFade();
        return "continue";
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
