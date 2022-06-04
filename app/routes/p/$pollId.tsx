import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import cookie from "cookie";
import invariant from "tiny-invariant";
import { Container } from "~/components/atoms/container";
import type { Answer, Poll } from "~/models/poll.server";
import { vote } from "~/models/poll.server";
import { getPublicPoll } from "~/models/poll.server";
import type { User } from "~/models/user.server";
import { getVotePercentage } from "~/utils/utils";

type LoaderData = {
  poll: Pick<Poll, "body" | "updatedAt" | "title" | "id">;
  answers: Pick<Answer, "count" | "id" | "title">[];
  user: Pick<User, "name">;
  vote?: string;
  totalVote: number;
};

type ActionData = {
  errors?: {
    id?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.pollId, "pollId not found");

  const cookies = cookie.parse(request.headers.get("Cookie") || "");

  const poll = await getPublicPoll({ id: params.pollId });

  if (!poll) {
    throw new Response("Not Found", { status: 404 });
  }

  const vote = cookies[params.pollId];

  const totalVote = poll.Answer.reduce<number>((prev, current) => {
    return current.count + prev;
  }, 0);

  return json<LoaderData>({
    poll,
    answers: poll.Answer,
    user: poll.user,
    vote,
    totalVote,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.pollId, "pollId not found");
  const res = await request.formData();
  Object.fromEntries(res);
  const id = res.get("_action");

  if (typeof id !== "string" || id.length === 0) {
    return json<ActionData>(
      { errors: { id: "Id is required" } },
      { status: 400 }
    );
  }

  await vote({ id });

  return redirect("/p/" + params.pollId, {
    headers: {
      "Set-Cookie": cookie.serialize(params.pollId, id, {
        maxAge: 60 * 60 * 24 * 365,
      }),
    },
  });
};

export default function PollDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const userHasVoted = data.answers.some((answer) => data.vote === answer.id);

  // vote pour chaque option * 100 / total des votes
  return (
    <Container as="main">
      <h3>
        {data.poll.title} by {data.user.name}
      </h3>
      <p>{data.poll.body}</p>
      <hr />
      {data.answers.map((answer) => (
        <Form
          key={answer.id}
          method="post"
          onSubmit={(e) => {
            if (userHasVoted) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            value={answer.id}
            name="_action"
            disabled={data.vote === answer.id}
            style={{
              textDecoration: data.vote === answer.id ? "underline" : "none",
            }}
          >
            {answer.title} - {answer.count} -{" "}
            <b>{getVotePercentage(answer.count, data.totalVote)}%</b>
          </button>
        </Form>
      ))}
    </Container>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Poll not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
