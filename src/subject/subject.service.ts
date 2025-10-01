import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Trainer } from 'src/trainer/entities/trainer.entity';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>, // NEW
  ) {}

  async findAll(
    difficulty?: string,
    academyId?: number,
    trainerId?: number,
  ): Promise<Subject[]> {
    const where: any = {};
    if (difficulty) where.difficulty = difficulty;
    if (academyId) where.academyId = academyId;
    if (trainerId) where.trainerId = trainerId;

    return this.subjectRepository.find({ where });
  }

  async findOne(id: number): Promise<Subject> {
    try {
      return await this.subjectRepository.findOneByOrFail({ id });
    } catch (error: any) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      throw error;
    }
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    // 1) trainer must exist
    const trainer = await this.trainerRepository.findOne({
      where: { id: dto.trainerId },
    });
    if (!trainer)
      throw new NotFoundException(`Trainer ${dto.trainerId} not found`);

    // 2) trainer must belong to the same academy
    // if (!trainer.academyId || trainer.academyId !== dto.academyId) {
    //   throw new BadRequestException(
    //     'Trainer must belong to the same academy as the subject',
    //   );
    // }

    const subject = this.subjectRepository.create({
      name: dto.name,
      numberOfClasses: dto.numberOfClasses,
      difficulty: dto.difficulty,
      academyId: dto.academyId,
      trainerId: dto.trainerId,
    });
    return this.subjectRepository.save(subject);
  }

  async update(id: number, dto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Subject not found');

    // If trainerId is changing, validate it
    if (dto.trainerId != null) {
      const trainer = await this.trainerRepository.findOne({
        where: { id: dto.trainerId },
      });
      if (!trainer)
        throw new NotFoundException(`Trainer ${dto.trainerId} not found`);

      // If academyId is also changing, compare against that; otherwise use existing subject.academyId
      const academyToCheck = dto.academyId ?? subject.academyId;
      if (!trainer.academyId || trainer.academyId !== academyToCheck) {
        throw new BadRequestException(
          'Trainer must belong to the same academy as the subject',
        );
      }
    }

    const merged = this.subjectRepository.merge(subject, dto);
    return this.subjectRepository.save(merged);
  }

  async remove(id: number) {
    const result = await this.subjectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No subject found with the provided id.');
    }
  }
}
