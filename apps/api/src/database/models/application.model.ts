import { ApplicationStatus } from '@ai-job-applier/shared';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Job } from './job.model';
import { User } from './user.model';

@Table({ tableName: 'applications', timestamps: false })
export class Application extends Model<Application> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Job)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'job_id'
  })
  declare jobId: string;

  @BelongsTo(() => Job)
  declare job?: Job;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user?: User;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    allowNull: false,
    defaultValue: ApplicationStatus.Pending
  })
  declare status: ApplicationStatus;

  @Column({
    type: DataType.DATE,
    field: 'applied_at'
  })
  declare appliedAt: Date | null;

  @Column(DataType.TEXT)
  declare response: string | null;

  @Column(DataType.TEXT)
  declare notes: string | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at'
  })
  declare createdAt: Date;
}
