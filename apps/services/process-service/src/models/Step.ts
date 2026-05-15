import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Process } from './Process';

@Entity('step')
export class Step {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  processId!: number;

  @Column({ type: 'int' })
  stepOrder!: number;

  @Column({ type: 'text' })
  description!: string;

  @ManyToOne(() => Process, (process) => process.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'processId' })
  process!: Process;
}
