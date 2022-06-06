import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { nanoid } from "nanoid";
import type { FormEvent } from "react";
import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import { Input } from "~/components/atoms/input";
import { Outlet } from "~/components/atoms/outlet";
import { TextArea } from "~/components/atoms/text-area";
import { createAnswer, createPoll } from "~/models/poll.server";
import { requireUserId } from "~/plugins/session.server";

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
      if (typeof answer !== "string" || answer.length === 0) {
        return;
      }
      await createAnswer({ title: answer.toString(), pollId: poll.id });
    })
  );

  return redirect(`/polls/${poll.id}`);
};

type answer = {
  id: string;
  value: string;
};

export default function NewPollPage() {
  const actionData = useActionData() as ActionData;
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const answerInput = useRef<HTMLInputElement>(null);
  const [answers, setAnswers] = useImmer<answer[]>([]);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  const handleAddAnswerForm = (e: FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const value = data.get("answer");

    if (typeof value !== "string" || value.length === 0) {
      return;
    }

    setAnswers((draft) => {
      draft.push({ id: nanoid(), value });
    });

    if (answerInput.current) {
      answerInput.current.value = "";
      answerInput.current.focus();
    }
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
              type="hidden"
              key={answer.id}
              name="answers"
              value={answer.value}
            />
          );
        })}
      </Form>

      <Form
        id="answer-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleAddAnswerForm(event);
        }}
      >
        <Outlet vertical={8}>
          {answers.map((answer, i) => {
            return (
              <label key={i}>
                <input
                  name="answers"
                  value={answer.value}
                  onChange={(e) =>
                    setAnswers((draft) => {
                      const i = draft.findIndex((v) => v.id === answer.id);
                      draft[i].value = e.target.value;
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    setAnswers((draft) => {
                      const i = draft.findIndex((v) => v.id === answer.id);
                      draft.splice(i, 1);
                    });
                  }}
                >
                  delete
                </button>
              </label>
            );
          })}
        </Outlet>
        <Input name="answer" ref={answerInput} />
        <button type="submit">Add answer</button>
      </Form>

      <button type="submit" form="main-form">
        Save
      </button>
    </>
  );
}
