// /**
//  * 色を "rgb(r,g,b)" の文字列に変換する
//  * @param color 色
//  */
// export function toRgb(color: number | string): string {
//   let r = 0;
//   let g = 0;
//   let b = 0;
//   switch (typeof color) {
//     case "string":
//       r = +("0x" + (color as string).substr(1, 2));
//       g = +("0x" + (color as string).substr(3, 2));
//       b = +("0x" + (color as string).substr(5, 2));
//       break;
//     case "number":
//       // tslint:disable
//       r = Math.floor((color & 0xff0000) / 0x10000);
//       g = Math.floor((color & 0x00ff00) / 0x100);
//       b = Math.floor(color & 0x0000ff);
//       // tslint:enable
//       break;
//   }
//   return `rgb(${r},${g},${b})`;
// }

/**
 * オブジェクトを拡張する
 * @param base 拡張先オブジェクト
 * @param obj 拡張元オブジェクト
 * @return オブジェクト
 */
export function objExtend(base: any, obj: any): any {
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      base[key] = obj[key].slice();
    } else if (typeof obj[key] === "object") {
      base[key] = Object.assign({}, obj[key]);
    } else {
      base[key] = obj[key];
    }
  });
  return base;
}

/**
 * オブジェクトを複製する（シャローコピー）
 * @param obj 複製するオブジェクト
 * @return 複製のオブジェクト
 */
export function objClone(obj: any): any {
  return objExtend({}, obj);
}

export function objSort(obj: any): any {
  if (obj == null || typeof obj !== "object") {
    return obj;
  }
  const dest: any = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      dest[key] = obj[key];
    });
  return obj;
}

export function objEquals(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  const aJson: string = JSON.stringify(objSort(a));
  const bJson: string = JSON.stringify(objSort(b));
  return aJson === bJson;
}

// /**
//  * 文字列中のHTMLをエスケープする
//  * @param html HTML文字列
//  * @return エスケープされた文字列
//  */
// export function escapeHtml(html: string): string {
//   return html
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");
// }

export const Ease = {
  /**
   * 緩やかに開始する（2次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  in(phase: number): number {
    return phase * phase;
  },

  /**
   * 緩やかに停止する（2次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  out(phase: number): number {
    return phase * (2 - phase);
  },

  /**
   * 緩やかに開始・終了する（3次関数補間）
   * @param phase フェーズ（0～1の値）
   * @return 補正後のフェーズ（0～1の値）
   */
  inOut(phase: number): number {
    // v(t) = -2t^3 + 3t^2 = t^2(3-2t)
    return phase * phase * (3 - 2 * phase);
  },
};
