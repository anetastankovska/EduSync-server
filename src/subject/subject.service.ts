import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) {}

  async findAll(difficulty?: string, academyId?: number): Promise<Subject[]> {
    const where = {};
    if (difficulty) where['difficulty'] = difficulty;
    if (academyId) where['academyId'] = academyId;

    return this.subjectRepository.find({ where });
  }

  async findOne(id: number): Promise<Subject> {
    // findOneOrFail from a repository typically throws an EntityNotFoundError if no entity is found with the provided criteria
    try {
      return await this.subjectRepository.findOneByOrFail({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      throw error; // rethrow the error if it's not the expected error type
    }
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const subject = this.subjectRepository.create(createSubjectDto);
    await this.subjectRepository.save(subject);
    return subject;
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    let subject = await this.subjectRepository.findOneBy({ id });
    subject = this.subjectRepository.merge(subject, updateSubjectDto);
    await this.subjectRepository.save(subject);
    return subject;
  }

  async remove(id: number) {
    const result = await this.subjectRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('No subject found with the provided id.');
    }
  }
}
