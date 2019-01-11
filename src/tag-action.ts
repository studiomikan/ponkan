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

export function generateTagActions(pon: Ponkan3): TagAction[] {
  return [
    new TagAction(
      's',
      'スクリプトの実行を停止する',
      [],
      (values, tick) => {
        pon.conductor.stop();
        return 'continue';
      }
    ),
    new TagAction(
      'ch',
      '文字を出力する',
      [ new TagValue('text', 'string', false) ],
      (values, tick) => {
        pon.conductor.stop();
        return 'continue';
      }
    ),
  ];
}

