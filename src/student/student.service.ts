import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Subject } from 'src/subject/entities/subject.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student) private studentRepository: Repository<Student>,
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
  ) {}

  async findAll(
    name?: string,
    academyId?: number,
    page?: number,
    sort?: string,
    subjectId?: number, // <-- NEW
  ) {
    const take = 5;
    const pageNum = page && page > 0 ? page : 1; // 1-based
    const skip = (pageNum - 1) * take;

    // If no subject filter, keep your existing simple find()
    if (!subjectId) {
      const where: any = {};
      if (name) where.name = name;
      if (academyId) where.academyId = academyId;

      const order: any = {};
      if (sort) order.name = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      return this.studentRepository.find({ where, take, skip, order });
    }

    // With subject filter -> use a join on the M:N relation "student_subject"
    const qb = this.studentRepository
      .createQueryBuilder('s')
      .leftJoin('s.subjects', 'sub')
      .where('sub.id = :subjectId', { subjectId });

    if (name) qb.andWhere('s.name = :name', { name });
    if (academyId) qb.andWhere('s.academyId = :academyId', { academyId });

    if (sort) {
      qb.orderBy('s.name', sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    }

    qb.take(take).skip(skip);

    return qb.getMany();
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(dto);
    return this.studentRepository.save(student);
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    this.studentRepository.merge(student, dto);
    return this.studentRepository.save(student);
  }

  async remove(id: number) {
    const res = await this.studentRepository.delete(id);
    if (res.affected === 0)
      throw new NotFoundException('No student found with the provided id.');
  }

  async findByUserId(userId: number) {
    const s = await this.studentRepository.findOne({ where: { userId } });
    if (!s) throw new NotFoundException('Student not found');
    return s;
  }

  async updateByUserId(userId: number, dto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');
    this.studentRepository.merge(student, dto);
    return this.studentRepository.save(student);
  }

  async setAcademy(id: number, academyId: number | null) {
    const s = await this.studentRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });
    if (!s) throw new NotFoundException('Student not found'); // FIX text

    const changed = (s.academyId ?? null) !== (academyId ?? null);
    s.academyId = academyId;
    if (changed) s.subjects = [];

    const saved = await this.studentRepository.save(s);
    return saved;
  }

  async setSubjects(id: number, subjectIds: number[]) {
    const s = await this.studentRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });
    if (!s) throw new NotFoundException('Student not found');
    if (!s.academyId) throw new BadRequestException('Assign academy first');

    if (!subjectIds?.length) {
      s.subjects = [];
      return this.studentRepository.save(s);
    }

    const subs = await this.subjectRepository.findBy({ id: In(subjectIds) });

    if (subs.length !== subjectIds.length) {
      throw new BadRequestException('One or more subjects not found');
    }
    if (subs.some((x) => x.academyId !== s.academyId)) {
      throw new BadRequestException('Subject not in student academy');
    }

    s.subjects = subs;
    return this.studentRepository.save(s);
  }
}
