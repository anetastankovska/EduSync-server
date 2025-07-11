import { Student } from 'src/student/entities/student.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StudentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 200,
  })
  address: string;

  @Column({
    length: 30,
  })
  telephone: string;

  @Column()
  dateOfBirth: Date;

  @OneToOne(() => Student, (student) => student.studentDetail)
  student: Student;
}
