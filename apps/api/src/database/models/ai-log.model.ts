import {
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';

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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at'
  })
  declare createdAt: Date;
}
