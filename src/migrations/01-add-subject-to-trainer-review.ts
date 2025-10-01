import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubjectToTrainerReviewXXXX implements MigrationInterface {
  name = 'AddSubjectToTrainerReviewXXXX';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "trainer_review"
      ADD COLUMN "subjectId" integer NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_trainer_review_subjectId" ON "trainer_review" ("subjectId")
    `);
    await queryRunner.query(`
      ALTER TABLE "trainer_review"
      ADD CONSTRAINT "FK_trainer_review_subject"
      FOREIGN KEY ("subjectId") REFERENCES "subject"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "trainer_review"
      ADD CONSTRAINT "UQ_trainer_review_student_trainer_subject"
      UNIQUE ("studentId","trainerId","subjectId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "trainer_review" DROP CONSTRAINT "UQ_trainer_review_student_trainer_subject"
    `);
    await queryRunner.query(`
      ALTER TABLE "trainer_review" DROP CONSTRAINT "FK_trainer_review_subject"
    `);
    await queryRunner.query(`
      DROP INDEX "IDX_trainer_review_subjectId"
    `);
    await queryRunner.query(`
      ALTER TABLE "trainer_review" DROP COLUMN "subjectId"
    `);
  }
}
