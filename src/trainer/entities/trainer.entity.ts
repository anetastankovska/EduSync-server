import { TrainerReview } from 'src/trainer-review/entities/trainer-review.entity';
import { StudentGrade } from 'src/student-grade/entities/student-grade.entity';
import { Academy } from 'src/academy/entities/academy.entity';
import { Seniority } from 'src/util/seniority.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn() id: number;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  age: number;
  @Column({ type: 'enum', enum: Seniority })
  seniority: Seniority;

  @ManyToOne(() => Academy, (a) => a.trainers)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @Column() academyId: number;

  // existing: reviews *received*
  @OneToMany(() => TrainerReview, (tr) => tr.trainer, { cascade: true })
  trainerReviews: TrainerReview[];

  // existing: grades *given* to students
  @OneToMany(() => StudentGrade, (sg) => sg.trainer, { cascade: true })
  studentGrades: StudentGrade[];
}
