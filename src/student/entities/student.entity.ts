import { Academy } from 'src/academy/entities/academy.entity';
import { StudentDetail } from 'src/student-details/entities/student-detail.entity';
import { StudentGrade } from 'src/student-grade/entities/student-grade.entity';
import { TrainerReview } from 'src/trainer-review/entities/trainer-review.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ length: 30 }) email: string;
  @Column({ nullable: true }) @Check(`"age" >= 18`) age: number;

  @ManyToOne(() => Academy, (a) => a.students)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;
  @Column() academyId: number;

  @OneToOne(() => StudentDetail, (sd) => sd.student, { cascade: true })
  @JoinColumn()
  studentDetail: StudentDetail;

  // grades *received* from trainers
  @OneToMany(() => StudentGrade, (sg) => sg.student, { cascade: true })
  studentGrades: StudentGrade[];

  // reviews *written* for trainers
  @OneToMany(() => TrainerReview, (tr) => tr.student, { cascade: true })
  trainerReviews: TrainerReview[];
}
