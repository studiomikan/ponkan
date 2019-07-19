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
      let tagValueMatch = line.match(/new TagValue\(\"([^"]+)\", \"([^,"]+)\",([^,]+),([^,`]+)/);
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
        let type = tagValueMatch[2].trim();
        let required = tagValueMatch[3].trim();
        let defaultValue = tagValueMatch[4].trim();
        values.push({ 
          name: valueName,
          type: type.trim(),
          required: required == "true" ? "〇" : "",
          defaultValue: defaultValue == "null" ? "" : "`" + defaultValue + "`",
          description: value,
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
    const categories = this.genCategories();

    this.printMdHeadetText();
    this.printMdTableOfContents(categories);
    categories.forEach((c) => {
      this.printMdCategory(c);
    });
  }

  printMdHeadetText() {
    let md = "# コマンドリファレンス\n\n" +
             "Ponkan3 のスクリプトで使用できる全てのコマンドの解説です。\n" +
             "\n" +
             "コマンドの中には、長いコマンドをタイプする手間を省くため、別名が設けられているものがあります。\n" +
             "たとえば `startautomode` と `startauto` と `auto` は名前は異なりますが全て同じ動作をします。\n" +
             "\n";
    console.log(md);
  }

  printMdTableOfContents(categories) {
    let md = "";
    md += "## コマンド一覧\n\n";

    categories.forEach((category) => {
      md += `### ${category}\n\n`;
      md += "| コマンド名 | 内容 |\n";
      md += "|------------|------|\n";
      this.tagList.filter(tag => tag.category == category).forEach((tag) => {
        md += `| [${tag.tagNames.join(', ')}](#${tag.tagNames.join("-")}) | ${tag.description} |\n`;
      });;
      md += "\n";
    });
    console.log(md);
  }

  printMdCategory(category) {
    let md = "";
    md += `## ${category}\n\n`;
    console.log(md);

    this.tagList.filter(tag => tag.category == category).forEach((tag) => {
      this.printMdTag(tag);
    });
  }

  printMdTag(tag) {
    // console.log(tag);
    let typeMap = {
      "number": "数値(Number)",
      "boolean": "真偽値(Boolean)",
      "string": "文字列(String)",
      "array": "配列(Array)",
      "object": "オブジェクト(Object)",
    }

    let md = "";

    md += `### ${tag.tagNames.join(', ')}\n\n`;
    md += `${tag.description}\n\n`;

    if (tag.paramsList.length > 0) {
      md += `| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |\n`;
      md += `|--------------|----------|------|--------------|------|\n`;
      tag.paramsList.forEach((param) => {
        md += `| ${param.name} | ${typeMap[param.type]} | ${param.required} | ${param.defaultValue} | ${param.description} |\n`;
      })
    }
    md += `\n`;

    md += `${tag.details}\n`;

    console.log(md);
  }

}

let fileString = fs.readFileSync("./src/ts/tag-action.ts", "utf8");
let tsFileParser = new TsFileParser(fileString);
tsFileParser.parse();
tsFileParser.printMd();