import { Admin as AdminBaseEntity } from '@/entities/admin.entity';
import { Entity } from 'typeorm';

@Entity()
export class Admin extends AdminBaseEntity {}
