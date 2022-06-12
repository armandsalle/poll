import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { H } from "~/components/atoms/h";
import { Input } from "~/components/atoms/input";
import {
  getLastPasswordToken,
  updateUserPassword,
} from "~/models/new-password.server";
import { getUserByEmail } from "~/models/user.server";
import { getUserId } from "~/plugins/session.server";
import { validateEmail } from "~/utils/utils";

type LoaderData = {
  email?: string;
  token?: string;
};

type ActionData = {
  errors?: {
    password?: string;
    email?: string;
    token?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");

  if (
    !validateEmail(email) ||
    typeof token !== "string" ||
    token?.length === 0
  ) {
    return redirect("/");
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return redirect("/");
  }

  const newPasswordRequest = await getLastPasswordToken(user.id);
  if (!newPasswordRequest || newPasswordRequest?.length !== 1) {
    return redirect("/");
  }

  if (token !== newPasswordRequest[0].token) {
    return redirect("/");
  }

  return json<LoaderData>({
    email,
    token,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const token = formData.get("token");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    !validateEmail(email) ||
    typeof token !== "string" ||
    token?.length === 0
  ) {
    return redirect("/");
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return redirect("/");
  }

  const newPasswordRequest = await getLastPasswordToken(user.id);
  if (!newPasswordRequest || newPasswordRequest?.length !== 1) {
    return redirect("/");
  }

  if (token !== newPasswordRequest[0].token) {
    return redirect("/");
  }

  if (typeof password !== "string" || password?.length < 3) {
    return json<ActionData>({
      errors: {
        password: "Invalid email",
      },
    });
  }

  await updateUserPassword(user.id, password);

  return json({});
};

export default function NewPassword() {
  const loaderData = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const [searchParams] = useSearchParams();
  return (
    <div>
      <H>New password</H>
      <Form method="post" action={"/new-password?" + searchParams.toString()}>
        <input type="hidden" name="email" defaultValue={loaderData?.email} />
        <input type="hidden" name="token" defaultValue={loaderData?.token} />
        <Input
          label="New password"
          name="password"
          type="password"
          hasError={actionData?.errors?.password}
        />
        <button type="submit">Change password</button>
      </Form>
    </div>
  );
}
