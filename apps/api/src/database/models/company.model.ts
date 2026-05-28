import {
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Job } from './job.model';
import { createdAtColumnOptions } from './timestamp-columns';

@Table({ tableName: 'companies', timestamps: false })
export class Company extends Model<Company> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @Column(DataType.STRING)
  declare website: string | null;

  @Column(DataType.STRING)
  declare linkedin: string | null;

  @Column(createdAtColumnOptions)
  declare createdAt: Date;

  @HasMany(() => Job)
  declare jobs?: Job[];
}
