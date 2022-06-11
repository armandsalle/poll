import type { Password, User, UserRegistration } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  name: User["name"],
  email: User["email"],
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const confirmToken = nanoid();

  await prisma.userRegistration.delete({
    where: {
      email,
    },
  });

  return prisma.user.create({
    data: {
      name,
      email,
      confirmToken,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function confirmUserEmail(
  confirmToken: User["confirmToken"],
  token: string,
  email: User["email"]
) {
  if (confirmToken === token) {
    return prisma.user.update({
      where: {
        email,
      },
      data: {
        confirmToken: "",
        confirmedEmail: true,
        confirmedEmailAt: new Date(),
      },
    });
  }
}

function createRegistrationCode() {
  const getId = () => nanoid(4).replace(/[-_]/g, "").toUpperCase();

  return getId() + "-" + getId() + "-" + getId();
}

export async function createUserRegistration(email: UserRegistration["email"]) {
  return prisma.userRegistration.create({
    data: {
      email,
      code: createRegistrationCode(),
    },
  });
}

export async function getUserRegistrationByEmail(
  email: UserRegistration["email"]
) {
  return prisma.userRegistration.findUnique({
    where: {
      email,
    },
  });
}

export async function validateUserRegistration(
  email: UserRegistration["email"]
) {
  return prisma.userRegistration.update({
    where: {
      email,
    },
    data: {
      valid: true,
    },
  });
}
