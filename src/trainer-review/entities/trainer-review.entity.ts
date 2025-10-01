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
  Unique, // 👈 add this
} from 'typeorm';

@Entity({ name: 'trainer_review' })
@Unique(['studentId', 'trainerId', 'subjectId']) // 👈 enforce one review per trio
export class TrainerReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint' })
  grade: number;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  // who is being reviewed
  @ManyToOne(() => Trainer, (t) => t.trainerReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer;

  @Index()
  @Column()
  trainerId: number;

  // subject context of the review
  @ManyToOne(() => Subject, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Index()
  @Column()
  subjectId: number;

  // who wrote the review
  @ManyToOne(() => Student, (s) => s.trainerReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Index()
  @Column()
  studentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
