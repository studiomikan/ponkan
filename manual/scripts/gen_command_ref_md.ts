import { applyJsEntity, castTagValues, generateTagActions, TagAction, TagValue } from "../../src/ts/tag-action";
let tagActions = (generateTagActions as any)({});

// グループごとに分ける
let grouped: any = {};
tagActions.forEach((ta: TagAction) => {
  if (grouped[ta.group] == null) {
    grouped[ta.group] = [];
  }
  grouped[ta.group].push(ta);
});
let groupNames: string[] = Object.keys(grouped);

let md = "# コマンドリファレンス\n";
md += `
Ponkan3 のスクリプトで使用できる全てのコマンドの解説です。

コマンドの中には、長いコマンドをタイプする手間を省くため、別名が設けられているものがあります。
たとえば \`startautomode\` と \`startauto\` と \`auto\` は名前は異なりますが全て同じ動作をします。

`;

// 一覧表
md += `## コマンド一覧\n`
groupNames.forEach((groupName: string) => {
  md += `\n### ${groupName}\n\n`;
  md += `| コマンド名 | 内容 |\n`;
  md += `|------------|------|\n`;

  let actions: TagAction[] = grouped[groupName];
  actions.forEach((action) => {
    // md += `| ${action.names.join(', ')} | ${action.comment} |\n`;
    md += `| [${action.names.join(', ')}](#${action.names.join('-')}) | ${action.comment} |\n`;
  });
});
md += "\n";

// コマンド詳細
groupNames.forEach((groupName: string) => {
  md += `## ${groupName}\n\n`;

  let actions: TagAction[] = grouped[groupName];
  actions.forEach((action) => {
    md += `### ${action.names.join(', ')} \n\n${action.comment}\n\n`;
    // md += `### ${action.names.join(', ')}\n`;
    // md += `${action.comment})\n\n`;

    if (action.values.length > 0) {
      md += `| パラメータ名 | 値の種類 | 必須 | デフォルト値 | 説明 |\n`;
      md += `|--------------|----------|------|--------------|------|\n`;
      action.values.forEach((value: TagValue) => {
        let required: string = value.required ? "○" : "";
        let defaultValue: string;
        if (value.defaultValue == null) {
          defaultValue = "";
        } else {
          defaultValue = value.defaultValue;
          if (typeof defaultValue === "string") {
            defaultValue = `"${defaultValue}"`;
          }
        }
        let comment : string = value.comment.split("\n").map(s => s.trim()).join("\n").replace(/\|/g, "\\|");
        md += `| ${value.name} | ${value.type} | ${required} | ${defaultValue} | ${comment} |\n`;
      });
      md += "\n";
    }

    let description: string = action.description;
    md += description.split("\n").map(s => s.trim()).join("\n");
    md += "\n";
  });
});
md += "\n\n";


console.log(md);

