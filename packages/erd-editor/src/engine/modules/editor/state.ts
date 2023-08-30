import { ValuesType } from '@/internal-types';

export type Editor = {
  selectedMap: Record<string, SelectType>;
  hasUndo: boolean;
  hasRedo: boolean;
};

export const SelectType = {
  table: 'table',
  memo: 'memo',
} as const;
export type SelectType = ValuesType<typeof SelectType>;

export const createEditor = (): Editor => ({
  selectedMap: {},
  hasUndo: false,
  hasRedo: false,
});