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

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  price: number;

  @OneToMany(() => Subject, (subject) => subject.academy, { cascade: true }) // when cascade is set to true, all the changes to the academy will propagate to subjects too
  subjects: Subject[];

  @OneToMany(() => Student, (student) => student.academy)
  students: Student[];

  @OneToMany(() => Trainer, (trainer) => trainer.academy)
  trainers: Trainer[];
}
