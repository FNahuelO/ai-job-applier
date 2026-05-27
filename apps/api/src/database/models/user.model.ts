import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript';
import { Application } from './application.model';
import { LinkedInSession } from './linkedin-session.model';

@Table({ tableName: 'users', timestamps: false })
export class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare password: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    defaultValue: '',
    field: 'job_search_title'
  })
  declare jobSearchTitle: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at'
  })
  declare createdAt: Date;

  @HasMany(() => Application)
  declare applications?: Application[];

  @HasOne(() => LinkedInSession)
  declare linkedInSession?: LinkedInSession;
}
