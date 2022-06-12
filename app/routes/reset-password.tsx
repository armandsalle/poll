import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { H } from "~/components/atoms/h";
import { Input } from "~/components/atoms/input";
import { createNewPasswordToken } from "~/models/new-password.server";
import { getUserByEmail } from "~/models/user.server";
import { sendResetPassword } from "~/plugins/email.server";
import { getUserId } from "~/plugins/session.server";
import { validateEmail } from "~/utils/utils";

type ActionData = {
  errors?: {
    email?: string;
  };
  emailSend?: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(email);
  if (user) {
    const newPasswordRequest = await createNewPasswordToken(user.id);
    await sendResetPassword(email, newPasswordRequest.token);

    return json<ActionData>({ emailSend: true });
  }
  if (!user) {
    return json<ActionData>({ emailSend: false });
  }

  return json<ActionData>({});
};

export default function ResetPassword() {
  const actionData = useActionData() as ActionData;
  return (
    <div>
      <H>Reset password</H>
      <Form method="post">
        <Input
          label="Email"
          name="email"
          type="email"
          hasError={actionData?.errors?.email}
        />
        {actionData?.emailSend && <p>Email send, look at your emails</p>}
        <button type="submit">Send reset password link</button>
      </Form>
    </div>
  );
}
