// src/student/student.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(@InjectRepository(Student) private repo: Repository<Student>) {}

  async findAll(
    name?: string,
    academyId?: number,
    page?: number,
    sort?: string,
  ) {
    const take = 5;
    const where: any = {};
    if (name) where.name = name;
    if (academyId) where.academyId = academyId;

    const order: any = {};
    if (sort) order.name = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pageNum = page && page > 0 ? page : 1; // 1-based
    const skip = (pageNum - 1) * take;

    return this.repo.find({ where, take, skip, order });
  }

  async findOne(id: number) {
    const student = await this.repo.findOne({ where: { id } });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = this.repo.create(dto); // dto now contains address/telephone/dateOfBirth
    return this.repo.save(student);
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.repo.findOneBy({ id });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    this.repo.merge(student, dto);
    return this.repo.save(student);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (res.affected === 0)
      throw new NotFoundException('No student found with the provided id.');
  }

  async findByUserId(userId: number) {
    const s = await this.repo.findOne({ where: { userId } });
    if (!s) throw new NotFoundException('Student not found');
    return s;
  }

  async updateByUserId(userId: number, dto: UpdateStudentDto) {
    const student = await this.repo.findOne({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');
    this.repo.merge(student, dto);
    return this.repo.save(student);
  }
}
