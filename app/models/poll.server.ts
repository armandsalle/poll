import type { User, Poll, Answer } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Poll, Answer } from "@prisma/client";

export function createAnswer({
  title,
  pollId,
}: Pick<Answer, "title"> & {
  pollId: Poll["id"];
}) {
  return prisma.answer.create({
    data: {
      count: 0,
      title,
      poll: {
        connect: {
          id: pollId,
        },
      },
    },
  });
}

export function createPoll({
  body,
  title,
  userId,
}: Pick<Poll, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.poll.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function getPollListItems({ userId }: { userId: User["id"] }) {
  return prisma.poll.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getPoll({ id }: Pick<Poll, "id">) {
  return prisma.poll.findFirst({
    where: { id },
  });
}

export function getAnswers({ pollId }: Pick<Answer, "pollId">) {
  return prisma.answer.findMany({
    where: {
      pollId,
    },
  });
}

export function deletePoll({
  id,
  userId,
}: Pick<Poll, "id"> & { userId: User["id"] }) {
  return prisma.poll.deleteMany({
    where: { id, userId },
  });
}
