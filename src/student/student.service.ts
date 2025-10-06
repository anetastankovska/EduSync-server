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
    subjectId?: number,
  ) {
    const take = 5;
    const pageNum = page && page > 0 ? page : 1; // 1-based
    const skip = (pageNum - 1) * take;

    // No subject filter → simple find with relations
    if (!subjectId) {
      const where: any = {};
      if (name) where.name = name;
      if (academyId) where.academyId = academyId;

      const order: any = {};
      if (sort) order.name = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      return this.studentRepository.find({
        where,
        take,
        skip,
        order,
        relations: { subjects: true }, // <-- include subjects for preselection
      });
    }

    // With subject filter → join M:N and also select subjects
    const qb = this.studentRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.subjects', 'sub') // <-- include subjects
      .where('sub.id = :subjectId', { subjectId })
      .distinct(true); // avoid duplicates when a student matches multiple rows

    if (name) qb.andWhere('s.name = :name', { name });
    if (academyId) qb.andWhere('s.academyId = :academyId', { academyId });

    if (sort) {
      qb.orderBy('s.name', sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    }

    qb.take(take).skip(skip);

    return qb.getMany();
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: { subjects: true, studentGrades: true },
    });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(dto);
    return this.studentRepository.save(student);
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    // 1) update academyId only if provided
    if (dto.academyId !== undefined) {
      await this.studentRepository.update(id, {
        academyId: dto.academyId ?? null,
      });
    }

    // 2) sync subjects only if provided
    if (dto.subjectIds !== undefined) {
      const rel = this.studentRepository
        .createQueryBuilder()
        .relation(Student, 'subjects')
        .of(id);

      // load current subject ids
      const current = await rel.loadMany<{ id: number }>();
      const have = new Set(current.map((s) => s.id));
      const want = new Set(dto.subjectIds);

      const toAdd = dto.subjectIds.filter((x) => !have.has(x));
      const toRemove = [...have].filter((x) => !want.has(x));

      if (toAdd.length) await rel.add(toAdd);
      if (toRemove.length) await rel.remove(toRemove);
    }

    // return fresh state
    const updated = await this.studentRepository.findOne({
      where: { id },
      relations: { academy: true, subjects: true },
    });
    if (!updated)
      throw new NotFoundException(`Student with ID ${id} not found`);
    return updated;
  }

  async remove(id: number) {
    const res = await this.studentRepository.delete(id);
    if (res.affected === 0)
      throw new NotFoundException('No student found with the provided id.');
  }

  async findByUserId(userId: number) {
    const student = await this.studentRepository.findOne({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
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
