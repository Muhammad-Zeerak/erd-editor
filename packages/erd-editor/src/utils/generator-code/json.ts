import { query } from '@dineug/erd-editor-schema';

import { ColumnOption, ColumnUIKey } from '@/constants/schema';
import { PrimitiveTypeMap } from '@/constants/sql/dataType';
import { RootState } from '@/engine/state';
import { Table, Column, Relationship } from '@/internal-types';
import { bHas } from '@/utils/bit';
import {
  orderByNameASC,
} from '@/utils/schema-sql/utils';

import {
  FormatTableOptions,
  getNameCase,
  getPrimitiveType,
  hasOneRelationship,
} from './utils';

const convertTypeMap: PrimitiveTypeMap = {
  int: 'INT',
  long: 'BIGINT',
  float: 'FLOAT',
  double: 'DOUBLE',
  decimal: 'DECIMAL',
  boolean: 'BOOLEAN',
  string: 'STRING',
  lob: 'STRING',
  date: 'DATE',
  dateTime: 'DATE_TIME',
  time: 'TIME', 
};

export function createCode(state: RootState): string {
  const {
    doc: { tableIds },
    collections,
  } = state;
  const stringBuffer: string[] = [''];
  const tables = query(collections)
    .collection('tableEntities')
    .selectByIds(tableIds)
    .sort(orderByNameASC);

  tables.forEach(table => {
    const formatOptions: FormatTableOptions = {
      buffer: stringBuffer,
      table,
    };
    formatTable(state, formatOptions);
    stringBuffer.push('');
  });

  return stringBuffer.join('\n');
}

export function formatTable(
  state: RootState,
  { buffer, table }: FormatTableOptions
) {
  const {
    settings: { tableNameCase },
    doc: { relationshipIds },
    collections,
  } = state;

  const tableName = getNameCase(table.name, tableNameCase);
  const columns = query(collections)
    .collection('tableColumnEntities')
    .selectByIds(table.columnIds)
    .filter(column => column);

  const relationships = query(collections)
    .collection('relationshipEntities')
    .selectByIds(relationshipIds);

  const validColumns = columns.map(column => formatColumn(state, column)).filter(column => column);

  const formatTableEntity = {
    tableName: tableName,
    name: table.name,
    auditable: table.auditable,
    revisionEnabled: table.revisionEnabled,
    entityDefinition: {
      columns: validColumns,
    },
    foreignKeys: relationships
      .filter(relationship => relationship.end.tableId === table.id)
      .map(relationship => formatRelationship(state, relationship, table, collections, tableNameCase)),
  };

  buffer.push(JSON.stringify(formatTableEntity, null, 2));
}

export function formatRelationship(
  state: RootState,
  relationship: Relationship,
  table: Table,
  collections: any,
  tableNameCase: any
) {
  const tableCollection = query(collections).collection('tableEntities');
  const columnCollection = query(collections).collection('tableColumnEntities');

  let relationshipType = '';
  let referencingColumn: Column | null = null;
  let referencedTable: Table | null = null;
  let referencedColumn: Column | null = null;

  // Check if the relationship is ending at this table (many-to-one)
  if (relationship.end.tableId === table.id) {
    referencedTable = tableCollection.selectById(relationship.start.tableId) || null;
    referencingColumn = columnCollection.selectById(relationship.start.columnIds[0]) || null;
    referencedColumn = columnCollection.selectById(relationship.end.columnIds[0]) || null;

    relationshipType = 'many-to-one'; 
    if (hasOneRelationship(relationship.relationshipType)) {
      relationshipType = 'one-to-one';
    }
  }
  // Check if the relationship is starting from this table (one-to-many)
  else if (relationship.start.tableId === table.id) {
    referencedTable = tableCollection.selectById(relationship.end.tableId) || null;
    referencingColumn = columnCollection.selectById(relationship.end.columnIds[0]) || null;
    referencedColumn = columnCollection.selectById(relationship.start.columnIds[0]) || null;
    
    relationshipType = 'one-to-many'; 
    if (hasOneRelationship(relationship.relationshipType)) {
      relationshipType = 'one-to-one';
    }
  }

  return {
    type: relationshipType,
    referenced_table: referencedTable
      ? getNameCase(referencedTable.name, tableNameCase)
      : 'unknown',
    referenced_column: referencedColumn ? referencedColumn.name : 'unknown',
    referencing_column: referencingColumn ? referencingColumn.name : 'unknown',
  };
}

function formatColumn(
  { settings: { columnNameCase, database } }: RootState,
  column: Column
) {
  
  const isPK = bHas(column.ui.keys, ColumnUIKey.primaryKey);
  const isFK = bHas(column.ui.keys, ColumnUIKey.foreignKey);
  if ((!isPK && isFK) || (isPK && isFK)) {
    return;
  }

  const columnName = getNameCase(column.name, columnNameCase);
  const primitiveType = getPrimitiveType(column.dataType, database);

  return {
    name: columnName,
    type: convertTypeMap[primitiveType],
    required: bHas(column.options, ColumnOption.notNull),
    isPrimaryKey: isPK ? true : false,
  };
}
