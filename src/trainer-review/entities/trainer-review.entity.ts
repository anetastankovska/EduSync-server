import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'trainer_review' })
export class TrainerReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: number;

  @Column()
  description: string;

  // ← who is being reviewed
  @ManyToOne(() => Trainer, (t) => t.trainerReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer;

  @Column()
  trainerId: number;

  // ← who wrote the review
  @ManyToOne(() => Student, (s) => s.trainerReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;
}
