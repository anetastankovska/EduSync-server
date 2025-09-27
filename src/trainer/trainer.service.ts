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
    try {
      return await this.trainerRepository.findOneByOrFail({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(`Trainer with ID ${id} not found`);
      }
      throw error;
    }
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

  async setAcademy(id: number, academyId: number) {
    const t = await this.trainerRepository.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Trainer not found');
    t.academyId = academyId ?? null;
    return this.trainerRepository.save(t);
  }

  async setSubjects(id: number, subjectIds: number[]) {
    const t = await this.trainerRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });
    if (!t) throw new NotFoundException('Trainer not found');
    if (!t.academyId) throw new BadRequestException('Assign academy first');

    const subs = await this.subjectRepository.findBy({ id: In(subjectIds) });
    // ensure all subjects belong to trainer’s academy
    if (subs.some((s) => s.academyId !== t.academyId)) {
      throw new BadRequestException('Subject not in trainer academy');
    }
    t.subjects = subs;
    return this.trainerRepository.save(t);
  }
}
