import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from 'sequelize-typescript';

@Table({ tableName: 'app_settings', timestamps: false })
export class AppSettings extends Model<AppSettings> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(32),
    defaultValue: 'default'
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    defaultValue: '',
    field: 'job_search_title'
  })
  declare jobSearchTitle: string;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at'
  })
  declare updatedAt: Date;
}
