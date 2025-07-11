import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import {
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/util/role.enum';

@ApiTags('Student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOperation({
    summary:
      'Retrieves all students. Optionaly filters tre result by name and academy id. Provides pagination and sorting',
  })
  @ApiOkResponse({
    type: [Student],
    description: 'All students retrieved successfully',
  })
  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by student name',
  })
  @ApiQuery({
    name: 'academyId',
    required: false,
    type: Number,
    description: 'Filter by Academy ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Sort order (ASC or DESC)',
  })
  async findAll(
    @Query('name') name: string,
    @Query('academyId') academyId: number,
    @Query('page') page: number,
    @Query('sort') sort: string,
  ): Promise<Student[]> {
    return this.studentService.findAll(name, academyId, page, sort);
  }

  @ApiOperation({ summary: 'Retrieves student by id' })
  @ApiOkResponse({
    type: Student,
    description: 'Student retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Student> {
    return this.studentService.findOne(+id);
  }

  @ApiOperation({ summary: 'Creates a student' })
  @ApiCreatedResponse({
    type: Student,
    description: 'Student created successfully',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentService.create(createStudentDto);
  }

  @ApiOperation({ summary: 'Updates a student by id' })
  @ApiOkResponse({
    type: Student,
    description: 'Student updated successfully',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentService.update(+id, updateStudentDto);
  }

  @ApiOperation({
    summary: 'Deletes a student by id',
  })
  @ApiOkResponse({
    description: 'Student deleted successfully',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async remove(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      await this.studentService.remove(+id);
      res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Student successfully removed.',
      });
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: 'error',
        message: 'Failed to remove student. ' + error.message,
      });
    }
  }
}
