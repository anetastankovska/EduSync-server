import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Academy } from 'src/academy/entities/academy.entity';
import { StudentGrade } from 'src/student-grade/entities/student-grade.entity';
import { TrainerReview } from 'src/trainer-review/entities/trainer-review.entity';
import { Subject } from 'src/subject/entities/subject.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index({ unique: true })
  @Column()
  userId: number;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  // Keep students when academy is deleted; just unassign them
  @ManyToOne(() => Academy, (a) => a.students, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'academyId' })
  academy: Academy | null;

  @Column({ nullable: true })
  academyId: number | null;

  @Column({ length: 200, nullable: true })
  address: string | null;

  @Column({ length: 30, nullable: true })
  telephone: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @OneToMany(() => StudentGrade, (sg) => sg.student, { cascade: true })
  studentGrades: StudentGrade[];

  @OneToMany(() => TrainerReview, (tr) => tr.student, { cascade: true })
  trainerReviews: TrainerReview[];

  // Join table auto-cleans when either side is deleted
  @ManyToMany(() => Subject, (s) => s.students, { cascade: false })
  @JoinTable({
    name: 'student_subject',
    joinColumn: {
      name: 'studentId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subjectId',
      referencedColumnName: 'id',
    },
  })
  subjects: Subject[];
}
