import { User } from 'src/user/entities/user.entity';
import { TrainerReview } from 'src/trainer-review/entities/trainer-review.entity';
import { StudentGrade } from 'src/student-grade/entities/student-grade.entity';
import { Academy } from 'src/academy/entities/academy.entity';
import { Seniority } from 'src/util/seniority.enum';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subject } from 'src/subject/entities/subject.entity';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index({ unique: true })
  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column()
  age: number;

  @Column({ type: 'enum', enum: Seniority, nullable: true, default: null })
  seniority: Seniority | null;

  // Keep trainers when academy is deleted; just unassign them
  @ManyToOne(() => Academy, (a) => a.trainers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'academyId' })
  academy: Academy | null;

  @Column({ nullable: true })
  academyId: number | null;

  @OneToMany(() => TrainerReview, (tr) => tr.trainer, { cascade: true })
  trainerReviews: TrainerReview[];

  @OneToMany(() => StudentGrade, (sg) => sg.trainer, { cascade: true })
  studentGrades: StudentGrade[];

  // One trainer teaches many subjects
  @OneToMany(() => Subject, (s) => s.trainer)
  subjects: Subject[];
}
