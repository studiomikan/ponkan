import { Logger } from "./logger";
import { Tag } from "./tag";

export class ScriptParser {
  private scriptText: string;
  private lines: string[] = [];
  private currentLineNum: number = 0;
  private _tags: Tag[] = [];

  public get tags(): Tag[] { return this._tags; }

  public constructor(scriptText: string) {
    this.scriptText = scriptText;
    this.currentLineNum = 0;
    this.lines = this.scriptText.split(/\n/g);
    this.parse();
  }

  public debugPrint(): void {
    this.tags.forEach((tag) => {
      tag.debugPrint();
    });
  }

  private getLine(): string | null {
    if (this.currentLineNum >= this.lines.length) {
      return null;
    }

    let line: string = "";
    let first: boolean = true;
    while (true) {
      if (this.currentLineNum >= this.lines.length) {
        break;
      }

      let l = this.lines[this.currentLineNum++].trim(); 
      if (l !== "" && l[l.length - 1] === "\\") {
        if (!first) { line += "\n"; }
        first = false;
        line += l.substring(0, l.length - 1);
      } else {
        line += l;
        break;
      }
    }
    return line;
  }

  private getLineWithoutTrim(): string | null {
    if (this.currentLineNum < this.lines.length) {
      return this.lines[this.currentLineNum++];
    } else {
      return null;
    }
  }

  private parse(): void {
    while (true) {
      const line: string | null = this.getLine();
      if (line === null) { break; }
      if (line === "") { continue; }

      const ch0 = line.charAt(0);
      const body = line.substring(1).trim();
      // Logger.debug("line: ", ch0, body);

      if (line === "---") {
        // JavaScript部
        let js: string = "";
        while (true) {
          const tmp: string | null = this.getLineWithoutTrim();
          if (tmp === null || tmp === "" || tmp.trim() === "---") { break; }
          js += tmp + "\n";
        }
        this.addTag("__js__", { __body__: js, print: false });
      } else {
        // その他の一行コマンド類
        switch (ch0) {
          case "#":
            // コメント
            break;
          case ";":
            // コマンド
            this.parseCommand(body);
            break;
          case "*":
            // ラベル
            this.parseLabel(body);
            break;
          case "|":
            // セーブ更新マーク
            this.parseSaveMark(body);
            break;
          case "-":
            // JavaScript / JavaScript部
            this.parseJs(body);
            break;
          case "=":
            // JavaScript出力
            this.parseJsPrint(body);
            break;
          default:
            this.parseText(line);
            break;
        }
      }
    }
    this.addTag("s", { __body__: "s" });
  }

  private parseCommand(body: string): void {
    try {
      let tagName: string;
      let valuesStr: string;
      let values: any;
      let reg = /[{ ]/.exec(body);
      if (reg == null) {
        tagName = body.substring(0).trim();
        values = {};
      } else {
        tagName = body.substring(0, reg.index).trim();
        valuesStr = body.substring(reg.index).trim();
        if (valuesStr.indexOf("{") !== 0) { valuesStr = `{${valuesStr}}` }
        values = JSON.parse(valuesStr);
      }
      values.__body__ = body;
      this.addTag(tagName, values);
    } catch (e) {
      throw e;
    }
  }

  private parseLabel(body: string): void {
    this.addTag("__label__", { __body__: body });
  }

  private parseSaveMark(body: string): void {
    let p: number = body.indexOf(":");
    if (p !== -1) {
      let name: string = body.substring(0, p);
      let comment: string = body.substring(p);
      this.addTag("__save_mark__", { __body__: body, name: name, comment: comment });
    } else if (body.length > 0) {
      let name: string = `__save_mark_${this.currentLineNum}__`;
      this.addTag("__save_mark__", { __body__: body, name: name, comment: body });
    } else {
      let name: string = `__save_mark_${this.currentLineNum}__`;
      this.addTag("__save_mark__", { __body__: body, name: name, comment: "" });
    }
  }

  private parseJs(body: string): void {
    this.addTag("__js__", { __body__: body, print: false });
  }

  private parseJsPrint(body: string): void {
    this.addTag("__js__", { __body__: body, print: true });
  }

  private parseText(line: string): void {
    for (let i = 0; i < line.length; i++) {
      const ch = line.charAt(i);
      if (ch === "") { continue; }

      if (ch === "$") {
        this.addTag("br", { __body__: line});
      } else {
        this.addTag("ch", { __body__: ch, text: ch});
      }
    }
  }

  private addTag(name: string, values: object) {
    this._tags.push(new Tag(name, values, this.currentLineNum - 1));
    // Logger.debug("ADD TAG: ", name, values)
  }
}
