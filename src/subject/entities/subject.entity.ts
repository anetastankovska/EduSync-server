import { IsPositive } from 'class-validator';
import { Academy } from 'src/academy/entities/academy.entity';
import { Difficulty } from 'src/util/difficulty.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @IsPositive()
  @Column()
  numberOfClasses: number;

  @Column({
    type: 'enum',
    enum: Difficulty,
  })
  difficulty: Difficulty;

  @ManyToOne(() => Academy, (academy) => academy.subjects)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @Column()
  academyId: number;
}
