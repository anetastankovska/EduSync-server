import { Student } from 'src/student/entities/student.entity';
import { Subject } from 'src/subject/entities/subject.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => Subject, (subject) => subject.academy, { cascade: true })
  subjects: Subject[];

  @OneToMany(() => Student, (student) => student.academy)
  students: Student[];

  @OneToMany(() => Trainer, (trainer) => trainer.academy)
  trainers: Trainer[];
}
