import { Resource } from './base/resource';
import { Tag } from './base/tag';
import { Ponkan3 } from './ponkan3';

export type TagValueType =
  | 'number'
  | 'boolean'
  | 'string'
  | 'array'
  | 'object'
  | 'function'
  | 'string|function'
  | 'number|array';

export class TagValue {
  public readonly name: string;
  public readonly type: TagValueType;
  public readonly required: boolean;
  public readonly defaultValue: any;

  public constructor(name: string, type: TagValueType, required: boolean, defaultValue: any) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.defaultValue = defaultValue;
  }
}

export type TagActionResult = 'continue' | 'break';

export class TagAction {
  public readonly names: string[];
  public readonly values: TagValue[];
  public readonly action: (values: any, tick: number) => TagActionResult;

  public constructor(names: string[], values: TagValue[], action: (val: any, tick: number) => TagActionResult) {
    this.names = names;
    this.values = values;
    this.action = action;
  }
}

/**
 * エンティティを適用する
 */
export function applyJsEntity(resource: Resource, values: any): void {
  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      const value: string = ('' + values[key]) as string;
      if (value.indexOf('&') === 0 && value.length >= 2) {
        const js: string = value.substring(1);
        values[key] = resource.evalJs(js);
      }
    }
  }
}

/**
 * タグの値を正しい値にキャストする。
 * tagの値をそのまま変更するため、事前にcloneしたものにしておくこと。
 * @param tag タグ
 * @param tagAction タグ動作定義
 */
export function castTagValues(tag: Tag, tagAction: TagAction): void {
  tagAction.values.forEach((def: TagValue) => {
    const value: any = tag.values[def.name];
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value !== def.type) {
      const str: string = '' + value;
      switch (def.type) {
        case 'number':
          tag.values[def.name] = +str;
          if (isNaN(tag.values[def.name])) {
            throw new Error(`${tag.name}タグの${def.name}を数値に変換できませんでした(${str})`);
          }
          break;
        case 'boolean':
          tag.values[def.name] = str === 'true';
          break;
        case 'string':
          tag.values[def.name] = str;
          break;
        case 'function':
          tag.values[def.name] = value;
          break;
        case 'string|function':
          if (typeof value === 'string') {
            tag.values[def.name] = str;
          } else {
            tag.values[def.name] = value;
          }
          break;
        case 'number|array':
          if (typeof value === 'number') {
            tag.values[def.name] = +str;
            if (isNaN(tag.values[def.name])) {
              throw new Error(`${tag.name}タグの${def.name}を数値に変換できませんでした(${str})`);
            }
          } else {
            tag.values[def.name] = value;
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            throw new Error(`${tag.name}タグの${def.name}は配列である必要があります`);
          }
          tag.values[def.name] = value;
          break;
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`${tag.name}タグの${def.name}はオブジェクトである必要があります`);
          }
          tag.values[def.name] = value;
          break;
      }
    }
  });
}

import animation from './tag-actions/animation';
import button from './tag-actions/button';
import history from './tag-actions/history';
import layerfilter from './tag-actions/layerfilter';
import layer from './tag-actions/layer';
import macro from './tag-actions/macro';
import message from './tag-actions/message';
import save from './tag-actions/save';
import script from './tag-actions/script';
import sound from './tag-actions/sound';
import system from './tag-actions/system';
import trans from './tag-actions/trans';
import video from './tag-actions/video';

export function generateTagActions(p: Ponkan3): TagAction[] {
  return new Array<TagAction>()
    .concat(system(p))
    .concat(script(p))
    .concat(macro(p))
    .concat(message(p))
    .concat(layer(p))
    .concat(button(p))
    .concat(animation(p))
    .concat(layerfilter(p))
    .concat(sound(p))
    .concat(trans(p))
    .concat(history(p))
    .concat(video(p))
    .concat(save(p));
}
