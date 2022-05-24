import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Poll, Answer } from "~/models/poll.server";
import { getAnswers } from "~/models/poll.server";
import { getPoll, deletePoll } from "~/models/poll.server";
import { requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

type LoaderData = {
  poll: Poll;
  answers: Answer[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.pollId, "pollId not found");

  const poll = await getPoll({ id: params.pollId });
  if (!poll) {
    throw new Response("Not Found", { status: 404 });
  }
  const answers = await getAnswers({ pollId: poll.id });

  return json<LoaderData>({ poll, answers });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.pollId, "pollId not found");

  await deletePoll({ userId, id: params.pollId });

  return redirect("/polls");
};

export default function PollDetailsPage() {
  const data = useLoaderData() as LoaderData;
  const user = useOptionalUser();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.poll.title}</h3>
      <p className="py-6">{data.poll.body}</p>
      <hr className="my-4" />
      {data.answers.map((answer) => (
        <p key={answer.id}>{answer.title}</p>
      ))}
      <hr className="my-4" />
      {user && (
        <Form method="post">
          <button
            type="submit"
            className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Delete
          </button>
        </Form>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
