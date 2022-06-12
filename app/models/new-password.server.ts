import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { prisma } from "~/db.server";

function createToken() {
  const getId = () => nanoid(4).replace(/[-_]/g, "").toUpperCase();

  return getId() + "-" + getId() + "-" + getId();
}

export function createNewPasswordToken(userId: User["id"]) {
  return prisma.newPasswordRequest.create({
    data: {
      token: createToken(),
      userId,
    },
  });
}

export function getLastPasswordToken(userId: User["id"]) {
  return prisma.newPasswordRequest.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });
}

export async function updateUserPassword(
  userId: User["id"],
  newPassord: Password["hash"]
) {
  const hashedPassword = await bcrypt.hash(newPassord, 10);
  return prisma.password.update({
    where: {
      userId,
    },
    data: {
      hash: hashedPassword,
    },
    select: {
      userId: true,
    },
  });
}
