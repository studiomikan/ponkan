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

### メッセージ

| コマンド名 | 内容 |
|------------|------|
| [messageopt, mesopt](#messageopt-mesopt) | テキストの設定 |
| [ch](#ch) | 文字を出力する |

### メッセージ操作

| コマンド名 | 内容 |
|------------|------|
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
| [screenshot](#screenshot) | 現在の画面のスクリーンショットを取る |
| [copysavedata, copysave](#copysavedata-copysave) | セーブデータをコピーする |
| [deletesavedata, delsavedata, delsave](#deletesavedata-delsavedata-delsave) | セーブデータを削除する |

## その他

### laycount 

レイヤーの数を変更する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| count | number | ○ |  | レイヤー数 |

TODO タグの説明文
### raiseerror 

エラーを発生させるかどうかの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| unknowntag | boolean |  |  | 存在しないタグを実行したときにエラーにする |


### clearsysvar 

システム変数をクリア


### cleargamevar 

ゲーム変数をクリア


### cleartmpvar 

一時変数をクリア


### savesysvar 

システム変数を保存する


### clickskipopt, clickskip 

クリックスキップの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| enabled | boolean | ○ |  | 有効ならtrue、無効ならfalseを指定 |

クリックスキップの有効無効を設定します。
（クリックスキップとは、テキスト表示途中にクリックすると行末・ページ末までスキップする機能のことです。）
### quake 

画面揺れ効果の開始

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| time | number | ○ |  | 画面揺れの時間 |
| x | number |  | 20 | 横方向の揺れの最大値 |
| y | number |  | 20 | 縦方向の揺れの最大値 |

TODO タグの説明文
### stopquake 

画面揺れ効果の停止

TODO タグの説明文
### waitquake 

画面揺れ効果の終了待ち

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
### rightclick, rclick 

右クリック時の動作を設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| jump | boolean |  |  | 右クリック時にjumpする場合はtrue |
| call | boolean |  |  | 右クリック時にcallする場合はtrue |
| file | string |  |  | jumpまたはcallするスクリプトファイル名 |
| label | string |  |  | jumpまたはcallするラベル名 |
| enabled | boolean |  |  | 右クリックの有効無効 |

右クリックまたは ESC キーを押下時の動作を設定します。
jump と call の両方を false に設定した場合、デフォルトの動作（メッセージレイヤーを隠す）になります。
jump を true に設定した場合、file と label で指定した場所へジャンプします。
call を true に設定した場合、file と label で指定した場所でサブルーチンを呼び出します。
### commandshortcut, cmdsc 

コマンドショートカットを設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| ch | string | ○ |  | ショートカットの文字 |
| command | string | ○ |  | コマンドの名前 |

コマンドショートカットを設定します。
### delcommandshortcut, delcmdsc 

コマンドショートカットを削除する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| ch | string | ○ |  | ショートカットの文字 |

コマンドショートカットを削除します。
## スクリプト制御

### s 

スクリプトの実行を停止する

TODO タグの説明文
### jump 

スクリプトファイルを移動する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| file | string |  |  | 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する |
| label | string |  |  | 移動先のラベル名。省略時はファイルの先頭 |
| countpage | boolean |  | true | 現在の位置を既読にするかどうか |

TODO タグの説明文
### call 

サブルーチンを呼び出す

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| file | string |  |  | 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する |
| label | string |  |  | 移動先のラベル名。省略時はファイルの先頭 |
| countpage | boolean |  | false | 現在の位置を既読にするかどうか |

TODO タグの説明文
### return 

サブルーチンをから戻る

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| file | string |  |  | 移動先のスクリプトファイル名。省略時は現在のファイル内で移動する |
| label | string |  |  | 移動先のラベル名。省略時はファイルの先頭 |
| forcestart | boolean |  | false | 戻った後、強制的にシナリオを再開する |
| countpage | boolean |  | true | 現在の位置を既読にするかどうか |

[call]タグで呼び出したサブルーチンから、呼び出し元に戻ります。

forcestart属性は、システムボタンを作成する際に指定します。
システムボタンで呼び出したサブルーチンで[skip]や[auto]を実行しても、通常はサブルーチンから戻るとスクリプトは停止してしまいます。
forcestart属性をtrueにした時は、呼び出し元へ戻ると同時に、[lb][pb]などで停止していたとしても、強制的に再開されます。
ただし[s]タグでスクリプトが完全に停止していた場合は停止したままです。
### if 

条件によって分岐する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| exp | string | ○ |  | 条件式(JavaScript) |

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
| loops | number | ○ |  | 繰り替えし回数 |
| indexvar | string |  | "__index__" | ループ中のインデックスを格納する変数名 |

[for]と[endfor]の間を指定回数繰り返します。
indexvarで指定した名前の一時変数にループ回数が格納されます。
ループ回数は0から始まるため、、0 〜 loops-1 の値をとります。
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
| lay | number |  |  | オートモード状態表示に使用するレイヤー |
| time | number |  |  | オートモードのインターバル時間(ms) |

TODO タグの説明文
### wait 

指定時間を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| time | number | ○ |  | 停止時間(ms) |
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
### waitclick 

クリック待ちで停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
## マクロ

### macro 

マクロを定義する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | string | ○ |  | マクロの名前 |

TODO タグの説明文
### endmacro 

マクロ定義の終わり

TODO タグの説明文
## メッセージ

### messageopt, mesopt 

テキストの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "message" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| fontfamily | array |  |  | フォント名の配列 |
| fontsize | number |  |  | フォントサイズ(px) |
| fontweight | string |  |  | フォントウェイト。"normal" \| "bold" |
| color | number |  |  | 文字色(0xRRGGBB) |
| margint | number |  |  | テキスト描画のマージン　上 |
| marginr | number |  |  | テキスト描画のマージン　右 |
| marginb | number |  |  | テキスト描画のマージン　下 |
| marginl | number |  |  | テキスト描画のマージン　左 |
| pitch | number |  |  | テキストの文字間(px) |
| lineheight | number |  |  | テキストの行の高さ(px) |
| linepitch | number |  |  | テキストの行間(px) |
| align | string |  |  | テキスト寄せの方向。"left" \| "center" \| "right" |
| shadow | boolean |  |  | 影の表示非表示 |
| shadowalpha | number |  |  | 影のAlpha(0.0〜1.0) |
| shadowangle | number |  |  | 影の角度(ラジアン) |
| shadowblur | number |  |  | 影のBlur |
| shadowcolor  | number |  |  | 影の色(0xRRGGBB) |
| shadowdistance | number |  |  | 影の距離(px) |
| edgewidth | number |  |  | 縁取りの太さ(px)。0で非表示になる |
| edgecolor | number |  |  | 縁取りの色(0xRRGGBB) |

TODO タグの説明文
### ch 

文字を出力する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "message" | 出力する先のレイヤ |
| page | string |  | "current" | 対象ページ |
| text | string | ○ |  | 出力する文字 |

TODO タグの説明文
## メッセージ操作

### br 

改行する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "message" | 出力する文字 |

TODO タグの説明文
### clear, c 

テキストをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "message" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### textspeed 

文字出力のインターバルを設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| unread | number |  |  | 未読文章のインターバル時間(ms) |
| read | number |  |  | 既読文章のインターバル時間(ms) |

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
| lay | string |  | "message" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| x | number |  |  | x座標 |
| y | number |  |  | x座標 |

TODO タグの説明文
### indent 

インデント位置を設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "message" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| history | boolean |  | true | メッセージ履歴もインデントするかどうか |

現在の文字描画位置でインデントするように設定します。
インデント位置は [endindent] または [clear] でクリアされます。
### endindent 

インデント位置をクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "message" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| history | boolean |  | true | メッセージ履歴もインデント解除するか |

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
| name | string | ○ |  | エイリアス名 |
| lay | string | ○ |  | 対象レイヤー |

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
| name | string | ○ |  | エイリアス名 |


### messagelayer, messagelay, meslay, meslay 

メッセージレイヤーを指定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | number | ○ |  | 対象レイヤー |

TODO タグの説明文
### linebreakglyph, lbglyph 

行末グリフに関して設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | number |  |  | グリフとして使用するレイヤー |
| pos | string |  |  | グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。
"eol"を指定すると文章の末尾に表示。
"relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
"absolute"を指定すると画面上の絶対位置で固定表示。 |
| x | number |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |
| y | number |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |

TODO タグの説明文
### pagebreakglyph, pbglyph 

ページ末グリフに関して設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | number |  |  | グリフとして使用するレイヤー |
| pos | string |  |  | グリフの表示位置。"eol"を指定すると文章の末尾に表示。"fixed"を指定すると固定位置で表示。
"eol"を指定すると文章の末尾に表示。
"relative"を指定するとメッセージレイヤーとの相対位置で固定表示。
"absolute"を指定すると画面上の絶対位置で固定表示。 |
| x | number |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |
| y | number |  |  | グリフの表示位置（メッセージレイヤーからの相対位置） |

TODO タグの説明文
### fillcolor, fill 

レイヤーを塗りつぶす

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| color | number | ○ |  | 塗りつぶし色(0xRRGGBB) |
| alpha | number |  | 1 | 塗りつぶしのAlpha(0.0〜1.0) |

TODO タグの説明文
### clearcolor 

レイヤー塗りつぶしをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### layopt 

レイヤーの設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| visible | boolean |  |  | 表示非表示 |
| x | number |  |  | x座標(px) |
| y | number |  |  | y座標(px) |
| width | number |  |  | 幅(px) |
| height | number |  |  | 高さ(px) |
| alpha | number |  | 1 | レイヤーのAlpha(0.0〜1.0) |
| autohide | boolean |  |  | hidemessagesで同時に隠すかどうか |
| blocklclick | boolean |  |  | 左クリックイベントを遮断するかどうか |
| blockrclick | boolean |  |  | 右クリックイベントを遮断するかどうか |
| blockcclick | boolean |  |  | 中クリックイベントを遮断するかどうか |
| blockmove | boolean |  |  | マウス移動イベントを遮断するかどうか |
| blockwheel | boolean |  |  | マウスホイールイベントを遮断するかどうか |

TODO タグの説明文
### loadimage, image 

レイヤーに画像を読み込む

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| file | string | ○ |  | 読み込む画像ファイルパス |
| visible | boolean |  |  | 表示非表示 |
| x | number |  |  | x座標(px) |
| y | number |  |  | y座標(px) |
| alpha | number |  | 1 | レイヤーのAlpha(0.0〜1.0) |

TODO タグの説明文
### loadchildimage, childimage,  

レイヤーに追加で画像を読み込む

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| file | string | ○ |  | 読み込む画像ファイルパス |
| x | number | ○ |  | x座標(px) |
| y | number | ○ |  | y座標(px) |
| alpha | number |  | 1 | 表示非表示 |

TODO タグの説明文
### freeimage, free, unloadimage 

レイヤーの画像を開放する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
## ボタン

### textbutton, txtbtn 

レイヤーにテキストボタンを配置する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| jump | boolean |  | true | ボタン押下時にjumpする場合はtrue |
| call | boolean |  |  | ボタン押下時にcallする場合はtrue |
| file | string |  |  | ボタン押下時にjumpまたはcallするスクリプトファイル名 |
| label | string |  |  | ボタン押下時にjumpまたはcallするラベル名 |
| exp | string |  |  | ボタン押下時に実行するJavaScript |
| text | string |  | "" | テキスト |
| x | number |  | 0 | x座標(px) |
| y | number |  | 0 | y座標(px) |
| width | number | ○ |  | 幅(px) |
| height | number | ○ |  | 高さ(px) |
| bgcolors | array | ○ |  | 背景色の配列(0xRRGGBB)。通常時、マウスオーバー時、マウス押下時の順 |
| bgalphas | array |  | 1,1,1 | 背景色のAlphaの配列(0.0〜1.0)。通常時、マウスオーバー時、マウス押下時の順 |
| system | boolean |  | false | システム用ボタンとする場合はtrue |
| margint | number |  | 0 | テキスト描画のマージン　上 |
| marginr | number |  | 0 | テキスト描画のマージン　右 |
| marginb | number |  | 0 | テキスト描画のマージン　下 |
| marginl | number |  | 0 | テキスト描画のマージン　左 |
| marginl | number |  | 0 | テキスト描画のマージン　左 |
| align | string |  | "center" | テキスト寄せの方向。"left" \| "center" \| "right" |
| countpage | boolean |  | true | 現在の位置を既読にするかどうか |

指定のレイヤーに、テキストと背景色を用いたボタンを配置します。
配置直後はボタンはロックされた状態となり、押下することはできません。
[unlockbuttons]タグでロック状態を解除することで、押下できるようになります。
### clearbuttons, clearbutton, clearbtn 

すべてのボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### cleartextbuttons, cleartextbutton, cleartxtbtn 

テキストボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### imagebutton, imgbtn 

レイヤーに画像ボタンを配置する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| jump | boolean |  | true | ボタン押下時にjumpする場合はtrue |
| call | boolean |  |  | ボタン押下時にcallする場合はtrue |
| file | string |  |  | ボタン押下時にjumpまたはcallするスクリプトファイル名 |
| label | string |  |  | ボタン押下時にjumpまたはcallするラベル名 |
| exp | string |  |  | ボタン押下時に実行するJavaScript |
| imagefile | string | ○ |  | ボタンにする画像ファイル |
| x | number |  | 0 | x座標(px) |
| y | number |  | 0 | y座標(px) |
| direction | string |  | "horizontal" | ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び" |
| system | boolean |  | false | システム用ボタンとする場合はtrue |
| countpage | boolean |  | true | 現在の位置を既読にするかどうか |

TODO タグの説明文
### clearimagebuttons, clearimagebutton, clearimgbtn 

画像ボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### togglebutton, tglbtn 

レイヤーにトグルボタンを配置する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| exp | string |  |  | ボタン押下時に実行するJavaScript |
| imagefile | string | ○ |  | ボタンにする画像ファイル |
| x | number |  | 0 | x座標(px) |
| y | number |  | 0 | y座標(px) |
| statevar | string | ○ |  | 選択状態を格納する一時変数の名前 |
| direction | string |  | "horizontal" | ボタン画像ファイルの向き。"horizontal"なら横並び、"vertical"なら縦並び" |
| system | boolean |  | false | システム用ボタンとする場合はtrue |

TODO タグの説明文
### cleartogglebuttons, cleartogglebutton, cleartglbtn 

トグルボタンをクリアする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### lockbuttons, lockbutton, lock 

ボタンをロックする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "all" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### unlockbuttons, unlockbutton, unlock 

ボタンをアンロックする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "all" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

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
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| loop | boolean |  | false | アニメーションをループさせるかどうか |
| time | number | ○ |  | 1フレームの時間 |
| width | number | ○ |  | 1フレームの幅 |
| height | number | ○ |  | 1フレームの高さ |
| frames | array | ○ |  | フレーム指定 |

TODO タグの説明文
### startframeanim, startfanim 

フレームアニメーションを開始する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### stopframeanim, stopfanim 

フレームアニメーションを停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### waitframeanim, waitfanim 

フレームアニメーションの終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
### startmove, move 

自動移動を開始する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string | ○ |  | 対象レイヤー |
| page | string |  | "current" | 対象ページ |
| time | number | ○ |  | 自動移動させる時間 |
| delay | number |  | 0 | 開始までの遅延時間(ms) |
| path | array | ○ |  | 自動移動させる位置を指定 |
| type | string |  | "linear" | 自動移動のタイプ。"linear" \| "bezier2" \| "bezier3" \| "catmullrom" |
| ease | string |  | "none" | 自動移動の入り・抜きの指定。"none" \| "in" \| "out" \| "both" |

TODO タグの説明文
### stopmove 

自動移動を停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "all" | 対象レイヤー |
| page | string |  | "current" | 対象ページ |

TODO タグの説明文
### waitmove, wm 

自動移動の終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
## サウンド

### bufalias 

バッファ番号エイリアスを作成する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| name | string | ○ |  | エイリアス名 |
| buf | string | ○ |  | 対象レイヤー |

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
| name | string | ○ |  | エイリアス名 |


### loadsound, sound 

音声をロードする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |
| file | string | ○ |  | 読み込む音声ファイルパス |

TODO タグの説明文
### freesound, unloadsound 

音声を開放する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |

TODO タグの説明文
### soundopt 

音声の設定

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | バッファ番号 |
| volume | number |  |  | 音量(0.0〜1.0) |
| volume2 | number |  |  | 音量2(0.0〜1.0) |
| seek | number |  |  | シーク位置(ms) |
| loop | boolean |  |  | ループ再生するかどうか |

TODO タグの説明文
### playsound 

音声を再生する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |

TODO タグの説明文
### stopsound 

音声を停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |

TODO タグの説明文
### fadesound 

音声をフェードする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |
| volume | number | ○ |  | フェード後の音量(0.0〜1.0) |
| time | number | ○ |  | フェード時間(ms) |
| autostop | boolean |  | false | フェード終了後に再生停止するか |

TODO タグの説明文
### fadeoutsound, fadeout 

音声をフェードアウトして再生停止する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |
| time | number | ○ |  | フェード時間(ms) |
| autostop | boolean |  | false | フェード終了後に再生停止するか |

TODO タグの説明文
### fadeinsound, fadein 

音声をフェードインで再生開始する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |
| volume | number | ○ |  | フェード後の音量(0.0〜1.0) |
| time | number | ○ |  | フェード時間(ms) |

TODO タグの説明文
### waitsoundstop, waitsound 

音声の再生終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
### waitsoundfade, waitfade 

音声のフェード終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
### endfadesound, endfade 

音声のフェードを終了する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| buf | string | ○ |  | 読み込み先バッファ番号 |

TODO タグの説明文
## トランジション

### backlay 

表レイヤを裏レイヤにコピーする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| lay | string |  | "all" | 対象レイヤー |

TODO タグの説明文
### copylay 

レイヤ情報をコピーする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| srclay | number | ○ |  | コピー元レイヤー |
| destlay | number | ○ |  | コピー先レイヤー |
| srcpage | string |  | "fore" | コピー元ページ |
| destpage | string |  | "fore" | コピー先ページ |

TODO タグの説明文
### currentpage 

操作対象ページを変更する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| page | string | ○ |  | 操作対象ページを指定 |

TODO タグの説明文
### preparetrans, pretrans 

トランジションの前準備

TODO タグの説明文
### trans 

トランジションを実行する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| time | number | ○ |  | トランジションの時間(ms) |
| method | string |  | "crossfade" | トランジションの種類 |
| rule | string |  | "" | ユニバーサルトランジションのルールファイル名 |
| vague | number |  | 0.25 | あいまい値 |

TODO タグの説明文
### stoptrans 

トランジションを停止する

TODO タグの説明文
### waittrans, wt 

トランジションの終了を待つ

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| canskip | boolean |  | true | スキップ可能かどうか |

TODO タグの説明文
## メッセージ履歴

### historyopt 

メッセージ履歴を設定する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| output | boolean |  |  | メッセージレイヤに文字を出力するかどうか |
| enabled | boolean |  |  | メッセージレイヤを表示できるかどうか |

TODO タグの説明文
### showhistory, history 

メッセージ履歴を表示する

TODO タグの説明文
### historych, hch 

メッセージ履歴にテキストを出力する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| text | string | ○ |  | 出力する文字 |

TODO タグの説明文
### hbr 

メッセージ履歴を改行する

TODO タグの説明文
## セーブ／ロード

### save 

最新状態をセーブする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | number | ○ |  | セーブ番号 |

TODO タグの説明文
### load 

セーブデータから復元する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | number | ○ |  | セーブ番号 |

TODO タグの説明文
### tempsave 

一時セーブする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | number | ○ |  | セーブ番号 |

TODO タグの説明文
### tempload 

一時セーブデータから復元する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | number | ○ |  | セーブ番号 |
| sound | boolean |  | false | 音声もロードするかどうか |
| toback | boolean |  | false | 表レイヤーを裏レイヤーとして復元するかどうか |

TODO タグの説明文
### screenshot 

現在の画面のスクリーンショットを取る

現在の画面の状態でスクリーンショットを取ります。
取得されたスクリーンショットは [save] で保存されます。
### copysavedata, copysave 

セーブデータをコピーする

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| srcnum | number | ○ |  | コピー元のセーブ番号 |
| destnum | number | ○ |  | コピー先のセーブ番号 |

TODO タグの説明文
### deletesavedata, delsavedata, delsave 

セーブデータを削除する

| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |
|--------------|----------|------|--------------|------|
| num | number | ○ |  | セーブ番号 |

TODO タグの説明文



