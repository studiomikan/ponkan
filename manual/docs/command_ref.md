# コマンドリファレンス

Ponkan3 のスクリプトで使用できる全てのコマンドの解説です。

コマンドの中には、長いコマンドをタイプする手間を省くため、別名が設けられているものがあります。
たとえば `startautomode` と `startauto` と `auto` は名前は異なりますが全て同じ動作をします。


## コマンド一覧

### その他

| コマンド名 | 内容 |
|------------|------|
| [laycount](#laycount) | レイヤーの数を変更する |
| [raiseerror](#raiseerror) | エラーを発生させるかどうかの設定 |
| [clearsysvar](#clearsysvar) | システム変数をクリア |
| [cleargamevar](#cleargamevar) | ゲーム変数をクリア |
| [cleartmpvar](#cleartmpvar) | 一時変数をクリア |
| [savesysvar](#savesysvar) | システム変数を保存する |
| [clickskipopt, clickskip](#clickskipopt-clickskip) | クリックスキップの設定 |
| [quake](#quake) | 画面揺れ効果の開始 |
| [stopquake](#stopquake) | 画面揺れ効果の停止 |
| [waitquake](#waitquake) | 画面揺れ効果の終了待ち |
| [rightclick, rclick](#rightclick-rclick) | 右クリック時の動作を設定する |
| [commandshortcut, cmdsc](#commandshortcut-cmdsc) | コマンドショートカットを設定する |
| [delcommandshortcut, delcmdsc](#delcommandshortcut-delcmdsc) | コマンドショートカットを削除する |

### スクリプト制御

| コマンド名 | 内容 |
|------------|------|
| [s](#s) | スクリプトの実行を停止する |
| [jump](#jump) | スクリプトファイルを移動する |
| [call](#call) | サブルーチンを呼び出す |
| [return](#return) | サブルーチンをから戻る |
| [if](#if) | 条件によって分岐する |
| [elseif, elsif](#elseif-elsif) | 条件によって分岐する |
| [else](#else) | 条件によって分岐する |
| [endif](#endif) | 条件分岐の終了 |
| [for](#for) | 指定回数繰り返す |
| [endfor](#endfor) | forループの終端 |
| [breakfor](#breakfor) | forループから抜ける |
| [startskip, skip](#startskip-skip) | スキップを開始する |
| [stopskip](#stopskip) | スキップを停止する |
| [startautomode, startauto, auto](#startautomode-startauto-auto) | オートモードを開始する |
| [stopautomode, stopauto](#stopautomode-stopauto) | オートモードを停止する |
| [automodeopt, autoopt](#automodeopt-autoopt) | オートモードの設定 |
| [wait](#wait) | 指定時間を待つ |
| [waitclick](#waitclick) | クリック待ちで停止する |

### マクロ

| コマンド名 | 内容 |
|------------|------|
| [macro](#macro) | マクロを定義する |
| [endmacro](#endmacro) | マクロ定義の終わり |

### メッセージ操作

| コマンド名 | 内容 |
|------------|------|
| [messageopt, mesopt](#messageopt-mesopt) | テキストの設定 |
| [ch](#ch) | 文字を出力する |
| [br](#br) | 改行する |
| [clear, c](#clear-c) | テキストをクリアする |
| [textspeed](#textspeed) | 文字出力のインターバルを設定 |
| [nowait](#nowait) | 一時的に文字出力インターバルを0にする |
| [endnowait](#endnowait) | nowaitを終了する |
| [textlocate, locate](#textlocate-locate) | 文字表示位置を指定する |
| [indent](#indent) | インデント位置を設定する |
| [endindent](#endindent) | インデント位置をクリアする |
| [linebreak, lb, l](#linebreak-lb-l) | 行末クリック待ちで停止する |
| [pagebreak, pb, p](#pagebreak-pb-p) | 行末クリック待ちで停止する |
| [hidemessages](#hidemessages) | メッセージレイヤを一時的に隠す |

### レイヤー操作

| コマンド名 | 内容 |
|------------|------|
| [layalias](#layalias) | レイヤー名エイリアスを作成する |
| [dellayalias](#dellayalias) | レイヤー名エイリアスを削除する |
| [messagelayer, messagelay, meslay, meslay](#messagelayer-messagelay-meslay-meslay) | メッセージレイヤーを指定する |
| [linebreakglyph, lbglyph](#linebreakglyph-lbglyph) | 行末グリフに関して設定する |
| [pagebreakglyph, pbglyph](#pagebreakglyph-pbglyph) | ページ末グリフに関して設定する |
| [fillcolor, fill](#fillcolor-fill) | レイヤーを塗りつぶす |
| [clearcolor](#clearcolor) | レイヤー塗りつぶしをクリアする |
| [layopt](#layopt) | レイヤーの設定 |
| [loadimage, image](#loadimage-image) | レイヤーに画像を読み込む |
| [loadchildimage, childimage, ](#loadchildimage-childimage-) | レイヤーに追加で画像を読み込む |
| [freeimage, free, unloadimage](#freeimage-free-unloadimage) | レイヤーの画像を開放する |

### ボタン

| コマンド名 | 内容 |
|------------|------|
| [textbutton, txtbtn](#textbutton-txtbtn) | レイヤーにテキストボタンを配置する |
| [clearbuttons, clearbutton, clearbtn](#clearbuttons-clearbutton-clearbtn) | すべてのボタンをクリアする |
| [cleartextbuttons, cleartextbutton, cleartxtbtn](#cleartextbuttons-cleartextbutton-cleartxtbtn) | テキストボタンをクリアする |
| [imagebutton, imgbtn](#imagebutton-imgbtn) | レイヤーに画像ボタンを配置する |
| [clearimagebuttons, clearimagebutton, clearimgbtn](#clearimagebuttons-clearimagebutton-clearimgbtn) | 画像ボタンをクリアする |
| [togglebutton, tglbtn](#togglebutton-tglbtn) | レイヤーにトグルボタンを配置する |
| [cleartogglebuttons, cleartogglebutton, cleartglbtn](#cleartogglebuttons-cleartogglebutton-cleartglbtn) | トグルボタンをクリアする |
| [lockbuttons, lockbutton, lock](#lockbuttons-lockbutton-lock) | ボタンをロックする |
| [unlockbuttons, unlockbutton, unlock](#unlockbuttons-unlockbutton-unlock) | ボタンをアンロックする |
| [locksystembuttons, locksystembutton, locksystem](#locksystembuttons-locksystembutton-locksystem) | システムボタンをロックする |
| [unlocksystembuttons, unlocksystembutton, unlocksystem](#unlocksystembuttons-unlocksystembutton-unlocksystem) | システムボタンをアンロックする |

### アニメーション

| コマンド名 | 内容 |
|------------|------|
| [frameanim, fanim](#frameanim-fanim) | フレームアニメーションを設定する |
| [startframeanim, startfanim](#startframeanim-startfanim) | フレームアニメーションを開始する |
| [stopframeanim, stopfanim](#stopframeanim-stopfanim) | フレームアニメーションを停止する |
| [waitframeanim, waitfanim](#waitframeanim-waitfanim) | フレームアニメーションの終了を待つ |
| [startmove, move](#startmove-move) | 自動移動を開始する |
| [stopmove](#stopmove) | 自動移動を停止する |
| [waitmove, wm](#waitmove-wm) | 自動移動の終了を待つ |

### レイヤーフィルタ

| コマンド名 | 内容 |
|------------|------|
| [blur](#blur) | ぼかしフィルタ |

### サウンド

| コマンド名 | 内容 |
|------------|------|
| [bufalias](#bufalias) | バッファ番号エイリアスを作成する |
| [delbufalias](#delbufalias) | バッファ番号エイリアスを削除する |
| [loadsound, sound](#loadsound-sound) | 音声をロードする |
| [freesound, unloadsound](#freesound-unloadsound) | 音声を開放する |
| [soundopt](#soundopt) | 音声の設定 |
| [playsound](#playsound) | 音声を再生する |
| [stopsound](#stopsound) | 音声を停止する |
| [fadesound](#fadesound) | 音声をフェードする |
| [fadeoutsound, fadeout](#fadeoutsound-fadeout) | 音声をフェードアウトして再生停止する |
| [fadeinsound, fadein](#fadeinsound-fadein) | 音声をフェードインで再生開始する |
| [waitsoundstop, waitsound](#waitsoundstop-waitsound) | 音声の再生終了を待つ |
| [waitsoundfade, waitfade](#waitsoundfade-waitfade) | 音声のフェード終了を待つ |
| [endfadesound, endfade](#endfadesound-endfade) | 音声のフェードを終了する |

### トランジション

| コマンド名 | 内容 |
|------------|------|
| [backlay](#backlay) | 表レイヤを裏レイヤにコピーする |
| [copylay](#copylay) | レイヤ情報をコピーする |
| [currentpage](#currentpage) | 操作対象ページを変更する |
| [preparetrans, pretrans](#preparetrans-pretrans) | トランジションの前準備 |
| [trans](#trans) | トランジションを実行する |
| [stoptrans](#stoptrans) | トランジションを停止する |
| [waittrans, wt](#waittrans-wt) | トランジションの終了を待つ |

### メッセージ履歴

| コマンド名 | 内容 |
|------------|------|
| [historyopt](#historyopt) | メッセージ履歴を設定する |
| [showhistory, history](#showhistory-history) | メッセージ履歴を表示する |
| [historych, hch](#historych-hch) | メッセージ履歴にテキストを出力する |
| [hbr](#hbr) | メッセージ履歴を改行する |

### セーブ／ロード

| コマンド名 | 内容 |
|------------|------|
| [save](#save) | 最新状態をセーブする |
| [load](#load) | セーブデータから復元する |
| [tempsave](#tempsave) | 一時セーブする |
| [tempload](#tempload) | 一時セーブデータから復元する |
| [lockscreenshot](#lockscreenshot) | 現在の画面でスクリーンショットを固定する |
| [unlockscreenshot](#unlockscreenshot) | スクリーンショットの固定を解除する |
| [copysavedata, copysave](#copysavedata-copysave) | セーブデータをコピーする |
| [deletesavedata, delsavedata, delsave](#deletesavedata-delsavedata-delsave) | セーブデータを削除する |


## その他


### laycount

レイヤーの数を変更する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| count | 数値(Number) | 〇 |  | レイヤー数 |

TODO タグの説明文

### raiseerror

エラーを発生させるかどうかの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| unknowntag | 真偽値(Boolean) |  |  | 存在しないタグを実行したときにエラーにする |

TODO タグの説明文

### clearsysvar

システム変数をクリア


TODO タグの説明文

### cleargamevar

ゲーム変数をクリア


TODO タグの説明文

### cleartmpvar

一時変数をクリア


TODO タグの説明文

### savesysvar

システム変数を保存する


TODO タグの説明文

### clickskipopt, clickskip

クリックスキップの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| enabled | 真偽値(Boolean) | 〇 |  | 有効ならtrue、無効ならfalseを指定 |

クリックスキップの有効無効を設定します。
（クリックスキップとは、テキスト表示途中にクリックすると行末・ページ末までスキップする機能のことです。）

### quake

画面揺れ効果の開始

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| time | 数値(Number) | 〇 |  | 画面揺れの時間 |
| x | 数値(Number) |  | `20` | 横方向の揺れの最大値 |
| y | 数値(Number) |  | `20` | 縦方向の揺れの最大値 |

TODO タグの説明文

### stopquake

画面揺れ効果の停止


TODO タグの説明文

### waitquake

画面揺れ効果の終了待ち

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

### rightclick, rclick

右クリック時の動作を設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| jump | 真偽値(Boolean) |  |  | 右クリック時にjumpする場合はtrue |
| call | 真偽値(Boolean) |  |  | 右クリック時にcallする場合はtrue |
| file | 文字列(String) |  |  | jumpまたはcallするスクリプトファイル名 |
| label | 文字列(String) |  |  | jumpまたはcallするラベル名 |
| enabled | 真偽値(Boolean) |  |  | 右クリックの有効無効 |

右クリックまたは ESC キーを押下時の動作を設定します。
jump と call の両方を false に設定した場合、デフォルトの動作（メッセージレイヤーを隠す）になります。
jump を true に設定した場合、file と label で指定した場所へジャンプします。
call を true に設定した場合、file と label で指定した場所でサブルーチンを呼び出します。

### commandshortcut, cmdsc

コマンドショートカットを設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| ch | 文字列(String) | 〇 |  | ショートカットの文字 |
| command | 文字列(String) | 〇 |  | コマンドの名前 |

コマンドショートカットを設定します。

### delcommandshortcut, delcmdsc

コマンドショートカットを削除する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| ch | 文字列(String) | 〇 |  | ショートカットの文字 |

コマンドショートカットを削除します。

## スクリプト制御


### s

スクリプトの実行を停止する


TODO タグの説明文

### jump

スクリプトファイルを移動する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| file | 文字列(String) |  |  | 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する |
| label | 文字列(String) |  |  | 移動先のラベル名。省略時はファイルの先頭 |
| countpage | 真偽値(Boolean) |  | `true` | 現在の位置を既読にするかどうか |

TODO タグの説明文

### call

サブルーチンを呼び出す

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| file | 文字列(String) |  |  | 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する |
| label | 文字列(String) |  |  | 移動先のラベル名。省略時はファイルの先頭 |
| countpage | 真偽値(Boolean) |  | `false` | 現在の位置を既読にするかどうか |

TODO タグの説明文

### return

サブルーチンをから戻る

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| file | 文字列(String) |  |  | 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する |
| label | 文字列(String) |  |  | 移動先のラベル名。省略時はファイルの先頭 |
| forcestart | 真偽値(Boolean) |  | `false` | 戻った後、強制的にシナリオを再開する |
| countpage | 真偽値(Boolean) |  | `true` | 現在の位置を既読にするかどうか |

[call]タグで呼び出したサブルーチンから、呼び出し元に戻ります。
forcestart属性は、システムボタンを作成する際に指定します。
システムボタンで呼び出したサブルーチンで[skip]や[auto]を実行しても、通常はサブルーチンから戻るとスクリプトは停止してしまいます。
forcestart属性をtrueにした時は、呼び出し元へ戻ると同時に、[lb][pb]などで停止していたとしても、強制的に再開されます。
ただし[s]タグでスクリプトが完全に停止していた場合は停止したままです。

### if

条件によって分岐する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| exp | 文字列(String) | 〇 |  | 条件式(JavaScript) |

TODO タグの説明文

### elseif, elsif

条件によって分岐する


TODO タグの説明文

### else

条件によって分岐する


TODO タグの説明文

### endif

条件分岐の終了


TODO タグの説明文

### for

指定回数繰り返す

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| loops | 数値(Number) | 〇 |  | 繰り替えし回数 |
| indexvar | 文字列(String) |  | `"__index__"` | ループ中のインデックスを格納する変数名 |

TODO タグの説明文

### endfor

forループの終端


TODO タグの説明文

### breakfor

forループから抜ける


TODO タグの説明文

### startskip, skip

スキップを開始する


TODO タグの説明文

### stopskip

スキップを停止する


TODO タグの説明文

### startautomode, startauto, auto

オートモードを開始する


TODO タグの説明文

### stopautomode, stopauto

オートモードを停止する


TODO タグの説明文

### automodeopt, autoopt

オートモードの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 数値(Number) |  |  | オートモード状態表示に使用するレイヤー |
| time | 数値(Number) |  |  | オートモードのインターバル時間(ms) |

TODO タグの説明文

### wait

指定時間を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| time | 数値(Number) | 〇 |  | 停止時間(ms) |
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

### waitclick

クリック待ちで停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

## マクロ


### macro

マクロを定義する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | 文字列(String) | 〇 |  | マクロの名前 |

TODO タグの説明文

### endmacro

マクロ定義の終わり


TODO タグの説明文

## メッセージ操作


### messageopt, mesopt

テキストの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| fontfamily | 配列(Array) |  |  | フォント名の配列 |
| fontsize | 数値(Number) |  |  | フォントサイズ(px) |
| fontweight | 文字列(String) |  |  | フォントウェイト。"normal" | "bold" |
| color | 数値(Number) |  |  | 文字色(0xRRGGBB) |
| margint | 数値(Number) |  |  | テキスト描画のマージン　上 |
| marginr | 数値(Number) |  |  | テキスト描画のマージン　右 |
| marginb | 数値(Number) |  |  | テキスト描画のマージン　下 |
| marginl | 数値(Number) |  |  | テキスト描画のマージン　左 |
| pitch | 数値(Number) |  |  | テキストの文字間(px) |
| lineheight | 数値(Number) |  |  | テキストの行の高さ(px) |
| linepitch | 数値(Number) |  |  | テキストの行間(px) |
| align | 文字列(String) |  |  | テキスト寄せの方向。"left" | "center" | "right" |
| shadow | 真偽値(Boolean) |  |  | 影の表示非表示 |
| shadowalpha | 数値(Number) |  |  | 影のAlpha(0.0〜1.0) |
| shadowangle | 数値(Number) |  |  | 影の角度(ラジアン) |
| shadowblur | 数値(Number) |  |  | 影のBlur |
| shadowcolor  | 数値(Number) |  |  | 影の色(0xRRGGBB) |
| shadowdistance | 数値(Number) |  |  | 影の距離(px) |
| edgewidth | 数値(Number) |  |  | 縁取りの太さ(px)。0で非表示になる |
| edgecolor | 数値(Number) |  |  | 縁取りの色(0xRRGGBB) |

TODO タグの説明文

### ch

文字を出力する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 出力する先のレイヤ |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| text | 文字列(String) | 〇 |  | 出力する文字 |

TODO タグの説明文

### br

改行する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 出力する文字 |

TODO タグの説明文

### clear, c

テキストをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### textspeed

文字出力のインターバルを設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| mode | 文字列(String) |  |  | インターバルのモード。"user" | "system" |
| unread | 数値(Number) |  |  | 未読文章のインターバル時間(ms) |
| read | 数値(Number) |  |  | 既読文章のインターバル時間(ms) |

TODO タグの説明文

### nowait

一時的に文字出力インターバルを0にする


TODO タグの説明文

### endnowait

nowaitを終了する


TODO タグの説明文

### textlocate, locate

文字表示位置を指定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| x | 数値(Number) |  |  | x座標 |
| y | 数値(Number) |  |  | x座標 |

TODO タグの説明文

### indent

インデント位置を設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| history | 真偽値(Boolean) |  | `true` | メッセージ履歴もインデントするかどうか |

現在の文字描画位置でインデントするように設定します。
インデント位置は [endindent] または [clear] でクリアされます。

### endindent

インデント位置をクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"message"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| history | 真偽値(Boolean) |  | `true` | メッセージ履歴もインデント解除するか |

[indent] で設定したインデント位置をクリアします。

### linebreak, lb, l

行末クリック待ちで停止する


TODO タグの説明文

### pagebreak, pb, p

行末クリック待ちで停止する


TODO タグの説明文

### hidemessages

メッセージレイヤを一時的に隠す


TODO タグの説明文

## レイヤー操作


### layalias

レイヤー名エイリアスを作成する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | 文字列(String) | 〇 |  | エイリアス名 |
| lay | 文字列(String) | 〇 |  | 対象レイヤー |

レイヤー名のエイリアス（別名）を作成します。
エイリアスを作成すると、レイヤーを指定するコマンドでレイヤー番号のかわりにエイリアス名を使用することができるようになります。
たとえば以下のように、背景画像を表示するレイヤーに base というようなエイリアスを作成することで、
スクリプト作成時の可読性が向上します。
```
# 背景画像はレイヤー 0 に作成するので、エイリアスを作成する
;layalias name: "base", lay: "0"
# 以後、背景画像は以下のように読み込める
;image lay: "base", file: "image/bg0.png", x: 0, y: 0
```

### dellayalias

レイヤー名エイリアスを削除する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | 文字列(String) | 〇 |  | エイリアス名 |

TODO タグの説明文

### messagelayer, messagelay, meslay, meslay

メッセージレイヤーを指定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 数値(Number) | 〇 |  | 対象レイヤー |

TODO タグの説明文

### linebreakglyph, lbglyph

行末グリフに関して設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 数値(Number) |  |  | グリフとして使用するレイヤー |
| pos | 文字列(String) |  |  | グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。
"eol"を指定すると文章の末尾に表示。
"relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
"absolute"を指定すると画面上の絶対位置で固定表示。 |
| x | 数値(Number) |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |
| y | 数値(Number) |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |

TODO タグの説明文

### pagebreakglyph, pbglyph

ページ末グリフに関して設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 数値(Number) |  |  | グリフとして使用するレイヤー |
| pos | 文字列(String) |  |  | グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。
"eol"を指定すると文章の末尾に表示。
"relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
"absolute"を指定すると画面上の絶対位置で固定表示。 |
| x | 数値(Number) |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |
| y | 数値(Number) |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |

TODO タグの説明文

### fillcolor, fill

レイヤーを塗りつぶす

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| color | 数値(Number) | 〇 |  | 塗りつぶし色(0xRRGGBB) |
| alpha | 数値(Number) |  | `1.0` | 塗りつぶしのAlpha(0.0〜1.0) |

TODO タグの説明文

### clearcolor

レイヤー塗りつぶしをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### layopt

レイヤーの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| visible | 真偽値(Boolean) |  |  | 表示非表示 |
| x | 数値(Number) |  |  | x座標(px) |
| y | 数値(Number) |  |  | y座標(px) |
| width | 数値(Number) |  |  | 幅(px) |
| height | 数値(Number) |  |  | 高さ(px) |
| alpha | 数値(Number) |  | `1.0` | レイヤーのAlpha(0.0〜1.0) |
| autohide | 真偽値(Boolean) |  |  | hidemessagesで同時に隠すかどうか |
| scalex | 数値(Number) |  |  | x軸方向のスケール。1.0で等倍 |
| scaley | 数値(Number) |  |  | y軸方向のスケール。1.0で等倍 |
| blocklclick | 真偽値(Boolean) |  |  | 左クリックイベントを遮断するかどうか |
| blockrclick | 真偽値(Boolean) |  |  | 右クリックイベントを遮断するかどうか |
| blockcclick | 真偽値(Boolean) |  |  | 中クリックイベントを遮断するかどうか |
| blockmove | 真偽値(Boolean) |  |  | マウス移動イベントを遮断するかどうか |
| blockwheel | 真偽値(Boolean) |  |  | マウスホイールイベントを遮断するかどうか |

TODO タグの説明文

### loadimage, image

レイヤーに画像を読み込む

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| file | 文字列(String) | 〇 |  | 読み込む画像ファイルパス |
| visible | 真偽値(Boolean) |  |  | 表示非表示 |
| x | 数値(Number) |  |  | x座標(px) |
| y | 数値(Number) |  |  | y座標(px) |
| alpha | 数値(Number) |  | `1.0` | レイヤーのAlpha(0.0〜1.0) |

TODO タグの説明文

### loadchildimage, childimage, 

レイヤーに追加で画像を読み込む

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| file | 文字列(String) | 〇 |  | 読み込む画像ファイルパス |
| x | 数値(Number) | 〇 |  | x座標(px) |
| y | 数値(Number) | 〇 |  | y座標(px) |
| alpha | 数値(Number) |  | `1.0` | 表示非表示 |

TODO タグの説明文

### freeimage, free, unloadimage

レイヤーの画像を開放する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

## ボタン


### textbutton, txtbtn

レイヤーにテキストボタンを配置する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| jump | 真偽値(Boolean) |  | `true` | ボタン押下時にjumpする場合はtrue |
| call | 真偽値(Boolean) |  |  | ボタン押下時にcallする場合はtrue |
| file | 文字列(String) |  |  | ボタン押下時にjumpまたはcallするスクリプトファイル名 |
| label | 文字列(String) |  |  | ボタン押下時にjumpまたはcallするラベル名 |
| exp | 文字列(String) |  |  | ボタン押下時に実行するJavaScript |
| text | 文字列(String) |  | `""` | テキスト |
| x | 数値(Number) |  | `0` | x座標(px) |
| y | 数値(Number) |  | `0` | y座標(px) |
| width | 数値(Number) | 〇 |  | 幅(px) |
| height | 数値(Number) | 〇 |  | 高さ(px) |
| bgcolors | 配列(Array) | 〇 |  | 背景色の配列(0xRRGGBB)。通常時、マウスオーバー時、マウス押下時の順 |
| bgalphas | 配列(Array) |  | `[1` | 背景色のAlphaの配列(0.0〜1.0)。通常時、マウスオーバー時、マウス押下時の順 |
| system | 真偽値(Boolean) |  | `false` | システム用ボタンとする場合はtrue |
| margint | 数値(Number) |  | `0` | テキスト描画のマージン　上 |
| marginr | 数値(Number) |  | `0` | テキスト描画のマージン　右 |
| marginb | 数値(Number) |  | `0` | テキスト描画のマージン　下 |
| marginl | 数値(Number) |  | `0` | テキスト描画のマージン　左 |
| marginl | 数値(Number) |  | `0` | テキスト描画のマージン　左 |
| align | 文字列(String) |  | `"center"` | テキスト寄せの方向。"left" | "center" | "right" |
| countpage | 真偽値(Boolean) |  | `true` | 現在の位置を既読にするかどうか |

指定のレイヤーに、テキストと背景色を用いたボタンを配置します。
配置直後はボタンはロックされた状態となり、押下することはできません。
[unlockbuttons]タグでロック状態を解除することで、押下できるようになります。

### clearbuttons, clearbutton, clearbtn

すべてのボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### cleartextbuttons, cleartextbutton, cleartxtbtn

テキストボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### imagebutton, imgbtn

レイヤーに画像ボタンを配置する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| jump | 真偽値(Boolean) |  | `true` | ボタン押下時にjumpする場合はtrue |
| call | 真偽値(Boolean) |  |  | ボタン押下時にcallする場合はtrue |
| file | 文字列(String) |  |  | ボタン押下時にjumpまたはcallするスクリプトファイル名 |
| label | 文字列(String) |  |  | ボタン押下時にjumpまたはcallするラベル名 |
| exp | 文字列(String) |  |  | ボタン押下時に実行するJavaScript |
| imagefile | 文字列(String) | 〇 |  | ボタンにする画像ファイル |
| x | 数値(Number) |  | `0` | x座標(px) |
| y | 数値(Number) |  | `0` | y座標(px) |
| direction | 文字列(String) |  | `"horizontal"` | ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び" |
| system | 真偽値(Boolean) |  | `false` | システム用ボタンとする場合はtrue |
| countpage | 真偽値(Boolean) |  | `true` | 現在の位置を既読にするかどうか |

TODO タグの説明文

### clearimagebuttons, clearimagebutton, clearimgbtn

画像ボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### togglebutton, tglbtn

レイヤーにトグルボタンを配置する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| exp | 文字列(String) |  |  | ボタン押下時に実行するJavaScript |
| imagefile | 文字列(String) | 〇 |  | ボタンにする画像ファイル |
| x | 数値(Number) |  | `0` | x座標(px) |
| y | 数値(Number) |  | `0` | y座標(px) |
| statevar | 文字列(String) | 〇 |  | 選択状態を格納する一時変数の名前 |
| direction | 文字列(String) |  | `"horizontal"` | ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び" |
| system | 真偽値(Boolean) |  | `false` | システム用ボタンとする場合はtrue |

TODO タグの説明文

### cleartogglebuttons, cleartogglebutton, cleartglbtn

トグルボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### lockbuttons, lockbutton, lock

ボタンをロックする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"all"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### unlockbuttons, unlockbutton, unlock

ボタンをアンロックする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"all"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### locksystembuttons, locksystembutton, locksystem

システムボタンをロックする


TODO タグの説明文

### unlocksystembuttons, unlocksystembutton, unlocksystem

システムボタンをアンロックする


TODO タグの説明文

## アニメーション


### frameanim, fanim

フレームアニメーションを設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| loop | 真偽値(Boolean) |  | `false` | アニメーションをループさせるかどうか |
| time | 数値(Number) | 〇 |  | 1フレームの時間 |
| width | 数値(Number) | 〇 |  | 1フレームの幅 |
| height | 数値(Number) | 〇 |  | 1フレームの高さ |
| frames | 配列(Array) | 〇 |  | フレーム指定 |

TODO タグの説明文

### startframeanim, startfanim

フレームアニメーションを開始する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### stopframeanim, stopfanim

フレームアニメーションを停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### waitframeanim, waitfanim

フレームアニメーションの終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

### startmove, move

自動移動を開始する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |
| time | 数値(Number) | 〇 |  | 自動移動させる時間 |
| delay | 数値(Number) |  | `0` | 開始までの遅延時間(ms) |
| path | 配列(Array) | 〇 |  | 自動移動させる位置を指定 |
| type | 文字列(String) |  | `"linear"` | 自動移動のタイプ。"linear" | "bezier2" | "bezier3" | "catmullrom" |
| ease | 文字列(String) |  | `"none"` | 自動移動の入り・抜きの指定。"none" | "in" | "out" | "both" |
| loop | 真偽値(Boolean) |  |  | 自動移動をループさせるかどうか。タイプが "linear" か "catmullrom" の場合のみ有効 |

TODO タグの説明文

### stopmove

自動移動を停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"all"` | 対象レイヤー |
| page | 文字列(String) |  | `"current"` | 対象ページ |

TODO タグの説明文

### waitmove, wm

自動移動の終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

## レイヤーフィルタ


### blur

ぼかしフィルタ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) | 〇 |  | 対象レイヤー |
| blurx | 数値(Number) |  | `4` | x軸方向のぼかし |
| blury | 数値(Number) |  | `4` | y軸方向のぼかし |
| quality | 数値(Number) |  | `4` | ぼかしの品質 |

TODO タグの説明文

## サウンド


### bufalias

バッファ番号エイリアスを作成する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | 文字列(String) | 〇 |  | エイリアス名 |
| buf | 文字列(String) | 〇 |  | 対象レイヤー |

バッファのエイリアス（別名）を作成します。
エイリアスを作成すると、バッファ番号を指定するコマンドでバッファ番号のかわりにエイリアス名を使用することができるようになります。
たとえば以下のように、効果音を再生するバッファに se というようなエイリアスを作成することで、
スクリプト作成時の可読性が向上します。
```
# 背景画像はレイヤー 0 に作成するので、エイリアスを作成する
;bufalias name: "se", buf: "0"
# 以後、効果音は以下のように読み込める
;loadsound "buf": "se", "file": "sound/pekowave1.wav"
```

### delbufalias

バッファ番号エイリアスを削除する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | 文字列(String) | 〇 |  | エイリアス名 |

TODO タグの説明文

### loadsound, sound

音声をロードする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |
| file | 文字列(String) | 〇 |  | 読み込む音声ファイルパス |

TODO タグの説明文

### freesound, unloadsound

音声を開放する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |

TODO タグの説明文

### soundopt

音声の設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | バッファ番号 |
| volume | 数値(Number) |  |  | 音量(0.0〜1.0) |
| gvolume | 数値(Number) |  |  | グローバル音量(0.0〜1.0) |
| seek | 数値(Number) |  |  | シーク位置(ms) |
| loop | 真偽値(Boolean) |  |  | ループ再生するかどうか |

TODO タグの説明文

### playsound

音声を再生する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |

TODO タグの説明文

### stopsound

音声を停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |

TODO タグの説明文

### fadesound

音声をフェードする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |
| volume | 数値(Number) | 〇 |  | フェード後の音量(0.0〜1.0) |
| time | 数値(Number) | 〇 |  | フェード時間(ms) |
| autostop | 真偽値(Boolean) |  | `false` | フェード終了後に再生停止するか |

TODO タグの説明文

### fadeoutsound, fadeout

音声をフェードアウトして再生停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |
| time | 数値(Number) | 〇 |  | フェード時間(ms) |
| autostop | 真偽値(Boolean) |  | `false` | フェード終了後に再生停止するか |

TODO タグの説明文

### fadeinsound, fadein

音声をフェードインで再生開始する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |
| volume | 数値(Number) | 〇 |  | フェード後の音量(0.0〜1.0) |
| time | 数値(Number) | 〇 |  | フェード時間(ms) |

TODO タグの説明文

### waitsoundstop, waitsound

音声の再生終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

### waitsoundfade, waitfade

音声のフェード終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

### endfadesound, endfade

音声のフェードを終了する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | 文字列(String) | 〇 |  | 読み込み先バッファ番号 |

TODO タグの説明文

## トランジション


### backlay

表レイヤを裏レイヤにコピーする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | 文字列(String) |  | `"all"` | 対象レイヤー |

TODO タグの説明文

### copylay

レイヤ情報をコピーする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| srclay | 数値(Number) | 〇 |  | コピー元レイヤー |
| destlay | 数値(Number) | 〇 |  | コピー先レイヤー |
| srcpage | 文字列(String) |  | `"fore"` | コピー元ページ |
| destpage | 文字列(String) |  | `"fore"` | コピー先ページ |

TODO タグの説明文

### currentpage

操作対象ページを変更する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| page | 文字列(String) | 〇 |  | 操作対象ページを指定 |

TODO タグの説明文

### preparetrans, pretrans

トランジションの前準備


TODO タグの説明文

### trans

トランジションを実行する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| time | 数値(Number) | 〇 |  | トランジションの時間(ms) |
| method | 文字列(String) |  | `"crossfade"` | トランジションの種類 |
| rule | 文字列(String) |  | `""` | 自動移動をループさせるかどうか。タイプが "linear" か "catmullrom" の場合のみ有効 |
| vague | 数値(Number) |  | `0.25` | あいまい値 |

TODO タグの説明文

### stoptrans

トランジションを停止する


TODO タグの説明文

### waittrans, wt

トランジションの終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | 真偽値(Boolean) |  | `true` | スキップ可能かどうか |

TODO タグの説明文

## メッセージ履歴


### historyopt

メッセージ履歴を設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| output | 真偽値(Boolean) |  |  | メッセージレイヤに文字を出力するかどうか |
| enabled | 真偽値(Boolean) |  |  | メッセージレイヤを表示できるかどうか |

TODO タグの説明文

### showhistory, history

メッセージ履歴を表示する


TODO タグの説明文

### historych, hch

メッセージ履歴にテキストを出力する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| text | 文字列(String) | 〇 |  | 出力する文字 |

TODO タグの説明文

### hbr

メッセージ履歴を改行する


TODO タグの説明文

## セーブ／ロード


### save

最新状態をセーブする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | 数値(Number) | 〇 |  | セーブ番号 |

TODO タグの説明文

### load

セーブデータから復元する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | 数値(Number) | 〇 |  | セーブ番号 |

TODO タグの説明文

### tempsave

一時セーブする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | 数値(Number) | 〇 |  | セーブ番号 |

TODO タグの説明文

### tempload

一時セーブデータから復元する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | 数値(Number) | 〇 |  | セーブ番号 |
| sound | 真偽値(Boolean) |  | `false` | 音声もロードするかどうか |
| toback | 真偽値(Boolean) |  | `false` | 表レイヤーを裏レイヤーとして復元するかどうか |

TODO タグの説明文

### lockscreenshot

現在の画面でスクリーンショットを固定する


TODO タグの説明文

### unlockscreenshot

スクリーンショットの固定を解除する


TODO タグの説明文

### copysavedata, copysave

セーブデータをコピーする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| srcnum | 数値(Number) | 〇 |  | コピー元のセーブ番号 |
| destnum | 数値(Number) | 〇 |  | コピー先のセーブ番号 |

TODO タグの説明文

### deletesavedata, delsavedata, delsave

セーブデータを削除する


TODO タグの説明文

