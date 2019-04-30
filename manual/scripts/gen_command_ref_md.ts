import { applyJsEntity, castTagValues, generateTagActions, TagAction, TagValue } from "../../src/ts/tag-action";
let tagActions = (generateTagActions as any)({});
// console.log(tagActions);

// グループごとに分ける
let grouped: any = {};
tagActions.forEach((ta: TagAction) => {
  if (grouped[ta.group] == null) {
    grouped[ta.group] = [];
  }
  grouped[ta.group].push(ta);
});
let groupNames: string[] = Object.keys(grouped);
console.log(groupNames);

let md = "# コマンドリファレンス";

// 一覧表
let tableMD = `## コマンド一覧`
groupNames.forEach((groupName: string) => {
  tableMD += `\n### ${groupName}\n\n`;
  tableMD += `| コマンド名 | 内容 |\n`;
  tableMD += `|------------|------|\n`;

  let actions: TagAction[] = grouped[groupName];
  actions.forEach((action) => {
    tableMD += `| ${action.names.join(', ')} | ${action.comment} |\n`;
  });
});
md += tableMD;





console.log(md);

