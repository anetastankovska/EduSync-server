import { PartialType } from '@nestjs/swagger';
import { CreateStudentGradeDto } from './create-student-grade.dto';

export class UpdateStudentGradeDto extends PartialType(CreateStudentGradeDto) {}
