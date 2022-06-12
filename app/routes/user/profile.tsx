import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Input } from "~/components/atoms/input";
import { Outlet } from "~/components/atoms/outlet";
import { updateUserPassword } from "~/models/new-password.server";
import {
  deleteUserByEmail,
  getUserById,
  verifyLogin,
} from "~/models/user.server";
import { requireUserId } from "~/plugins/session.server";
import { isValidString } from "~/utils/utils";

type ActionData = {
  errors?: {
    action?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  newPassword?: string;
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
    return redirect("/");
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
    return redirect("/");
  }

  if (action === "change-password") {
    const currentPassword = data.get("current-password");
    const newPassword = data.get("new-password");

    if (!isValidString(currentPassword)) {
      return json<ActionData>({
        errors: {
          currentPassword: "The current password is wrong",
        },
      });
    }

    const isCurrentPasswordValid = await verifyLogin(
      user.email,
      currentPassword
    );

    if (!isCurrentPasswordValid) {
      return json<ActionData>({
        errors: {
          currentPassword: "The current password is wrong",
        },
      });
    }

    if (!isValidString(newPassword)) {
      return json<ActionData>({
        errors: {
          newPassword: "Invalid new password",
        },
      });
    }
    if (newPassword.length < 8) {
      return json<ActionData>({
        errors: {
          newPassword: "New password is too short",
        },
      });
    }

    await updateUserPassword(user.id, newPassword);

    return json<ActionData>({
      newPassword: "Password change successfuly",
    });
  }

  return null;
};

export default function Profile() {
  const actionData = useActionData() as ActionData;
  const transition = useTransition();
  const newPasswordFormRef = useRef<HTMLFormElement>(null);

  const isChangePasswordSuccess =
    transition.state === "loading" &&
    transition.submission?.formData.get("_action") === "change-password" &&
    actionData?.newPassword === "Password change successfuly";

  useEffect(() => {
    if (isChangePasswordSuccess) {
      newPasswordFormRef.current?.reset();
    }
  }, [isChangePasswordSuccess]);

  return (
    <Outlet vertical={32} as="section">
      <Form method="post">
        <button type="submit" name="_action" value="delete">
          Delete account
        </button>
      </Form>
      <Form method="post" ref={newPasswordFormRef}>
        <Outlet vertical={8} align="start">
          <Input
            label="Current password"
            name="current-password"
            type="password"
            hasError={actionData?.errors?.currentPassword}
          />
          <Input
            label="New password"
            name="new-password"
            type="password"
            hasError={actionData?.errors?.newPassword}
          />
          <button type="submit" name="_action" value="change-password">
            Change password
          </button>
          {actionData?.newPassword && <p>{actionData.newPassword}</p>}
        </Outlet>
      </Form>
    </Outlet>
  );
}
