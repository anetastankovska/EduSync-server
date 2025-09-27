// src/student/student.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  Put,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/util/role.enum';

@ApiTags('Student')
@ApiBearerAuth()
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ---------- STATIC 'me' ROUTES FIRST ----------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get my student profile (by JWT user id)' })
  @ApiOkResponse({ description: 'Student loaded' })
  getMe(@Req() req: any) {
    return this.studentService.findByUserId(req.user.userId); // access 'userId' here, not 'sub'
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update my student details' })
  @ApiOkResponse({ description: 'Student updated' })
  updateMe(@Req() req: any, @Body() dto: UpdateStudentDto) {
    return this.studentService.updateByUserId(req.user.sub, dto);
  }

  // ---------- COLLECTION & CREATE ----------
  @ApiOperation({
    summary:
      'Retrieves all students. Optionally filters by name and academyId. Supports pagination & sorting',
  })
  @ApiOkResponse({
    type: [Student],
    description: 'All students retrieved successfully',
  })
  @Get()
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'academyId', required: false, type: Number })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '1-based page index',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'ASC or DESC (by name)',
  })
  async findAll(
    @Query('name') name?: string,
    @Query('academyId') academyId?: string, // optional, no ParseIntPipe
    @Query('page') page?: string, // optional
    @Query('sort') sort?: string, // optional
  ): Promise<Student[]> {
    return this.studentService.findAll(
      name,
      academyId ? Number(academyId) : undefined,
      page ? Number(page) : undefined,
      sort,
    );
  }

  @ApiOperation({ summary: 'Creates a student' })
  @ApiCreatedResponse({
    type: Student,
    description: 'Student created successfully',
  })
  @UseGuards(JwtAuthGuard) // add Roles(...) if only admins/trainers may create
  @Post()
  async create(@Body() dto: CreateStudentDto): Promise<Student> {
    return this.studentService.create(dto);
  }

  // ---------- DYNAMIC ':id' ROUTES LAST ----------
  @ApiOperation({ summary: 'Retrieves a student by id' })
  @ApiOkResponse({
    type: Student,
    description: 'Student retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentService.findOne(id);
  }

  @ApiOperation({ summary: 'Updates a student by id' })
  @ApiOkResponse({ type: Student, description: 'Student updated successfully' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentService.update(id, dto);
  }

  @ApiOperation({ summary: 'Deletes a student by id' })
  @ApiOkResponse({ description: 'Student deleted successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: string; message: string }> {
    await this.studentService.remove(id);
    return { status: 'success', message: 'Student successfully removed.' };
  }

  @Patch(':id/academy')
  updateAcademy(
    @Param('id', ParseIntPipe) id: number,
    @Body('academyId', ParseIntPipe) academyId: number,
  ) {
    return this.studentService.setAcademy(id, academyId);
  }

  @Put(':id/subjects')
  setSubjects(@Param('id', ParseIntPipe) id: number, @Body() dto) {
    return this.studentService.setSubjects(id, dto.subjectIds);
  }
}
