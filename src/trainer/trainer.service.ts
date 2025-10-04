import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { Trainer } from './entities/trainer.entity';
import { Subject } from 'src/subject/entities/subject.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
  ) {}

  async findAll(
    name?: string,
    academyId?: number,
    seniority?: string,
  ): Promise<Trainer[]> {
    const where = {};
    if (name) where['name'] = name;
    if (academyId) where['academyId'] = academyId;
    if (seniority) where['seniority'] = seniority;

    return this.trainerRepository.find({ where });
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: { subjects: true, trainerReviews: true },
    });
    if (!trainer)
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    return trainer;
  }

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const trainer = this.trainerRepository.create(createTrainerDto);
    await this.trainerRepository.save(trainer);
    return trainer;
  }

  async update(
    id: number,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    let trainer = await this.trainerRepository.findOneBy({ id });
    trainer = this.trainerRepository.merge(trainer, updateTrainerDto);
    await this.trainerRepository.save(trainer);
    return trainer;
  }

  async remove(id: number) {
    const result = await this.trainerRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('No trainer found with the provided id.');
    }
  }

  async findByUserId(userId: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({ where: { userId } });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  async updateByUserId(userId: number, dto: UpdateTrainerDto) {
    const t = await this.trainerRepository.findOne({ where: { userId } });
    if (!t) throw new NotFoundException('Trainer not found');
    this.trainerRepository.merge(t, dto);
    return this.trainerRepository.save(t);
  }

  async setAcademy(id: number, academyId: number | null) {
    const t = await this.trainerRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });
    if (!t) throw new NotFoundException('Trainer not found');

    // If academy changes (including to null), clear subjects
    const changed = (t.academyId ?? null) !== (academyId ?? null);
    t.academyId = academyId;
    if (changed) t.subjects = [];

    const saved = await this.trainerRepository.save(t);
    return saved; // FE will rehydrate subjectIds from this
  }

  async setSubjects(id: number, subjectIds: number[]) {
    const t = await this.trainerRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });
    if (!t) throw new NotFoundException('Trainer not found');
    if (!t.academyId) throw new BadRequestException('Assign academy first');

    // allow clearing
    if (!subjectIds?.length) {
      t.subjects = [];
      return this.trainerRepository.save(t);
    }

    const subs = await this.subjectRepository.findBy({ id: In(subjectIds) });

    // Ensure all requested ids exist
    if (subs.length !== subjectIds.length) {
      throw new BadRequestException('One or more subjects not found');
    }
    // Ensure all belong to trainer academy
    if (subs.some((s) => s.academyId !== t.academyId)) {
      throw new BadRequestException('Subject not in trainer academy');
    }

    t.subjects = subs;
    return this.trainerRepository.save(t);
  }
}
