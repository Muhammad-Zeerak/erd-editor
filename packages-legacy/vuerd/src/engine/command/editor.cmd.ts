import { parserV2 } from '@dineug/erd-editor-schema';

import { cloneDeep, getData, isObject } from '@/core/helper';
import { validStartRelationship } from '@/engine/store/helper/valid.helper';
import { ExecuteCommand } from '@/internal-types/command';
import {
  CopyColumn,
  DrawRelationship,
  DrawStartAddRelationship,
  DrawStartRelationship,
  EditorCommandMap,
  FocusColumn,
  FocusMoveTable,
  FocusTable,
  HasUndoRedo,
  LoadJson,
  ReadonlyEditor,
} from '@@types/engine/command/editor.cmd';
import { State } from '@@types/engine/store';
import { DraggableColumn, Viewport } from '@@types/engine/store/editor.state';
import { Memo } from '@@types/engine/store/memo.state';
import { Relationship } from '@@types/engine/store/relationship.state';
import { Index, PureTable } from '@@types/engine/store/table.state';

import { executeFilterCommandMap } from './editor/filter.cmd';
import {
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
} from './helper/editor.focus.helper';
import {
  appendSelectColumns,
  appendSelectRangeColumns,
  selectRangeColumns,
} from './helper/editor.helper';
import { executeLoadIndex } from './index.cmd';
import { executeLoadMemo } from './memo.cmd';
import { executeLoadRelationship } from './relationship.cmd';
import { executeLoadTable } from './table.cmd';

export function executeHasUndoRedo({ editorState }: State, data: HasUndoRedo) {
  editorState.hasUndo = data.hasUndo;
  editorState.hasRedo = data.hasRedo;
}

export function executeFocusTable(
  { editorState, tableState: { tables } }: State,
  data: FocusTable
) {
  if (editorState.focusTable?.table.id === data.tableId && data.focusType) {
    editorState.focusTable.focusType = data.focusType;
    editorState.focusTable.columnId = null;
    editorState.focusTable.prevSelectColumnId = null;
    editorState.focusTable.selectColumnIds = [];
  } else if (data.focusType) {
    const table = getData(tables, data.tableId);
    if (!table) return;

    editorState.focusTable = {
      table,
      focusType: data.focusType,
      columnId: null,
      prevSelectColumnId: null,
      selectColumnIds: [],
      edit: false,
    };
  } else if (editorState.focusTable?.table.id !== data.tableId) {
    const table = getData(tables, data.tableId);
    if (!table) return;

    editorState.focusTable = {
      table,
      focusType: 'tableName',
      columnId: null,
      prevSelectColumnId: null,
      selectColumnIds: [],
      edit: false,
    };
  }
}

export function executeFocusColumn(
  { editorState, tableState: { tables } }: State,
  data: FocusColumn
) {
  if (editorState.focusTable?.table.id === data.tableId) {
    const focusTable = editorState.focusTable;
    focusTable.columnId = data.columnId;
    focusTable.focusType = data.focusType;

    if (data.ctrlKey && data.shiftKey) {
      focusTable.selectColumnIds = appendSelectRangeColumns(
        focusTable.table.columns,
        focusTable.selectColumnIds,
        focusTable.prevSelectColumnId,
        focusTable.columnId
      );
    } else if (data.shiftKey) {
      focusTable.selectColumnIds = selectRangeColumns(
        focusTable.table.columns,
        focusTable.prevSelectColumnId,
        focusTable.columnId
      );
    } else if (data.ctrlKey) {
      focusTable.selectColumnIds = appendSelectColumns(
        focusTable.selectColumnIds,
        data.columnId
      );
    } else {
      focusTable.selectColumnIds = [data.columnId];
    }

    focusTable.prevSelectColumnId = data.columnId;
  } else {
    const table = getData(tables, data.tableId);
    if (!table) return;

    editorState.focusTable = {
      table,
      focusType: data.focusType,
      columnId: data.columnId,
      prevSelectColumnId: data.columnId,
      selectColumnIds: [data.columnId],
      edit: false,
    };
  }
}

export function executeFocusTableEnd({ editorState }: State) {
  editorState.focusTable = null;
}

export function executeFocusMoveTable(state: State, data: FocusMoveTable) {
  const { editorState } = state;
  if (!editorState.focusTable) return;
  editorState.focusTable.edit = false;

  switch (data.moveKey) {
    case 'ArrowUp':
      arrowUp(state, data);
      break;
    case 'ArrowDown':
      arrowDown(state, data);
      break;
    case 'ArrowLeft':
      arrowLeft(state, data);
      break;
    case 'ArrowRight':
      arrowRight(state, data);
      break;
    case 'Tab':
      data.shiftKey ? arrowLeft(state, data) : arrowRight(state, data);
      break;
  }
}

export function executeEditTable({ editorState: { focusTable } }: State) {
  if (!focusTable) return;
  focusTable.edit = true;
}

export function executeEditTableEnd({ editorState: { focusTable } }: State) {
  if (!focusTable) return;
  focusTable.edit = false;
}

export function executeSelectAllColumn({ editorState: { focusTable } }: State) {
  if (!focusTable) return;
  focusTable.selectColumnIds = focusTable.table.columns.map(
    column => column.id
  );
}

