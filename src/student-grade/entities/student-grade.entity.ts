// src/student-grade/entities/student-grade.entity.ts
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity'; // if you’re also grading per‐trainer
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'student_grade' })
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

  // ← and if you’re tracking which trainer gave it:
  @ManyToOne(() => Trainer, (trainer) => trainer.studentGrades, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'trainerId' })
  trainer?: Trainer | null;

  @Index()
  @Column({ nullable: true })
  trainerId?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
