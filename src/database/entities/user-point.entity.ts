import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

/**
 * Current point balance for a user. One row per user (enforced by a unique
 * constraint on `userId`); every mutation must also be logged as a
 * UserPointHistoryEntity row for auditability.
 */
@Entity({ name: 'user_points' })
export class UserPointEntity extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => UserEntity, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'int', default: 0 })
  balance: number;
}
