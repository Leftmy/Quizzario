import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial quizzes into the database...');

  // Delete existing data to allow idempotent seeding
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();

  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'General Knowledge Quiz',
      questions: {
        create: [
          {
            type: 'BOOLEAN',
            text: 'The Earth is the third planet from the Sun.',
            answers: JSON.stringify(['true']),
          },
          {
            type: 'INPUT',
            text: 'What is the capital of France?',
            answers: JSON.stringify(['Paris']),
          },
          {
            type: 'CHECKBOX',
            text: 'Which of the following are primary colors?',
            options: JSON.stringify(['Red', 'Green', 'Blue', 'Yellow']),
            answers: JSON.stringify(['Red', 'Blue', 'Yellow']),
          },
        ],
      },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Web Development Basics',
      questions: {
        create: [
          {
            type: 'BOOLEAN',
            text: 'HTML stands for HyperText Markup Language.',
            answers: JSON.stringify(['true']),
          },
          {
            type: 'INPUT',
            text: 'Which HTML tag is used for the largest heading?',
            answers: JSON.stringify(['h1']),
          },
          {
            type: 'CHECKBOX',
            text: 'Which of the following are valid JavaScript data types?',
            options: JSON.stringify(['String', 'Boolean', 'Integer', 'Undefined']),
            answers: JSON.stringify(['String', 'Boolean', 'Undefined']),
          },
        ],
      },
    },
  });

  console.log(`Successfully seeded ${quiz1.title} and ${quiz2.title}!`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
