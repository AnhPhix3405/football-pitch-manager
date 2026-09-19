import { TableColumn, TableForeignKey } from 'typeorm';

type TableColumnOptions = NonNullable<
  ConstructorParameters<typeof TableColumn>[0]
>;
type TableForeignKeyOptions = NonNullable<
  ConstructorParameters<typeof TableForeignKey>[0]
>;

export const uuidPrimaryColumn = (): TableColumnOptions => ({
  name: 'id',
  type: 'uuid',
  isPrimary: true,
});

export const createdAtColumn = (): TableColumnOptions => ({
  name: 'created_at',
  type: 'timestamptz',
  isNullable: false,
  default: 'now()',
});

export const updatedAtColumn = (): TableColumnOptions => ({
  name: 'updated_at',
  type: 'timestamptz',
  isNullable: false,
  default: 'now()',
});

export const auditColumns = (): TableColumnOptions[] => [
  createdAtColumn(),
  updatedAtColumn(),
];

export const foreignKey = (
  columnName: string,
  referencedTableName: string,
  onDelete: 'CASCADE' | 'RESTRICT' | 'SET NULL',
): TableForeignKeyOptions => ({
  columnNames: [columnName],
  referencedTableName,
  referencedColumnNames: ['id'],
  onDelete,
  onUpdate: 'NO ACTION',
});
