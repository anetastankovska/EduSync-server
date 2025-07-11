// src/student-grade/entities/student-grade.entity.ts
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity'; // if you’re also grading per‐trainer
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'student_grade' })
export class StudentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: number;

  @Column()
  description: string;

  // ← this bit must exist:
  @ManyToOne(() => Student, (student) => student.studentGrades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  // ← and if you’re tracking which trainer gave it:
  @ManyToOne(() => Trainer, (trainer) => trainer.studentGrades)
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer;

  @Column()
  trainerId: number;
}
