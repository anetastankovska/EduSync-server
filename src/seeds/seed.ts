/* eslint-disable no-console */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/user/entities/user.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Student } from 'src/student/entities/student.entity';
import { Academy } from 'src/academy/entities/academy.entity';
import { Subject } from 'src/subject/entities/subject.entity';

import { Role } from 'src/util/role.enum';
import { Difficulty } from 'src/util/difficulty.enum';
import { Seniority } from 'src/util/seniority.enum';

// ---------- DATA SOURCE ----------
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Trainer, Student, Academy, Subject],
  synchronize: false,
  logging: false,
});

// ---------- HELPERS ----------
async function hashPassword(plain: string) {
  const saltRounds = 12;
  return bcrypt.hash(plain, saltRounds);
}

const SEED = {
  admin: { email: 'admin@edusync.local', password: 'AdminPass!123' },
  trainerUser: { email: 'trainer@edusync.local', password: 'TrainerPass!123' },
  trainer: {
    name: 'Jane Trainer',
    age: 32,
    seniority: Seniority.Trainer as Seniority | null,
  },
  studentUser: { email: 'student@edusync.local', password: 'StudentPass!123' },
  student: {
    name: 'John Student',
    address: '123 Maple St',
    telephone: '555-0101',
  },
  academy: {
    name: 'Web Development Bootcamp',
    description: '12-week intensive bootcamp',
    startDate: '2025-01-20',
    endDate: '2025-04-11',
    price: 1999,
  },
  // 👇 Two subjects now
  subjects: [
    {
      name: 'Angular Fundamentals',
      numberOfClasses: 24,
      difficulty: Difficulty.Medium,
    },
    {
      name: 'Node.js Basics',
      numberOfClasses: 20,
      difficulty: Difficulty.Easy,
    },
  ] as Array<{ name: string; numberOfClasses: number; difficulty: Difficulty }>,
};

async function seed() {
  await AppDataSource.initialize();
  const ds = AppDataSource;

  const userRepo = ds.getRepository(User);
  const trainerRepo = ds.getRepository(Trainer);
  const studentRepo = ds.getRepository(Student);
  const academyRepo = ds.getRepository(Academy);
  const subjectRepo = ds.getRepository(Subject);

  console.log('> Seeding start');

  // ========== USERS ==========
  // ADMIN
  let adminUser = await userRepo.findOne({
    where: { email: SEED.admin.email },
  });
  if (!adminUser) {
    adminUser = userRepo.create({
      email: SEED.admin.email,
      password: await hashPassword(SEED.admin.password),
      role: Role.Admin,
    });
    adminUser = await userRepo.save(adminUser);
    console.log('  + Admin user created:', adminUser.email);
  } else {
    console.log('  = Admin user exists:', adminUser.email);
  }

  // TRAINER USER
  let trainerUser = await userRepo.findOne({
    where: { email: SEED.trainerUser.email },
  });
  if (!trainerUser) {
    trainerUser = userRepo.create({
      email: SEED.trainerUser.email,
      password: await hashPassword(SEED.trainerUser.password),
      role: Role.Trainer,
    });
    trainerUser = await userRepo.save(trainerUser);
    console.log('  + Trainer user created:', trainerUser.email);
  } else {
    console.log('  = Trainer user exists:', trainerUser.email);
  }

  // STUDENT USER
  let studentUser = await userRepo.findOne({
    where: { email: SEED.studentUser.email },
  });
  if (!studentUser) {
    studentUser = userRepo.create({
      email: SEED.studentUser.email,
      password: await hashPassword(SEED.studentUser.password),
      role: Role.Student,
    });
    studentUser = await userRepo.save(studentUser);
    console.log('  + Student user created:', studentUser.email);
  } else {
    console.log('  = Student user exists:', studentUser.email);
  }

  // ========== ACADEMY ==========
  let academy = await academyRepo.findOne({
    where: { name: SEED.academy.name },
  });
  if (!academy) {
    academy = academyRepo.create({
      name: SEED.academy.name,
      description: SEED.academy.description,
      startDate: SEED.academy.startDate,
      endDate: SEED.academy.endDate,
      price: SEED.academy.price,
    });
    academy = await academyRepo.save(academy);
    console.log('  + Academy created:', academy.name);
  } else {
    console.log('  = Academy exists:', academy.name);
  }

  // ========== TRAINER PROFILE ==========
  let trainer = await trainerRepo.findOne({
    where: { userId: trainerUser.id },
  });
  if (!trainer) {
    trainer = trainerRepo.create({
      user: trainerUser,
      userId: trainerUser.id,
      name: SEED.trainer.name,
      email: trainerUser.email,
      age: SEED.trainer.age,
      seniority: SEED.trainer.seniority,
      academy,
      academyId: academy.id,
    });
    trainer = await trainerRepo.save(trainer);
    console.log('  + Trainer profile created:', trainer.name);
  } else {
    console.log('  = Trainer profile exists:', trainer.name);
  }

  // ========== STUDENT PROFILE ==========
  let student = await studentRepo.findOne({
    where: { userId: studentUser.id },
  });
  if (!student) {
    student = studentRepo.create({
      user: studentUser,
      userId: studentUser.id,
      name: SEED.student.name,
      email: studentUser.email,
      academy,
      academyId: academy.id,
      address: SEED.student.address,
      telephone: SEED.student.telephone,
      dateOfBirth: null,
    });
    student = await studentRepo.save(student);
    console.log('  + Student profile created:', student.name);
  } else {
    console.log('  = Student profile exists:', student.name);
  }

  // ========== SUBJECTS (two) ==========
  const createdSubjects: Subject[] = [];
  for (const s of SEED.subjects) {
    let subject = await subjectRepo.findOne({
      where: { name: s.name, academyId: academy.id },
    });
    if (!subject) {
      subject = subjectRepo.create({
        name: s.name,
        numberOfClasses: s.numberOfClasses,
        difficulty: s.difficulty,
        academy,
        academyId: academy.id,
        trainer,
        trainerId: trainer.id,
      });
      subject = await subjectRepo.save(subject);
      console.log('  + Subject created:', subject.name);
    } else {
      console.log('  = Subject exists:', subject.name);
    }
    createdSubjects.push(subject);
  }

  // ========== ENROLL STUDENT TO ALL CREATED SUBJECTS ==========
  const enrolled = await studentRepo.findOne({
    where: { id: student.id },
    relations: { subjects: true },
  });
  const currentSubjects = new Map<number, Subject>(
    (enrolled?.subjects || []).map((x) => [x.id, x]),
  );

  let addedCount = 0;
  for (const subject of createdSubjects) {
    if (!currentSubjects.has(subject.id)) {
      enrolled!.subjects = [...(enrolled!.subjects || []), subject];
      addedCount++;
    }
  }
  if (addedCount > 0) {
    await studentRepo.save(enrolled!);
    console.log(`  + Enrolled ${student.name} to ${addedCount} subject(s)`);
  } else {
    console.log(`  = ${student.name} already enrolled to all seeded subjects`);
  }

  console.log('> Seeding complete');
  await ds.destroy();
}

seed().catch(async (err) => {
  console.error('> Seeding failed:', err);
  try {
    await AppDataSource.destroy();
  } catch {}
  process.exit(1);
});