export function executeDrawStartRelationship(
  { editorState }: State,
  data: DrawStartRelationship
) {
  editorState.drawRelationship = {
    relationshipType: data.relationshipType,
    start: null,
    end: {
      x: 0,
      y: 0,
    },
  };
}

export function executeDrawStartAddRelationship(
  { tableState: { tables }, editorState: { drawRelationship } }: State,
  data: DrawStartAddRelationship
) {
  if (!drawRelationship) return;

  const table = getData(tables, data.tableId);
  if (!table) return;

  drawRelationship.start = {
    table,
    x: table.ui.left,
    y: table.ui.top,
  };
}

export function executeDrawEndRelationship({ editorState }: State) {
  editorState.drawRelationship = null;
}

export function executeDrawRelationship(
  {
    editorState: { drawRelationship },
    canvasState: { scrollLeft, scrollTop },
  }: State,
  data: DrawRelationship
) {
  if (!drawRelationship?.start) return;

  drawRelationship.end.x = data.x - scrollLeft;
  drawRelationship.end.y = data.y - scrollTop;
}

export function executeDraggableColumn(
  { editorState }: State,
  data: DraggableColumn
) {
  editorState.draggableColumn = data;
}

export function executeDraggableColumnEnd({ editorState }: State) {
  editorState.draggableColumn = null;
}

export function executeLoadJson(state: State, data: LoadJson) {
  const schema = parserV2(data.value);

  Object.assign(state.canvasState, schema.canvas);

  const tableJson = schema.table as any;
  if (isObject(tableJson)) {
    Array.isArray(tableJson.tables) &&
      tableJson.tables.forEach((loadTable: PureTable) =>
        executeLoadTable(state, loadTable)
      );

    Array.isArray(tableJson.indexes) &&
      tableJson.indexes.forEach((loadIndex: Index) =>
        executeLoadIndex(state, loadIndex)
      );
  }

  const memoJson = schema.memo as any;
  if (isObject(memoJson) && Array.isArray(memoJson.memos)) {
    memoJson.memos.forEach((loadMemo: Memo) =>
      executeLoadMemo(state, loadMemo)
    );
  }

  const relationshipJson = schema.relationship as any;
  if (
    isObject(relationshipJson) &&
    Array.isArray(relationshipJson.relationships)
  ) {
    relationshipJson.relationships.forEach((loadRelationship: Relationship) => {
      executeLoadRelationship(state, loadRelationship);
    });

    // migration version 2.0.3
    validStartRelationship(state);
  }
}

export function executeClear({
  tableState: { tables, indexes },
  memoState: { memos },
  relationshipState: { relationships },
}: State) {
  tables.splice(0, tables.length);
  indexes.splice(0, indexes.length);
  memos.splice(0, memos.length);
  relationships.splice(0, relationships.length);
}

export function executeChangeViewport(
  { editorState: { viewport } }: State,
  data: Viewport
) {
  viewport.width = data.width;
  viewport.height = data.height;
}

export function executeCopyColumn(
  { tableState: { tables }, editorState: { copyColumns } }: State,
  data: CopyColumn
) {
  const table = getData(tables, data.tableId);
  if (!table) return;

  copyColumns.splice(0, copyColumns.length);
  data.columnIds.forEach(columnId => {
    const column = getData(table.columns, columnId);
    if (!column) return;

    copyColumns.push(cloneDeep(column));
  });
}

export function executeFindActive({ editorState }: State) {
  editorState.findActive = true;
}

export function executeFindActiveEnd({ editorState }: State) {
  editorState.findActive = false;
}

export function executeReadonlyEditor(
  { editorState }: State,
  data: ReadonlyEditor
) {
  editorState.readonly = data.readonly;
}

export const executeEditorCommandMap: Record<
  keyof EditorCommandMap,
  ExecuteCommand
> = {
  'editor.hasUndoRedo': executeHasUndoRedo,
  'editor.focusTable': executeFocusTable,
  'editor.focusColumn': executeFocusColumn,
  'editor.focusTableEnd': executeFocusTableEnd,
  'editor.focusMoveTable': executeFocusMoveTable,
  'editor.editTable': executeEditTable,
  'editor.editTableEnd': executeEditTableEnd,
  'editor.selectAllColumn': executeSelectAllColumn,
  'editor.drawStartRelationship': executeDrawStartRelationship,
  'editor.drawStartAddRelationship': executeDrawStartAddRelationship,
  'editor.drawEndRelationship': executeDrawEndRelationship,
  'editor.drawRelationship': executeDrawRelationship,
  'editor.draggableColumn': executeDraggableColumn,
  'editor.draggableColumnEnd': executeDraggableColumnEnd,
  'editor.loadJson': executeLoadJson,
  'editor.initLoadJson': executeLoadJson,
  'editor.clear': executeClear,
  'editor.initClear': executeClear,
  'editor.changeViewport': executeChangeViewport,
  'editor.copyColumn': executeCopyColumn,
  'editor.findActive': executeFindActive,
  'editor.findActiveEnd': executeFindActiveEnd,
  'editor.readonly': executeReadonlyEditor,
  ...executeFilterCommandMap,
};
