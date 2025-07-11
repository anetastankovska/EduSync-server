import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { Trainer } from './entities/trainer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
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
}
