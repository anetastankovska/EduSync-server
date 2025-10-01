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
import { Subject } from 'src/subject/entities/subject.entity';

@Injectable()
export class StudentGradeService {
  constructor(
    @InjectRepository(StudentGrade)
    private repository: Repository<StudentGrade>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  async createForStudent(
    studentId: number,
    trainerUserId: number,
    dto: CreateStudentGradeDto,
  ) {
    const { subjectId } = dto;

    // 1) Ensure student exists (nice 404)
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: { subjects: true }, // needed to check enrollment
    });
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    // 2) Resolve trainer by userId (from JWT)
    const trainer = await this.trainerRepo.findOne({
      where: { userId: trainerUserId },
    });
    if (!trainer)
      throw new NotFoundException(`Trainer ${trainerUserId} not found`);

    // 3) Subject must exist
    const subject = await this.subjectRepo.findOne({
      where: { id: subjectId },
    });
    if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);

    // 4) Academy context (optional but sensible): keep all in same academy if set
    if (
      (trainer.academyId &&
        student.academyId &&
        trainer.academyId !== student.academyId) ||
      (subject.academyId &&
        student.academyId &&
        subject.academyId !== student.academyId)
    ) {
      throw new ForbiddenException(
        'Grades can only be recorded within your academy.',
      );
    }

    // 5) Enrollment: student must be enrolled in the subject
    const enrolled = student.subjects?.some((s) => s.id === subjectId);
    if (!enrolled) {
      throw new ForbiddenException('Student is not enrolled in this subject.');
    }

    // 6) Assignment: trainer must be assigned to the subject
    if (subject.trainerId !== trainer.id) {
      throw new ForbiddenException('You are not assigned to this subject.');
    }

    // 7) Uniqueness: only one grade per (student, trainer, subject)
    const existing = await this.repository.findOne({
      where: { studentId, trainerId: trainer.id, subjectId },
    });
    if (existing) {
      throw new ConflictException(
        'A grade for this student and subject already exists.',
      );
    }

    // 8) Persist
    const entity = this.repository.create({
      studentId: student.id,
      trainerId: trainer.id,
      subjectId,
      grade: dto.grade ?? null,
      description: dto.description ?? null,
    });
    return this.repository.save(entity);
  }
}
