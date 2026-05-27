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
import { User } from './user.model';

@Table({ tableName: 'linkedin_connect_requests', timestamps: false })
export class LinkedInConnectRequest extends Model<LinkedInConnectRequest> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  declare userId: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    unique: true
  })
  declare token: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    defaultValue: 'pending'
  })
  declare status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'error_message'
  })
  declare errorMessage: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at'
  })
  declare expiresAt: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at'
  })
  declare createdAt: Date;

  @BelongsTo(() => User)
  declare user?: User;
}
