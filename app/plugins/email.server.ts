import type { UserRegistration } from "@prisma/client";

const EMAIL_TEMPLATES = {
  verifyEmail: "pxkjn41mpr94z781",
  welcomeEmail: "351ndgwvypnlzqx8",
};

const mailersendURL = process.env.MAILERSEND_API_URL || "";
const globalUrl = process.env.URL;

export async function sendWelcomeEmail(email: string, name: string) {
  const url = new URL(globalUrl + "/login/");
  const href = url.href;

  try {
    const resp = await fetch(mailersendURL, {
      method: "POST",
      headers: new Headers({
        "X-Requested-With": "XMLHttpRequest",
        "Content-type": "application/json",
        Authorization: "Bearer " + process.env.MAILERSEND_API_KEY,
      }),
      body: JSON.stringify({
        from: {
          email: "hello@armand-salle.fr",
          name: "Armand confirmation",
        },
        to: [
          {
            email,
            name,
          },
        ],
        subject: "Welcome onboard!",
        template_id: EMAIL_TEMPLATES.welcomeEmail,
        variables: [
          {
            email,
            substitutions: [
              {
                var: "name",
                value: name,
              },
              {
                var: "url",
                value: href,
              },
            ],
          },
        ],
      }),
    });

    console.log(resp.ok, resp.status);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return;
    }
    console.log(error);
  }
}

export async function sendEmailVerification(
  email: string,
  code: UserRegistration["code"]
) {
  const url = new URL(globalUrl + "/join/");
  url.searchParams.append("email", email);
  url.searchParams.append("code", code);
  const href = url.href;

  try {
    const resp = await fetch(mailersendURL, {
      method: "POST",
      headers: new Headers({
        "X-Requested-With": "XMLHttpRequest",
        "Content-type": "application/json",
        Authorization: "Bearer " + process.env.MAILERSEND_API_KEY,
      }),
      body: JSON.stringify({
        from: {
          email: "hello@armand-salle.fr",
          name: "Armand confirmation",
        },
        to: [
          {
            email,
            name: email,
          },
        ],
        subject: "Validate email!",
        template_id: EMAIL_TEMPLATES.verifyEmail,
        variables: [
          {
            email,
            substitutions: [
              {
                var: "code",
                value: code,
              },
              {
                var: "url",
                value: href,
              },
            ],
          },
        ],
      }),
    });

    console.log(resp.ok, resp.status);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return;
    }
    console.log(error);
  }
}
