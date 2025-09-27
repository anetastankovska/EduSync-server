import { User } from 'src/user/entities/user.entity';
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
  OneToOne,
  Index,
} from 'typeorm';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  // NEW: link to the owning user (1:1)
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

  @ManyToOne(() => Academy, (a) => a.trainers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @Column({ nullable: true })
  academyId: number | null;

  @OneToMany(() => TrainerReview, (tr) => tr.trainer, { cascade: true })
  trainerReviews: TrainerReview[];

  @OneToMany(() => StudentGrade, (sg) => sg.trainer, { cascade: true })
  studentGrades: StudentGrade[];
}
