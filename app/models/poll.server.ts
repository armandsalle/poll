import type { Answer, Poll, User } from "@prisma/client";
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

export function getPoll({ id, userId }: Pick<Poll, "id" | "userId">) {
  return prisma.poll.findFirst({
    where: { id, userId },
    include: {
      Answer: {
        select: {
          count: true,
          id: true,
          title: true,
        },
      },
    },
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

export function vote({ id }: Pick<Answer, "id">) {
  return prisma.answer.update({
    where: {
      id,
    },
    data: {
      count: {
        increment: 1,
      },
    },
  });
}

export function getPublicPoll({ id }: Pick<Poll, "id">) {
  return prisma.poll.findFirst({
    where: { id, publish: true },
    select: {
      body: true,
      id: true,
      title: true,
      updatedAt: true,
      Answer: {
        select: {
          count: true,
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

export function publishPoll({
  id,
  userId,
  newState,
}: Pick<Poll, "id" | "userId"> & { newState: boolean }) {
  return prisma.poll.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      publish: newState,
    },
  });
}
