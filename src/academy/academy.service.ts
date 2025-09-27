import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Academy } from './entities/academy.entity';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(Academy)
    private academyRepository: Repository<Academy>,
  ) {}

  async findAll(): Promise<Academy[]> {
    return this.academyRepository.find({
      relations: { students: true, subjects: true, trainers: true },
    });
  }

  async findOne(id: number): Promise<Academy> {
    try {
      return await this.academyRepository.findOneOrFail({
        where: { id },
        relations: { students: true, subjects: true, trainers: true },
      });
    } catch (error) {
      throw new NotFoundException(`Academy with ID ${id} not found`);
    }
  }

  async create(createAcademyDto: CreateAcademyDto): Promise<Academy> {
    const academy = this.academyRepository.create(createAcademyDto);
    await this.academyRepository.save(academy);
    return academy;
  }

  async update(
    id: number,
    updateAcademyDto: UpdateAcademyDto,
  ): Promise<Academy> {
    const academy = await this.academyRepository.findOne({ where: { id } });
    if (!academy)
      throw new NotFoundException(`Academy with ID ${id} not found`);

    const merged = this.academyRepository.merge(academy, updateAcademyDto);
    await this.academyRepository.save(merged);
    return merged;
  }

  async remove(id: number): Promise<void> {
    // !!! need to add await here because we need the check the result from the operation
    const result = await this.academyRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Academy with ID ${id} not found`);
    }
  }

  async findByName(name: string): Promise<Academy[]> {
    return this.academyRepository
      .createQueryBuilder('academy')
      .where('academy.name ILIKE :name', { name }) // exact match ignoring case
      .getMany();
  }
}
