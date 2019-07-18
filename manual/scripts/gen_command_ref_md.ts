import { applyJsEntity, castTagValues, generateTagActions, TagAction, TagValue } from "../../src/ts/tag-action";
import * as fs from 'fs';
import { parse } from "url";

class TsFileParser {
  private fileString: string;
  private lines: string[];

  private tagInfo: any = {};

  constructor() {
    this.fileString = fs.readFileSync("./src/ts/tag-action.ts", "utf8");
    this.lines = this.fileString.split(/\n|\r\n/);
    this.parseTagAction();
    // this.parseTagValue();
    console.log(this.tagInfo);
  }

  private parseTagValue() {
    let lines: string[] = this.lines;

    let currentTagName = "";
    let values: any = {};
    let value: string = "";

    lines.forEach((line: string, index: number) => {
      // タグ名が来たとき
      if (line.match(/new TagAction\(/)) {
        let tagNameStr = lines[index + 1];
        if (tagNameStr.endsWith(",")) {
          tagNameStr = tagNameStr.substring(0, tagNameStr.length - 1);
        }
        let tagNames: string[] = eval(tagNameStr) as string[];
        if (currentTagName !== "") {
          this.tagInfo[currentTagName].paramsInfo = values;
        }
        currentTagName = tagNames[0];
        values = { hoge: 100 };
      }

      let paramLineMatch : RegExpMatchArray | null = line.match(/\/\/\/.*@param (.*)/);
      let paragraphMatch: RegExpMatchArray | null = line.match(/\/\/\/ (.*)/);
      let tagValueMatch: RegExpMatchArray | null = line.match(/new TagValue\(\"([^"]+)\"/);
      if (paramLineMatch != null) {
        // @paramの開始
        value = paramLineMatch[1].trim();
      } else if (paragraphMatch != null) {
        // paramの続き
        if (value !== "") {
          value += "\n";
        }
        value += paragraphMatch[1].trim();
      } else if (tagValueMatch != null) {
        // new TagValue
        let valueName = tagValueMatch[1];
        values[valueName] = "hogehgoe" + value;
      }

    });
  }

  private parseTagAction() {
    let lines: string[] = this.lines;

    let currentParamName: string = "";
    let values: any = {};

    lines.forEach((line: string, index: number) => {
      let mbody: RegExpMatchArray | null = line.match(/\/\/\/(.+)/);
      if (mbody != null) {
        let body: string = mbody[1];
        let p: string = "";
        let v: string = "";
        let mparam: RegExpMatchArray | null = body.match(/@([^ ]+)(.*)/);
        if (mparam != null) {
          p = mparam[1].trim();
          v = mparam[2].trim();
        } else {
          v = body.substring(body.indexOf("///")).trim();
        }
        if (p !== "" && p !== "param") {
          values[p] = v;
          currentParamName = p;
        } else if (currentParamName !== "") {
          if (values[currentParamName] !== "") {
            values[currentParamName] += "\n";
          }
          values[currentParamName] += v;
        }
        // console.log("tagNameStr: ", tagNameStr);
      }
      // タグ名が来たとき
      if (line.match(/new TagAction\(/)) {
        let tagNameStr = lines[index + 1];
        if (tagNameStr.endsWith(",")) {
          tagNameStr = tagNameStr.substring(0, tagNameStr.length - 1);
        }
        let tagNames: string[] = eval(tagNameStr) as string[];
        // console.log("tagNameStr: ", tagNames, values);
        values.tagNames = tagNames;
        values.paramsInfo = {};
        this.tagInfo[tagNames[0]] = values;
        values = {};
        currentParamName = "";
      }
    });
  }
}

let tsFileParser = new TsFileParser();
// let tagActions = (generateTagActions as any)({});

// // tagActionsの情報をグループごとに分ける
// let grouped: any = {};
// tagActions.forEach((ta: TagAction) => {
//   if (grouped[ta.group] == null) {
//     grouped[ta.group] = [];
//   }
//   grouped[ta.group].push(ta);
// });
// let groupNames: string[] = Object.keys(grouped);

// let md = "# コマンドリファレンス\n";
// md += `
// Ponkan3 のスクリプトで使用できる全てのコマンドの解説です。

// コマンドの中には、長いコマンドをタイプする手間を省くため、別名が設けられているものがあります。
// たとえば \`startautomode\` と \`startauto\` と \`auto\` は名前は異なりますが全て同じ動作をします。

// `;

// // 一覧表
// md += `## コマンド一覧\n`
// groupNames.forEach((groupName: string) => {
//   md += `\n### ${groupName}\n\n`;
//   md += `| コマンド名 | 内容 |\n`;
//   md += `|------------|------|\n`;

//   let actions: TagAction[] = grouped[groupName];
//   actions.forEach((action) => {
//     // md += `| ${action.names.join(', ')} | ${action.comment} |\n`;
//     md += `| [${action.names.join(', ')}](#${action.names.join('-')}) | ${action.comment} |\n`;
//   });
// });
// md += "\n";

// // コマンド詳細
// groupNames.forEach((groupName: string) => {
//   md += `## ${groupName}\n\n`;

//   let actions: TagAction[] = grouped[groupName];
//   actions.forEach((action) => {
//     md += `### ${action.names.join(', ')} \n\n${action.comment}\n\n`;
//     // md += `### ${action.names.join(', ')}\n`;
//     // md += `${action.comment})\n\n`;

//     if (action.values.length > 0) {
//       md += `| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |\n`;
//       md += `|--------------|----------|------|--------------|------|\n`;
//       action.values.forEach((value: TagValue) => {
//         let required: string = value.required ? "○" : "";
//         let defaultValue: string;
//         if (value.defaultValue == null) {
//           defaultValue = "";
//         } else {
//           defaultValue = value.defaultValue;
//           if (typeof defaultValue === "string") {
//             defaultValue = `"${defaultValue}"`;
//           }
//         }
//         let comment: string = value.comment.split("\n").map(s => s.trim()).join("\n").replace(/\|/g, "\\|");
//         md += `| ${value.name} | ${value.type} | ${required} | ${defaultValue} | ${comment} |\n`;
//       });
//       md += "\n";
//     }

//     let description: string = action.description;
//     md += description.split("\n").map(s => s.trim()).join("\n");
//     md += "\n";
//   });
// });
// md += "\n\n";


// // console.log(md);

