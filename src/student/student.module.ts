import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/subject/entities/subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Subject])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
