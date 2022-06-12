import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { H } from "~/components/atoms/h";
import { Input } from "~/components/atoms/input";
import { Stack } from "~/components/atoms/stack";
import {
  createUserRegistration,
  getUserByEmail,
  getUserRegistrationByEmail,
  validateUserRegistration,
} from "~/models/user.server";
import { sendEmailVerification } from "~/plugins/email.server";
import { getUserId } from "~/plugins/session.server";
import { validateEmail } from "~/utils/utils";

type LoaderData = {
  errors?: {
    email?: string;
  };
  showCode?: boolean;
  email?: string;
};

type ActionData = {
  errors?: {
    email?: string;
    code?: string;
    _action?: string;
    other?: string;
  };
  email?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Redirect if there is a current user session
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  // Do nothing if there is no email in search params
  if (!email) {
    return json({});
  }

  // Error if invalid email in search params
  if (!validateEmail(email)) {
    return json<LoaderData>(
      {
        showCode: false,
        errors: {
          email: "Invalid email",
        },
      },
      {
        status: 400,
      }
    );
  }

  // Show code section if email is valid and a registration is currently open with this email
  const registratedUser = await getUserRegistrationByEmail(email);
  if (registratedUser) {
    return json<LoaderData>(
      { showCode: true, email },
      {
        status: 200,
      }
    );
  }

  return redirect("/register");
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const action = data.get("_action");
  const email = data.get("email");
  const code = data.get("code");

  // Check if the is an "_action" data
  if (typeof action !== "string" || !["email", "code"].includes(action)) {
    return json<ActionData>(
      { errors: { _action: "Action is not valid (_action)" } },
      { status: 400 }
    );
  }

  if (action === "email") {
    // Check email validity
    if (!validateEmail(email)) {
      return json<ActionData>(
        { errors: { email: "Valid email is required" } },
        { status: 400 }
      );
    }

    // Return error if the email is already used by a user
    const user = await getUserByEmail(email);
    if (user) {
      return json<ActionData>(
        { errors: { email: "Email already use" } },
        { status: 400 }
      );
    }

    // Check if the email is used in a registration to add the email in search params
    const registratedUser = await getUserRegistrationByEmail(email);
    if (registratedUser) {
      const url = new URL(process.env.URL || "");
      url.searchParams.append("email", email);
      return redirect("/register" + url.search);
    }

    // Create a new registration if the email is valid, and not use and show the code section
    const newUserRegistration = await createUserRegistration(email);
    await sendEmailVerification(email, newUserRegistration.code);
    const url = new URL(process.env.URL || "");
    url.searchParams.append("email", email);
    return redirect("/register" + url.search);
  }

  if (action === "code") {
    // Check code validity
    if (typeof code !== "string" || code.length === 0) {
      return json<ActionData>(
        { errors: { code: "Valid code is required" } },
        { status: 400 }
      );
    }

    // Check email validity
    if (!validateEmail(email)) {
      return json<ActionData>(
        { errors: { email: "Valid email is required" } },
        { status: 400 }
      );
    }

    // Get the registration
    const registratedUser = await getUserRegistrationByEmail(email);

    // Return error if the email is not linked to a registration
    if (!registratedUser) {
      return json<ActionData>(
        { errors: { code: "Valid email is required" } },
        { status: 400 }
      );
    }

    // Validate registration or return error
    if (code === registratedUser.code) {
      await validateUserRegistration(email);

      // Redirect to the /join page
      const url = new URL(process.env.URL || "");
      url.searchParams.append("email", email);
      url.searchParams.append("code", code);
      return redirect("/join" + url.search);
    } else {
      return json<ActionData>(
        { errors: { code: "Invalid code" }, email },
        { status: 400 }
      );
    }
  }

  return json<ActionData>(
    { errors: { other: "Something went wrong" } },
    { status: 500 }
  );
};

export const meta: MetaFunction = () => {
  return {
    title: "Register",
  };
};

export default function Register() {
  const actionData = useActionData() as ActionData;
  const loaderData = useLoaderData() as LoaderData;
  const [searchParams] = useSearchParams();

  return (
    <Stack vertical={32} align="start">
      <H>Register</H>
      <Form method="post">
        <Input
          label="Email"
          name="email"
          hasError={actionData?.errors?.email}
          defaultValue={loaderData?.email}
          disabled={Boolean(loaderData?.email)}
          aria-required
          required
        />
        {!loaderData?.email && (
          <button type="submit" name="_action" value="email">
            Continue with email
          </button>
        )}
      </Form>

      {loaderData?.showCode && (
        <Form method="post" action={"/register?" + searchParams.toString()}>
          <Input
            label="email"
            type="hidden"
            name="email"
            value={loaderData?.email}
          />
          <Input
            label="Code"
            name="code"
            hasError={actionData?.errors?.code}
            aria-required
            required
          />
          <button type="submit" name="_action" value="code">
            Verify code
          </button>
        </Form>
      )}
      <div>
        <div>
          Already have an account?{" "}
          <Link
            to={{
              pathname: "/login",
              search: searchParams.toString(),
            }}
          >
            Log in
          </Link>
        </div>
      </div>
    </Stack>
  );
}
