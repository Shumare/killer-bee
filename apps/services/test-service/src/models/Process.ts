import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Test } from './Test';

@Entity('process')
export class Process {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @OneToMany(() => Test, (test) => test.process, { cascade: true })
  tests!: Test[];
}
