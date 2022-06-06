export async function sendEmailConfirmation(email: string, name: string) {
  try {
    const resp = await fetch("https://api.mailersend.com/v1/email", {
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
        subject: "Confirm email!",
        template_id: "351ndgwvypnlzqx8",
        variables: [
          {
            email,
            substitutions: [
              {
                var: "company",
                value: "MailerSend",
              },
              {
                var: "name",
                value: name,
              },
              {
                var: "url",
                value: "localhost:3000",
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
