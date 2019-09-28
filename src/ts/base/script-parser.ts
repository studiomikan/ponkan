import { Logger } from "./logger";
import { Resource } from "./resource";
import { Tag } from "./tag";

export class ScriptParser {
  private resource: Resource;
  private scriptText: string;
  private lines: string[] = [];
  private currentLineNum: number = 0;
  private saveMarkCount: number = 0;
  private _tags: Tag[] = [];

  public get tags(): Tag[] { return this._tags; }

  public constructor(resource: Resource, scriptText: string) {
    this.resource = resource;
    this.scriptText = scriptText;
    this.currentLineNum = 0;
    this.saveMarkCount = 0;
    this.lines = this.scriptText.split(/\n/g);
    this.parse();
  }

  public debugPrint(): void {
    this.tags.forEach((tag) => {
      tag.debugPrint();
    });
  }

  private getLine(): string | null {
    if (this.currentLineNum < this.lines.length) {
      return this.lines[this.currentLineNum++].replace(/^[ \t]+|[ \t]+$/g, "");
    } else {
      return null;
    }
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
      if (line === "") {
        if (this.currentLineNum < this.lines.length) {
          this.addLinebreak();
        }
        continue;
      }

      const ch0 = line.charAt(0);
      const body = line.substring(1).trim();
      // Logger.debug("line: ", ch0, body);

      if (line === "---") {
        // JavaScript部
        let js: string = "";
        while (true) {
          const tmp: string | null = this.getLineWithoutTrim();
          if (tmp === null || tmp.trim() === "---") { break; }
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
          case "~":
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
      const reg = /[{ ]/.exec(body);
      if (reg == null) {
        tagName = body.substring(0).trim();
        values = {};
      } else {
        tagName = body.substring(0, reg.index).trim();
        valuesStr = body.substring(reg.index).trim();
        if (valuesStr.indexOf("{") !== 0) {
          // { を省略しているとき
          valuesStr = `{${valuesStr}}`;
        } else {
          // { を省略していないとき
          while (valuesStr.charAt(valuesStr.length - 1) !== "}") {
            const line: string | null = this.getLine();
            if (line === null) { break; }
            valuesStr += " " + line.trim();
          }
        }
        // values = JSON.parse(valuesStr);
        values = this.resource.evalJs(`(${valuesStr})`);
      }
      values.__body__ = body;
      this.addTag(tagName, values);
    } catch (e) {
      Logger.error(e);
      console.error(body);
      throw new Error(`コマンド行の文法エラーです(行:${this.currentLineNum})`);
    }
  }

  private parseLabel(body: string): void {
    this.addTag("__label__", { __body__: body });
  }

  private parseSaveMark(body: string): void {
    const p: number = body.indexOf("|");
    if (p !== -1) {
      const name: string = body.substring(0, p);
      const comment: string = body.substring(p + 1);
      this.addTag("__save_mark__", { __body__: body, name, comment });
    } else if (body.length > 0) {
      const name: string = `__save_mark_${this.saveMarkCount}__`;
      this.addTag("__save_mark__", { __body__: body, name, comment: body });
    } else {
      const name: string = `__save_mark_${this.saveMarkCount}__`;
      this.addTag("__save_mark__", { __body__: body, name, comment: "" });
    }
    this.saveMarkCount++;
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
      this.addTag("ch", { __body__: ch, text: ch});
    }
    this.addLinebreak(); // 最後に改行を付与
  }

  private addLinebreak(): void {
    this.addTag("__line_break__", { __body__: "\n" });
  }

  private addTag(name: string, values: object) {
    this._tags.push(new Tag(name, values, this.currentLineNum - 1));
    // Logger.debug("ADD TAG: ", name, values)
  }
}
