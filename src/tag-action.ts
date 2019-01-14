import { Logger } from './base/logger';
import { Resource } from './base/resource'
import { Tag } from './base/tag'
import { Ponkan3 } from './ponkan3'

export class TagValue {
  public name: string;
  public type: 'number' | 'boolean' | 'string';
  public required: boolean;
  public defaultValue: any;

  public constructor(
    name: string,
    type: 'number' | 'boolean' | 'string',
    required: boolean,
    defaultValue: any = null){
    this.name = name;
    this.type = type;
    this.required = required;
    this.defaultValue = defaultValue;
  }
}

export class TagAction {
  public name: string;
  public comment: string;
  public values: TagValue[];
  public action: (values: any, tick: number) => 'continue' | 'break';
  
  public constructor(
    name: string,
    comment: string,
    values: TagValue[],
    action: (val: any, tick: number) => 'continue' | 'break') {
    this.name = name;
    this.comment = comment;
    this.values = values;
    this.action = action;
  }
}

export function generateTagActions(ponkan: Ponkan3): TagAction[] {
  return [
    new TagAction(
      's',
      'スクリプトの実行を停止する',
      [],
      (values, tick) => {
        ponkan.conductor.stop();
        return 'continue';
      }
    ),
    new TagAction(
      'ch',
      '文字を出力する',
      [
        new TagValue('text', 'string', true)
      ],
      (values, tick) => {
        ponkan.conductor.stop();
        return 'continue';
      }
    ),
    new TagAction(
      'image',
      'レイヤに画像を読み込む',
      [
        new TagValue('lay', 'string', false, 0),
        new TagValue('page', 'string', false, "fore"),
        new TagValue('file', 'string', true),
        new TagValue('visible', 'boolean', false),
      ],
      (values, tick) => {
        ponkan.conductor.stop();
        return 'continue';
      }
    ),
  ];
}

