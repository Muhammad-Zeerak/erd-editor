import { CanvasCommandMap } from './canvas.cmd';
import { MemoCommandMap } from './memo.cmd';
import { TableCommandMap } from './table.cmd';
import { ColumnCommandMap } from './column.cmd';
import { EditorCommandMap } from './editor.cmd';
import { RelationshipCommandMap } from './relationship.cmd';
import { IndexCommandMap } from './index.cmd';
import * as CanvasCommand from './canvas.cmd.helper';
import * as MemoCommand from './memo.cmd.helper';
import * as TableCommand from './table.com.helper';
import * as ColumnCommand from './column.cmd.helper';
import * as EditorCommand from './editor.cmd.helper';
import * as RelationshipCommand from './relationship.cmd.helper';
import * as IndexCommand from './index.cmd.helper';

export interface CommandMap
  extends CanvasCommandMap,
    MemoCommandMap,
    TableCommandMap,
    ColumnCommandMap,
    EditorCommandMap,
    RelationshipCommandMap,
    IndexCommandMap {}

export type CommandKey = keyof CommandMap;

export interface CommandType<K extends CommandKey> {
  name: K;
  data: CommandMap[K];
  timestamp: number;
}

export interface CommandTypeAny {
  name: string;
  data: any;
  timestamp: number;
}

export type CommandTypeAll = CommandType<CommandKey>;

export type RecursionGenerator<T> = Generator<T | RecursionGenerator<T>>;

export type BatchCommand<T = CommandTypeAll> = Array<T | RecursionGenerator<T>>;

export interface Command {
  canvas: typeof CanvasCommand;
  memo: typeof MemoCommand;
  table: typeof TableCommand;
  column: typeof ColumnCommand;
  editor: typeof EditorCommand;
  relationship: typeof RelationshipCommand;
  index: typeof IndexCommand;
}