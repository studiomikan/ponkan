const fs = require('fs');

class TsFileParser {
  constructor(fileString) {
    this.lines = fileString.split(/\n|\r\n/);
    this.tagInfo = {};
    this.tagNameList = [];
    this.tagList = [];
  }

  parse() {
    this.parseTagAction();
    this.parseTagValue();

    // tagNameListの順に並べ替える
    this.tagNameList.forEach((name) => {
      this.tagList.push(this.tagInfo[name]);
    });
  }

  parseTagValue() {
    let lines = this.lines;

    let currentTagName = "";
    let values = [];
    let value = "";

    lines.forEach((line, index) => {
      // タグ名が来たとき
      if (line.match(/new TagAction\(/)) {
        let tagNameStr = lines[index + 1];
        if (tagNameStr.endsWith(",")) {
          tagNameStr = tagNameStr.substring(0, tagNameStr.length - 1);
        }
        let tagNames = eval(tagNameStr);
        if (currentTagName !== "") {
          this.tagInfo[currentTagName].paramsList = values;
        }
        currentTagName = tagNames[0];
        values = [];
      }

      let paramLineMatch = line.match(/\/\/\/.*@param(.*)/);
      let paragraphMatch = line.match(/\/\/\/ (.*)/);
      let tagValueMatch = line.match(/new TagValue\(\"([^"]+)\"/);
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
        values.push({ 
          name: valueName,
          description: value
        });
      }
    });
  }

  parseTagAction() {
    let lines = this.lines;

    let currentParamName = "";
    let values = {};

    lines.forEach((line, index) => {
      let mbody  = line.match(/\/\/\/(.+)/);
      if (mbody != null) {
        let body = mbody[1];
        let p = "";
        let v = "";
        let mparam = body.match(/@([^ ]+)(.*)/);
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
        let tagNames = eval(tagNameStr);
        // console.log("tagNameStr: ", tagNames, values);
        values.tagNames = tagNames;
        values.paramsList = [];
        this.tagInfo[tagNames[0]] = values;
        this.tagNameList.push(tagNames[0]);
        values = {};
        currentParamName = "";
      }
    });
  }

  genCategories() {
    // カテゴリのリストを取得
    let categories = [];
    this.tagList.forEach((tag) => {
      if (!categories.includes(tag.category)) {
        categories.push(tag.category);
      }
    });
    return categories;
  }

  printMd() {
    // カテゴリごとに処理
    const categories = this.genCategories();
    console.log(categories);
    categories.forEach((c) => {
      this.printMdCategory(c);
    });
  }

  printMdCategory(category) {
    let target = this.tagList.filter(tag => tag.category == category)
    target.forEach((tag) => {
      this.printMdTag(tag);
    });
  }

  printMdTag(tag) {
    // console.log(tag);

    let md = "";

    md += `### ${tag.tagNames.join(', ')} | ${tag.description}\n\n`;
    md += `${tag.details}\n`;

    // md += `| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |\n`;
    // md += `|--------------|----------|------|--------------|------|\n`;

    if (tag.paramsList.length > 0) {
      md += "\n";
      md += `| パラメータ名 | 説明 |\n`;
      md += `|--------------|------|\n`;
      tag.paramsList.forEach((param) => {
        md += `| ${param.name} | ${param.description} |\n`;
      })
    }

    console.log(md);
  }

}

let fileString = fs.readFileSync("./src/ts/tag-action.ts", "utf8");
let tsFileParser = new TsFileParser(fileString);
tsFileParser.parse();
// console.log(tsFileParser.tagInfo);
tsFileParser.printMd();


// let tagActions = (generateTagActions as any)({});

// // tagActionsの情報をグループごとに分ける
// let grouped = {};
// tagActions.forEach((ta: TagAction) => {
//   if (grouped[ta.group] == null) {
//     grouped[ta.group] = [];
//   }
//   grouped[ta.group].push(ta);
// });
// let groupNames = Object.keys(grouped);

// let md = "# コマンドリファレンス\n";
// md += `
// Ponkan3 のスクリプトで使用できる全てのコマンドの解説です。

// コマンドの中には、長いコマンドをタイプする手間を省くため、別名が設けられているものがあります。
// たとえば \`startautomode\` と \`startauto\` と \`auto\` は名前は異なりますが全て同じ動作をします。

// `;

// // 一覧表
// md += `## コマンド一覧\n`
// groupNames.forEach((groupName) => {
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
// groupNames.forEach((groupName) => {
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
//         let required = value.required ? "○" : "";
//         let defaultValue;
//         if (value.defaultValue == null) {
//           defaultValue = "";
//         } else {
//           defaultValue = value.defaultValue;
//           if (typeof defaultValue === "string") {
//             defaultValue = `"${defaultValue}"`;
//           }
//         }
//         let comment = value.comment.split("\n").map(s => s.trim()).join("\n").replace(/\|/g, "\\|");
//         md += `| ${value.name} | ${value.type} | ${required} | ${defaultValue} | ${comment} |\n`;
//       });
//       md += "\n";
//     }

//     let description = action.description;
//     md += description.split("\n").map(s => s.trim()).join("\n");
//     md += "\n";
//   });
// });
// md += "\n\n";


// // console.log(md);

