import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Model } from './Model';
import { Step } from './Step';

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

  @ManyToOne(() => Model, (model) => model.processes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelId' })
  model!: Model;

  @OneToMany(() => Step, (step) => step.process, { cascade: true })
  steps!: Step[];
}
