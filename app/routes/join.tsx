import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import {
  createUser,
  getUserByEmail,
  getUserRegistrationByEmail,
} from "~/models/user.server";
import { sendWelcomeEmail } from "~/plugins/email.server";
import { createUserSession, getUserId } from "~/plugins/session.server";
import { safeRedirect, validateEmail, validateName } from "~/utils/utils";

type LoaderData = {
  email?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Redirect if there is a current user session
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const code = url.searchParams.get("code");

  // Redirect with error params if the email or code is invalid, or if there are no registration with the email
  if (!email || email?.length === 0 || !validateEmail(email)) {
    return redirect("/register?error=params-error");
  }
  if (!code || code?.length === 0) {
    return redirect("/register?error=params-error");
  }
  const registratedUser = await getUserRegistrationByEmail(email);
  if (!registratedUser) {
    return redirect("/register?error=email-error");
  }
  if (code !== registratedUser?.code) {
    return redirect("/register?error=code-error");
  }

  return json<LoaderData>({
    email,
  });
};

interface ActionData {
  errors: {
    email?: string;
    password?: string;
    name?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  // Validate email and redirect if the email is already use by a user
  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return redirect("/register");
  }

  // Validate name
  if (!validateName(name)) {
    return json<ActionData>(
      { errors: { name: "Name is invalid" } },
      { status: 400 }
    );
  }

  // Validate password
  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  // Create a new user
  const user = await createUser(name, email, password);
  await sendWelcomeEmail(email, name);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const loaderData = useLoaderData() as LoaderData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      <div>
        <Form method="post" action={"/join?" + searchParams.toString()}>
          <div>
            <label htmlFor="email">Email address</label>
            <div>
              <input
                defaultValue={loaderData.email}
                ref={emailRef}
                id="email"
                required
                name="email"
                type="email"
                readOnly
              />
            </div>
          </div>

          <div>
            <label htmlFor="name">Name</label>
            <div>
              <input
                ref={nameRef}
                id="name"
                required
                autoFocus={true}
                name="name"
                type="name"
                autoComplete="name"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
              />
              {actionData?.errors?.name && (
                <div id="name-error">{actionData.errors.name}</div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div>
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              {actionData?.errors?.password && (
                <div id="password-error">{actionData.errors.password}</div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit">Create Account</button>
        </Form>
      </div>
    </div>
  );
}
