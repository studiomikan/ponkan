import { Ponkan3 } from '../ponkan3';
import { TagAction, TagActionResult, TagValue } from '../tag-action';

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function(p: Ponkan3): TagAction[] {
  return [
    // ======================================================================
    // マクロ
    // ======================================================================
    /// @category マクロ
    /// @description マクロを定義する
    /// @details
    ///   マクロを定義します。\n
    ///   マクロについての詳細は [マクロを利用する](../macro/) のページを参照にしてください。
    new TagAction(
      ['macro'],
      [
        /// @param マクロの名前
        new TagValue('name', 'string', true, null),
      ],
      (values: any, tick: number): TagActionResult => {
        if (p.resource.hasMacro(values.name)) {
          throw new Error(`${values.name}マクロはすでに登録されています`);
        }
        const m = p.conductor.script.defineMacro(values.name);
        p.resource.macroInfo[values.name] = m;
        return 'continue';
      },
    ),
    /// @category マクロ
    /// @description マクロ定義の終わり
    /// @details
    ///   マクロ定義のl終わりを示します。
    ///   マクロについての詳細は [マクロを利用する](../macro/) のページを参照にしてください。
    new TagAction(
      ['endmacro'],
      [],
      (values: any, tick: number): TagActionResult => {
        throw new Error('マクロ定義エラー。macroとendmacroの対応が取れていません');
        return 'continue';
      },
    ),
  ];
}
/* eslint-enalble @typescript-eslint/no-unused-vars */
