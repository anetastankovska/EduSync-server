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
    // return this.academyRepository.find();
  }

  // async findOne(id: number): Promise<Academy> {
  //   return this.academyRepository.findOneBy({id});
  // }

  async findOne(id: number): Promise<Academy> {
    // findOneOrFail from a repository typically throws an EntityNotFoundError if no entity is found with the provided criteria
    try {
      return await this.academyRepository.findOneByOrFail({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(`Academy with ID ${id} not found`);
      }
      throw error; // rethrow the error if it's not the expected error type
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
    let academy = await this.academyRepository.findOneBy({ id });
    academy = this.academyRepository.merge(academy, updateAcademyDto);
    await this.academyRepository.save(academy);
    return academy;
  }

  async remove(id: number): Promise<void> {
    // !!! need to add await here because we need the check the result from the operation
    const result = await this.academyRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('No academy found with the provided id.');
    }
  }

  // async findByName(name: string): Promise<Academy[]> {
  //   return this.academyRepository
  //     .createQueryBuilder('academy')
  //     .where('LOWER(academy.name) = LOWER(:name)', { name }) // we should firs normalize the string
  //     .getMany();
  // }

  async findByName(name: string): Promise<Academy[]> {
    // Convert the input name to lowercase in JavaScript
    const lowercasedName = name.toLowerCase();

    // Use LOWER() in SQL to make the comparison case-insensitive
    const query = `SELECT * FROM academy WHERE LOWER(name) = LOWER($1)`;
    const academies = await this.academyRepository.query(query, [
      lowercasedName,
    ]);

    return academies;
  }
}
