import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Composition } from './Composition';
import { Process } from './Process';
import { Property } from './Property';

@Entity('model')
export class Model {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grammagePUHT!: number;

  @Column({ type: 'varchar', length: 100 })
  gamme!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Composition, (composition) => composition.model, {
    cascade: true,
  })
  compositions!: Composition[];

  @OneToMany(() => Process, (process) => process.model, { cascade: true })
  processes!: Process[];

  @OneToMany(() => Property, (property) => property.model, { cascade: true })
  properties!: Property[];
}
