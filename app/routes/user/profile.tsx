import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { deleteUserByEmail, getUserById } from "~/models/user.server";
import { requireUserId } from "~/plugins/session.server";

type ActionData = {
  errors?: {
    action?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  return json({});
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const data = await request.formData();

  const user = await getUserById(userId);

  if (!user) {
    return redirect(".");
  }
  const action = data.get("_action");

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>(
      { errors: { action: "Action is required" } },
      { status: 400 }
    );
  }

  if (action === "delete") {
    await deleteUserByEmail(user.email);
    return redirect(".");
  }

  return null;
};

export default function Profile() {
  return (
    <section>
      <Form method="post">
        <button type="submit" name="_action" value="delete">
          Delete account
        </button>
      </Form>
    </section>
  );
}
