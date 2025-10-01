import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubjectToStudentGradeXXXX implements MigrationInterface {
  name = 'AddSubjectToStudentGradeXXXX';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_grade"
      ADD COLUMN "subjectId" integer NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_student_grade_subjectId" ON "student_grade" ("subjectId")
    `);
    await queryRunner.query(`
      ALTER TABLE "student_grade"
      ADD CONSTRAINT "FK_student_grade_subject"
      FOREIGN KEY ("subjectId") REFERENCES "subject"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "student_grade"
      ADD CONSTRAINT "UQ_student_trainer_subject"
      UNIQUE ("studentId","trainerId","subjectId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_grade" DROP CONSTRAINT "UQ_student_trainer_subject"
    `);
    await queryRunner.query(`
      ALTER TABLE "student_grade" DROP CONSTRAINT "FK_student_grade_subject"
    `);
    await queryRunner.query(`
      DROP INDEX "IDX_student_grade_subjectId"
    `);
    await queryRunner.query(`
      ALTER TABLE "student_grade" DROP COLUMN "subjectId"
    `);
  }
}
