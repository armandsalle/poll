import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const name = "Armand";
  const email = "admin@admin.com";
  const password = "admin123";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash(password, 10);
  const confirmToken = "";

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      confirmToken,
      confirmedEmail: true,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const poll = await prisma.poll.create({
    data: {
      title: "Do you have a floof?",
      body: "Floofs are squeeshy",
      userId: admin.id,
    },
  });

  const answers = [{ title: "Yes!" }, { title: "Of course!" }];

  async function createAnswer(title: string) {
    await prisma.answer.create({
      data: {
        title,
        count: 0,
        pollId: poll.id,
      },
    });
  }

  answers.forEach(({ title }) => {
    createAnswer(title);
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
