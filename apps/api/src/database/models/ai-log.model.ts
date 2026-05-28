import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { createdAtColumnOptions } from './timestamp-columns';

@Table({ tableName: 'ai_logs', timestamps: false })
export class AiLog extends Model<AiLog> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare prompt: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare response: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare type: string;

  @Column(createdAtColumnOptions)
  declare createdAt: Date;
}
