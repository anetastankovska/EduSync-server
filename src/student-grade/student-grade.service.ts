import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGrade } from './entities/student-grade.entity';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { Student } from 'src/student/entities/student.entity';

@Injectable()
export class StudentGradeService {
  constructor(
    @InjectRepository(StudentGrade)
    private repository: Repository<StudentGrade>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
  ) {}

  async createForStudent(
    studentId: number,
    trainerId: number,
    dto: CreateStudentGradeDto,
  ) {
    // ensure student exists (nice 404)
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const entity = this.repository.create({
      studentId,
      trainerId, // who left the feedback
      grade: dto.grade ?? null, // can be null initially
      description: dto.description ?? null, // optional comment
    });
    return this.repository.save(entity);
  }
}
