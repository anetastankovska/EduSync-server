import { Academy } from 'src/academy/entities/academy.entity';
import { Difficulty } from 'src/util/difficulty.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Student } from 'src/student/entities/student.entity';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'smallint', unsigned: true })
  numberOfClasses: number;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty: Difficulty;

  @ManyToOne(() => Academy, (academy) => academy.subjects, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @Column()
  academyId: number;

  // NEW – one trainer teaches a subject; allow NULL during transition
  @ManyToOne(() => Trainer, (t) => t.subjects, {
    onDelete: 'SET NULL',
    nullable: true, // <— important
  })
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer | null;

  @Column({ nullable: true }) // <— important
  trainerId: number | null;

  @ManyToMany(() => Student, (s) => s.subjects)
  students: Student[];
}
