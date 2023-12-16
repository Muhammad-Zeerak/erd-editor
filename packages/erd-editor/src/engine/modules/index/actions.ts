import { Reducer } from '@dineug/r-html';

import { EngineContext } from '@/engine/context';
import { RootState } from '@/engine/state';
import { ValuesType } from '@/internal-types';

export const ActionType = {
  addIndex: 'index.add',
  removeIndex: 'index.remove',
  changeIndexName: 'index.changeName',
  changeIndexUnique: 'index.changeUnique',
} as const;
export type ActionType = ValuesType<typeof ActionType>;

export type ActionMap = {
  [ActionType.addIndex]: {
    id: string;
    tableId: string;
  };
  [ActionType.removeIndex]: {
    id: string;
  };
  [ActionType.changeIndexName]: {
    id: string;
    tableId: string;
    value: string;
  };
  [ActionType.changeIndexUnique]: {
    id: string;
    tableId: string;
    value: boolean;
  };
};

export type ReducerType<T extends keyof ActionMap> = Reducer<
  RootState,
  T,
  ActionMap,
  EngineContext
>;
