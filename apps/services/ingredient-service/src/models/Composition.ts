import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Model } from './Model';
import { Ingredient } from './Ingredient';

@Entity('composition')
export class Composition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelId!: number;

  @Column()
  ingredientId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  grammage!: number;

  @ManyToOne(() => Model, (model) => model.compositions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'modelId' })
  model!: Model;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.compositions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ingredientId' })
  ingredient!: Ingredient;
}
