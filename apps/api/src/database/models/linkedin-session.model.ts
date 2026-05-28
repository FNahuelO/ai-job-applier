import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { User } from './user.model';
import { updatedAtColumnOptions } from './timestamp-columns';

@Table({ tableName: 'linkedin_sessions', timestamps: false })
export class LinkedInSession extends Model<LinkedInSession> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  declare userId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'storage_state_encrypted'
  })
  declare storageStateEncrypted: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    defaultValue: 'active'
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'connected_at',
    defaultValue: () => new Date()
  })
  declare connectedAt: Date;

  @Column(updatedAtColumnOptions)
  declare updatedAt: Date;

  @BelongsTo(() => User)
  declare user?: User;
}
