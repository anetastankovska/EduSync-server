import { Module } from '@nestjs/common';
import { StudentGradeService } from './student-grade.service';
import { StudentGradeController } from './student-grade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentGrade } from './entities/student-grade.entity';
import { Student } from 'src/student/entities/student.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentGrade, Student, Trainer])],
  providers: [StudentGradeService],
  controllers: [StudentGradeController],
  exports: [TypeOrmModule, StudentGradeService],
})
export class StudentGradeModule {}
