import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { Input } from "~/components/input";
import { TextArea } from "~/components/text-area";

import { createAnswer, createPoll } from "~/models/poll.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
    answers?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  const answers = formData.getAll("answers");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json<ActionData>(
      { errors: { body: "Body is required" } },
      { status: 400 }
    );
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return json<ActionData>(
      { errors: { answers: "Answer is required" } },
      { status: 400 }
    );
  }

  const poll = await createPoll({
    title,
    body,
    userId,
  });

  await Promise.all(
    answers.map(async (answer) => {
      await createAnswer({ title: answer.toString(), pollId: poll.id });
    })
  );

  return redirect(`/polls/${poll.id}`);
};

export default function NewPollPage() {
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const newAnswerRef = React.useRef<HTMLInputElement>(null);
  const [answers, setAnswers] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  const handleAddAnswerForm = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const value = newAnswerRef.current?.value;

    if (!value) return;

    if (typeof value !== "string" || value.length === 0) {
      return;
    }

    setAnswers((answers) => [...answers, value]);
  };

  return (
    <>
      <Form
        id="main-form"
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Input
          ref={titleRef}
          name="title"
          hasError={actionData?.errors?.title}
        />
        <TextArea
          ref={bodyRef}
          name="body"
          hasError={actionData?.errors?.body}
        />

        {answers.map((answer) => {
          return (
            <input
              readOnly
              key={answer.trim().split(" ").join("-")}
              name="answers"
              value={answer}
            />
          );
        })}

        <Input name="answer" ref={newAnswerRef} />
        <button type="button" onClick={handleAddAnswerForm}>
          Add answer
        </button>

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            form="main-form"
          >
            Save
          </button>
        </div>
      </Form>
    </>
  );
}
