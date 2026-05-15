import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Model } from './Model';

@Entity('property')
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelId!: number;

  @Column({ type: 'text' })
  encryptedKey!: string;

  @Column({ type: 'text' })
  encryptedValue!: string;

  @ManyToOne(() => Model, (model) => model.properties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'modelId' })
  model!: Model;
}
