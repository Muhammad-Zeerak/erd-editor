import { Reducer } from '@dineug/r-html';

import { EngineContext } from '@/engine/context';
import { RootState } from '@/engine/state';
import { ValuesType } from '@/internal-types';

export const ActionType = {
  addTable: 'table.add',
  moveTable: 'table.move',
  removeTable: 'table.remove',
  changeTableName: 'table.changeName',
  changeTableComment: 'table.changeComment',
  changeTableColor: 'table.changeColor',
} as const;
export type ActionType = ValuesType<typeof ActionType>;

export type ActionMap = {
  [ActionType.addTable]: {
    id: string;
    ui: {
      x: number;
      y: number;
      zIndex: number;
    };
  };
  [ActionType.moveTable]: {
    movementX: number;
    movementY: number;
    ids: string[];
  };
  [ActionType.removeTable]: {
    id: string;
  };
  [ActionType.changeTableName]: {
    id: string;
    value: string;
  };
  [ActionType.changeTableComment]: {
    id: string;
    value: string;
  };
  [ActionType.changeTableColor]: {
    ids: string[];
    color: string;
  };
};

export type ReducerType<T extends keyof ActionMap> = Reducer<
  RootState,
  T,
  ActionMap,
  EngineContext
>;
