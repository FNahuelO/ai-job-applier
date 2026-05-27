import { JobSource } from '@ai-job-applier/shared';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Application } from './application.model';
import { Company } from './company.model';

@Table({ tableName: 'jobs', timestamps: false })
export class Job extends Model<Job> {
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
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare company: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    field: 'company_id'
  })
  declare companyId: string | null;

  @BelongsTo(() => Company)
  declare companyRelation?: Company;

  @Column(DataType.STRING)
  declare location: string | null;

  @Column(DataType.STRING)
  declare salary: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare url: string;

  @Column({
    type: DataType.ENUM(...Object.values(JobSource)),
    allowNull: false
  })
  declare source: JobSource;

  @Column(DataType.STRING)
  declare seniority: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare remote: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: []
  })
  declare technologies: string[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at'
  })
  declare createdAt: Date;

  @HasMany(() => Application)
  declare applications?: Application[];
}
