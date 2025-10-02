import { Academy } from 'src/academy/entities/academy.entity';
import { Difficulty } from 'src/util/difficulty.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  // Delete subjects when their academy is deleted
  @ManyToOne(() => Academy, (a) => a.subjects, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @Column()
  academyId: number;

  // Keep subject if trainer is deleted; just clear the assignment
  @ManyToOne(() => Trainer, (t) => t.subjects, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer | null;

  @Column({ nullable: true })
  trainerId: number | null;

  @ManyToMany(() => Student, (s) => s.subjects)
  students: Student[];
}
