import { Logger } from "./logger";
import { Tag } from "./tag";

/*
スクリプトのイメージ

# コメント行
@ コマンド行
[タグ名 key=value
        key=value]
*label
- JS 出力なし
= JS 出力あり
---
JS部
---
*/

export class ScriptParser2 {
  private scriptText: string;
  private scriptTextLength: number;
  private parsePoint: number = 0;
  private currentLineNum: number = 1;
  private _tags: Tag[] = [];

  public get tags(): Tag[] { return this._tags; }

  public constructor(scriptText: string) {
    this.scriptText = scriptText.replace(/\r\n/g, "\n");
    this.scriptTextLength = this.scriptText.length;
    this.currentLineNum = 0;
    this.parse();
  }

  public debugPrint(): void {
    this.tags.forEach((tag) => {
      tag.debugPrint();
    });
  }

  private parse(): void {
    while (true) {
      this.skipWhiteSpace();
      // let ch0: string = this.getChar();
      const ch0: string = this.readChar();
      if (ch0 === "") { break; }

      switch (ch0) {
        case "#":
          // コメント
          this.parseComment();
          break;
        case "[":
          // コマンド
          this.parseCommand();
          break;
        case "*":
          // ラベル
          this.parseLabel();
          break;
        case "|":
          // セーブ更新マーク
          this.parseSaveMark();
          break;
        case "-":
          // JavaScript
          this.parseJs();
          break;
        case "=":
          // JavaScript出力
          this.parseJsPrint();
          break;
        default:
          this.parseText(this.getChar());
          break;
      }
    }
    this.addTag("s", { __body__: "s" });
  }

  private parseComment(): void {
    this.dropUntilLineBreak();
  }

  private parseCommand(): void {
    const trash = this.getChar(); // "[" 読み捨て

    // コマンド名取得
    this.skipWhiteSpace();
    const commandName = this.getWord();
    if (commandName === "" || commandName === "]") {
      throw new Error(`文法エラー：コマンド名がありません(line:${this.currentLineNum})`);
    }

    let body: string = `[${commandName}` ;
    const values: any = {};

    while (true) {
      this.skipWhiteSpace();
      // 終了判定
      if (this.readChar() === "]") {
        this.getChar(); // "]" 読み捨て
        break;
      }
      // 値の名前
      this.skipWhiteSpace();
      const valueName = this.getWord();
      if (valueName === "" || valueName === "") {
        throw new Error(`文法エラー：値名がありません(line:${this.currentLineNum})`);
      }
      // イコール
      this.skipWhiteSpace();
      const equal = this.getChar();
      if (equal !== "=") {
        throw new Error(
          `文法エラー：=がありません(name:${commandName})(line:${this.currentLineNum})`);
      }
      // 値
      this.skipWhiteSpace();
      const value = this.getWord();
      if (value === "" || value === "") {
        throw new Error(
          `文法エラー：値がありません(name:${commandName})(line:${this.currentLineNum})`);
      }

      body += ` "${valueName}"="${value}"`;
      values[valueName] = value;
    }
    body += "]";
    values.__body__ = body;
    this.addTag(commandName, values);
  }

  private parseLabel(): void {
    const line = this.readUntilLineBreak();
    const body = line.substring(1).trim();
    this.addTag("__label__", { __body__: body });
  }

  private parseSaveMark(): void {
    const line = this.readUntilLineBreak();
    const body = line.substring(1).trim();
    const p: number = body.indexOf(":");
    if (p !== -1) {
      const name: string = body.substring(0, p);
      const comment: string = body.substring(p);
      this.addTag("__save_mark__", { __body__: body, name, comment });
    } else if (body.length > 0) {
      const name: string = `__save_mark_${this.currentLineNum}__`;
      this.addTag("__save_mark__", { __body__: body, name, comment: body });
    } else {
      const name: string = `__save_mark_${this.currentLineNum}__`;
      this.addTag("__save_mark__", { __body__: body, name, comment: "" });
    }
  }

  private parseJs(): void {
    if (this.read3Char() === "---") {
      this.readUntilLineBreak(); // "---" を読み捨てる
      let js: string = "";
      while (true) {
        const tmp: string  = this.readUntilLineBreak();
        if (tmp === "" || tmp.trim() === "---") { break; }
        js += tmp + "\n";
      }
      this.addTag("__js__", { __body__: js, print: false });
    } else {
      const line = this.readUntilLineBreak();
      const body = line.substring(1).trim();
      this.addTag("__js__", { __body__: body, print: false });
    }
  }

  private parseJsPrint(): void {
    const line = this.readUntilLineBreak();
    const body = line.substring(1).trim();
    this.addTag("__js__", { __body__: body, print: true });
  }

  private parseText(ch: string): void {
    this.addTag("ch", { __body__: ch, text: ch});
  }

  private dropUntilLineBreak(): void {
    while (true) {
      const ch: string = this.getChar();
      if (ch === "" || this.isLineBreak(ch)) {
        break;
      }
    }
  }

  private readUntilLineBreak(): string {
    let str = "";
    while (true) {
      const ch: string = this.getChar();
      if (ch === "" || this.isLineBreak(ch)) {
        break;
      }
      str += ch;
    }
    return str;
  }

  private getWord(): string {
    const ch0 = this.getChar();
    if (ch0 === "") { return ""; }

    if (ch0 === "\"" || ch0 === "\'") {
      let word = "";
      let escapeFlag = false;
      while (true) {
        const ch = this.getChar();
        if (ch === "") {
          break;
        } else if (escapeFlag) {
          word += ch;
        } else if (ch === ch0) {
          break;
        } else if (ch === "\\") {
          escapeFlag = true;
        } else {
          word += ch;
        }
      }
      return word;
    } else {
      let word = ch0;
      while (true) {
        const ch = this.readChar();
        switch (ch) {
          case "": case "\"": case "\'":
          case "\r": case "\n": case "\t": case " ":
          case "=": case "]":
            return word;
          default:
            word += this.getChar();
            break;
        }
      }
    }
  }

  private getChar(): string {
    const ch: string = this.scriptText.charAt(this.parsePoint++);
    if (ch === "\n") {
      this.currentLineNum++;
    }
    return ch;
  }

  private readChar(): string {
    return this.scriptText.charAt(this.parsePoint);
  }

  private read3Char(): string {
    const script = this.scriptText;
    const point = this.parsePoint;
    return script.charAt(point) +
           script.charAt(point + 1) +
           script.charAt(point + 2);
  }

  private skipWhiteSpace() {
    while (true) {
      const ch: string = this.readChar();
      if (ch === "") {
        return;
      } else if (this.isWhiteSpace(ch)) {
        this.getChar();
      } else {
        return;
      }
    }
  }

  private isWhiteSpace(ch: string): boolean {
    switch (ch) {
      case "\n": case "\r": case "\t": case " ":
        return true;
    }
    return false;
  }

  private isLineBreak(ch: string): boolean {
    switch (ch) {
      case "\n": case "\r":
        return true;
    }
    return false;
  }

  private addTag(name: string, values: object) {
    this._tags.push(new Tag(name, values, this.currentLineNum - 1));
    // Logger.debug("ADD TAG: ", name, values)
  }
}
