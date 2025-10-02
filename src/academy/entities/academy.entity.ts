import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Subject } from 'src/subject/entities/subject.entity';
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';

@Entity()
export class Academy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  price: number;

  @OneToMany(() => Subject, (s) => s.academy)
  subjects: Subject[];

  @OneToMany(() => Student, (s) => s.academy)
  students: Student[];

  @OneToMany(() => Trainer, (t) => t.academy)
  trainers: Trainer[];
}
