import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Answer, Poll } from "~/models/poll.server";
import { getAnswers } from "~/models/poll.server";
import { deletePoll, getPoll, publishPoll } from "~/models/poll.server";
import { requireUserId } from "~/plugins/session.server";

type LoaderData = {
  poll: Poll;
  answers: Answer[];
};

type ActionData = {
  errors?: {
    id?: string;
    publish?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.pollId, "pollId not found");

  const poll = await getPoll({ id: params.pollId, userId });
  if (!poll) {
    throw new Response("Not Found", { status: 404 });
  }
  const answers = await getAnswers({ pollId: poll.id });

  return json<LoaderData>({ poll, answers });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.pollId, "pollId not found");

  const data = await request.formData();
  const action = data.get("_action");

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>(
      { errors: { id: "Action is required" } },
      { status: 400 }
    );
  }

  if (action === "delete") {
    await deletePoll({ userId, id: params.pollId });
    return redirect("/polls");
  }

  if (action === "publish") {
    const publishInputValue = data.get("publish");
    if (
      typeof publishInputValue !== "string" ||
      !["true", "false"].includes(publishInputValue)
    ) {
      return json<ActionData>(
        { errors: { publish: "Publish input value is required" } },
        { status: 400 }
      );
    }
    const isPublished = publishInputValue === "true" ? true : false;
    await publishPoll({ userId, id: params.pollId, newState: !isPublished });
    return redirect("/polls/" + params.pollId);
  }

  return null;
};

export default function PollDetailsPage() {
  const data = useLoaderData() as LoaderData;
  // const transition = useTransition();

  return (
    <div>
      <h3>{data.poll.title}</h3>
      <p>{data.poll.body}</p>
      <hr />
      {data.answers.map((answer) => (
        <p key={answer.id}>
          {answer.title} - {answer.count}
        </p>
      ))}
      <hr />
      {data.poll.publish && (
        <Link
          to={`/p/${data.poll.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          See the poll
        </Link>
      )}
      <Form method="post">
        <input
          type="hidden"
          name="publish"
          value={data.poll.publish ? "true" : "false"}
        />
        <button type="submit" name="_action" value="publish">
          Publish : {data.poll.publish ? "Yes" : "No"}
        </button>
      </Form>

      <Form method="post">
        <button type="submit" name="_action" value="delete">
          Delete
        </button>
      </Form>
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
    return <div>Poll not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
