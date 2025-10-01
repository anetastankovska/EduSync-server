import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TrainerReview } from './entities/trainer-review.entity';
import { CreateTrainerReviewDto } from './dto/create-trainer-review.dto';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Student } from 'src/student/entities/student.entity';
import { Subject } from 'src/subject/entities/subject.entity';

@Injectable()
export class TrainerReviewService {
  constructor(
    @InjectRepository(TrainerReview)
    private readonly reviewRepo: Repository<TrainerReview>,
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  async createForTrainer(
    trainerId: number,
    studentUserId: number, // from JWT payload
    dto: CreateTrainerReviewDto,
  ) {
    const { subjectId } = dto;

    // 1) Resolve student by userId (JWT)
    const student = await this.studentRepo.findOne({
      where: { userId: studentUserId },
      relations: { subjects: true }, // needed for enrollment check
    });
    if (!student) throw new NotFoundException('Student profile not found');

    // 2) Trainer must exist
    const trainer = await this.trainerRepo.findOne({
      where: { id: trainerId },
    });
    if (!trainer) throw new NotFoundException(`Trainer ${trainerId} not found`);

    // 3) Subject must exist
    const subject = await this.subjectRepo.findOne({
      where: { id: subjectId },
    });
    if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);

    // 4) Academy context (optional but sensible): trainer & subject should belong to same academy as student (if set)
    if (
      (trainer.academyId &&
        student.academyId &&
        trainer.academyId !== student.academyId) ||
      (subject.academyId &&
        student.academyId &&
        subject.academyId !== student.academyId)
    ) {
      throw new ForbiddenException('You can only review within your academy.');
    }

    // 5) Enrollment: student must be enrolled in the subject
    const studentEnrolled = student.subjects?.some((s) => s.id === subjectId);
    if (!studentEnrolled) {
      throw new ForbiddenException(
        'You can only review subjects you are enrolled in.',
      );
    }

    // 6) Assignment: trainer must be assigned to the subject
    if (subject.trainerId !== trainer.id) {
      throw new ForbiddenException(
        'Selected trainer is not assigned to this subject.',
      );
    }

    // 7) Uniqueness: only one review per (student, trainer, subject)
    const existing = await this.reviewRepo.findOne({
      where: { trainerId, studentId: student.id, subjectId },
    });
    if (existing) {
      throw new ConflictException(
        'You have already reviewed this trainer for this subject.',
      );
    }

    // 8) Persist
    const entity = this.reviewRepo.create({
      trainerId: trainer.id,
      studentId: student.id,
      subjectId,
      grade: dto.grade,
      description: dto.description,
    });

    return this.reviewRepo.save(entity);
  }

  listForTrainer(trainerId: number) {
    return this.reviewRepo.find({ where: { trainerId } });
  }

  listByStudent(studentId: number) {
    return this.reviewRepo.find({ where: { studentId } });
  }
}
