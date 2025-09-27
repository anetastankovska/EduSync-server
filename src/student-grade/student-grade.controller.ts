import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StudentGradeService } from './student-grade.service';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/util/role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StudentGrade } from './entities/student-grade.entity';

@ApiTags('StudentGrade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students/:studentId/grades')
export class StudentGradeController {
  constructor(private readonly service: StudentGradeService) {}

  @ApiOperation({
    summary: 'Trainer leaves feedback (grade/comment) for a student',
  })
  @ApiCreatedResponse({ type: StudentGrade, description: 'Feedback saved' })
  @Post()
  @Roles(Role.Trainer, Role.Admin)
  create(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() dto: CreateStudentGradeDto,
    @Req() req: any,
  ) {
    // trainer id comes from JWT payload
    return this.service.createForStudent(studentId, req.user.sub, dto);
  }
}
