import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGrade } from './entities/student-grade.entity';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';

@Injectable()
export class StudentGradeService {
  constructor(
    @InjectRepository(StudentGrade)
    private repository: Repository<StudentGrade>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
  ) {}

  async createForStudent(
    studentId: number,
    trainerUserId: number,
    dto: CreateStudentGradeDto,
  ) {
    // ensure student exists (nice 404)
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const trainer = await this.trainerRepo.findOne({
      where: { userId: trainerUserId },
    });
    if (!trainer)
      throw new NotFoundException(`Trainer ${trainerUserId} not found`);

    if (
      !trainer.academyId ||
      !student.academyId ||
      trainer.academyId !== student.academyId
    ) {
      throw new ForbiddenException(
        'You can only review trainers from your academy.',
      );
    }

    const existing = await this.repository.findOne({
      where: { studentId, trainerId: trainer.id },
    });
    if (existing)
      throw new ConflictException('You have already reviewed this student');

    const entity = this.repository.create({
      studentId: student.id,
      trainerId: trainer.id, // who left the feedback
      grade: dto.grade ?? null, // can be null initially
      description: dto.description ?? null, // optional comment
    });
    return this.repository.save(entity);
  }
}
