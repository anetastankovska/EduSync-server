import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Subject } from 'src/subject/entities/subject.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'student_grade' })
@Unique(['studentId', 'trainerId', 'subjectId'])
export class StudentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', nullable: true })
  grade: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @ManyToOne(() => Student, (student) => student.studentGrades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Index()
  @Column()
  studentId: number;

  @ManyToOne(() => Trainer, (trainer) => trainer.studentGrades, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'trainerId' })
  trainer?: Trainer | null;

  @Index()
  @Column({ nullable: true })
  trainerId?: number | null;

  // NEW: grade is for a specific subject
  @ManyToOne(() => Subject, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Index()
  @Column()
  subjectId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
