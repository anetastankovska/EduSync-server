import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async findAll(
    name?: string,
    academyId?: number,
    page?: number,
    sort?: string,
  ) {
    // return this.studentRepository.find({ relations: { studentDetail: true } }); // if we want to include the student details
    const take = 5;
    const options = {
      // relations: ['studentDetail', 'academy'],
      take,
      skip: page ? page * take : 0,
      where: {},
      order: {},
    };

    if (name) {
      options.where['name'] = name;
    }

    if (academyId) {
      options.where['academyId'] = academyId;
    }

    if (sort) {
      options.order['name'] = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }
    return this.studentRepository.find(options);
  }

  async findOne(id: number) {
    return this.studentRepository.findOne({
      where: { id },
      relations: { studentDetail: true },
    });
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    await this.studentRepository.save(student);
    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    let student = await this.studentRepository.findOneBy({ id });
    student = this.studentRepository.merge(student, updateStudentDto);
    await this.studentRepository.save(student);
    return student;
  }

  async remove(id: number) {
    const result = await this.studentRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('No student found with the provided id.');
    }
  }
}
