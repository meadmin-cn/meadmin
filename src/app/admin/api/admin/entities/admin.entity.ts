import { Admin as AdminBaseEntity } from '@/entities/admin';
import { Entity } from 'typeorm';

@Entity()
export class Admin extends AdminBaseEntity {}
