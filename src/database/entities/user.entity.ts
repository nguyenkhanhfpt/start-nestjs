import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';
import { Role } from '@shared/enums/role.enum';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password', select: false })
  @Exclude()
  password: string;

  @Column({ default: 'default.jpg' })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;
}
