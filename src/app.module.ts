import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AcademyModule } from './academy/academy.module';
import { StudentModule } from './student/student.module';
import { SubjectModule } from './subject/subject.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TrainerModule } from './trainer/trainer.module';
import { AuthModule } from './auth/auth.module';
import { StudentGradeModule } from './student-grade/student-grade.module';
import { TrainerReviewModule } from './trainer-review/trainer-review.module';

// @nestjs/config is a configuration module for Nest based on the dotenv

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // If set to true, you will not need to import ConfigModule in other modules once it's been loaded in the root module (e.g., AppModule)
      envFilePath: '.env', // By default, the package looks for a .env file in the root directory of the application, so this is now optional
      // ignoreEnvFile - if set to true, it will disable reading of the .env file
    }),
    AcademyModule,
    StudentModule,
    SubjectModule,
    DatabaseModule,
    TrainerModule,
    AuthModule,
    StudentGradeModule,
    TrainerReviewModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
      // Example options (customize as needed)
      useValue: {
        whitelist: true, // Only allows properties decorated with @ApiModelProperty() to be used during validation
        transform: true, // Automatically transforms incoming plain objects (POJOs) to instances of the respective DTO class
        forbidNonWhitelisted: true, // Throws an error if incoming data contains properties that are not decorated with @ApiModelProperty()
      },
    },
  ],
})
export class AppModule {}
