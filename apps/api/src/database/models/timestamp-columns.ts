import { DataType } from 'sequelize-typescript';

/** Sequelize no rellena @CreatedAt/@UpdatedAt si `timestamps: false` en @Table. */
export const createdAtColumnOptions = {
  type: DataType.DATE,
  allowNull: false,
  field: 'created_at',
  defaultValue: () => new Date()
} as const;

export const updatedAtColumnOptions = {
  type: DataType.DATE,
  allowNull: false,
  field: 'updated_at',
  defaultValue: () => new Date()
} as const;
