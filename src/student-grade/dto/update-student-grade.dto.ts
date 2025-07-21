import { PartialType } from '@nestjs/swagger';
import { CreateStudentGradeDto } from './create-student-grate.dto';

export class UpdateStudentGradeDto extends PartialType(CreateStudentGradeDto) {}
