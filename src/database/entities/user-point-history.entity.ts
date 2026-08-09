import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { PointTransactionType } from '@shared/enums/point-transaction-type.enum';

/**
 * Immutable audit log of every point transaction. `amount` is always a
 * positive magnitude; `type` carries the direction. `balanceAfter` records
 * the resulting balance right after this transaction was applied.
 */
@Entity({ name: 'user_point_histories' })
export class UserPointHistoryEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: PointTransactionType })
  type: PointTransactionType;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int', name: 'balance_after' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @Column({ name: 'performed_by', nullable: true })
  performedBy: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'performed_by' })
  performedByUser: UserEntity;
}
