import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Process } from './Process';

@Entity('test')
export class Test {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  processId!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  criteria!: string;

  @ManyToOne(() => Process, (process) => process.tests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'processId' })
  process!: Process;
}
