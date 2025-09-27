import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainerReview } from './entities/trainer-review.entity';
import { CreateTrainerReviewDto } from './dto/create-trainer-review.dto';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Student } from 'src/student/entities/student.entity';

@Injectable()
export class TrainerReviewService {
  constructor(
    @InjectRepository(TrainerReview)
    private readonly reviewRepo: Repository<TrainerReview>,
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async createForTrainer(
    trainerId: number,
    studentUserId: number, // from JWT payload
    dto: CreateTrainerReviewDto,
  ) {
    // 1) resolve student from userId (JWT)
    const student = await this.studentRepo.findOne({
      where: { userId: studentUserId },
    });
    if (!student) throw new NotFoundException('Student profile not found');

    // 2) load trainer by trainerId param
    const trainer = await this.trainerRepo.findOne({
      where: { id: trainerId },
    });
    if (!trainer) throw new NotFoundException(`Trainer ${trainerId} not found`);

    // 3) same-academy check
    if (
      !trainer.academyId ||
      !student.academyId ||
      trainer.academyId !== student.academyId
    ) {
      throw new ForbiddenException(
        'You can only review trainers from your academy.',
      );
    }

    // 4) prevent duplicate review per (student, trainer)
    const existing = await this.reviewRepo.findOne({
      where: { trainerId, studentId: student.id },
    });
    if (existing)
      throw new ConflictException('You have already reviewed this trainer');

    // 5) persist review using student PK
    const entity = this.reviewRepo.create({
      trainerId: trainer.id,
      studentId: student.id,
      grade: dto.grade ?? null,
      description: dto.description ?? null,
    });

    return this.reviewRepo.save(entity);
  }

  // Additional helper methods
  listForTrainer(trainerId: number) {
    return this.reviewRepo.find({ where: { trainerId } });
  }

  listByStudent(studentId: number) {
    return this.reviewRepo.find({ where: { studentId } });
  }
}
