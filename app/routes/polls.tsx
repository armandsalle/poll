import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getPollListItems } from "~/models/poll.server";

type LoaderData = {
  pollListItems: Awaited<ReturnType<typeof getPollListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const pollListItems = await getPollListItems({ userId });
  return json<LoaderData>({ pollListItems });
};

export default function PollsPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div>
      <header>
        <h1>
          <Link to=".">Polls</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button type="submit">Logout</button>
        </Form>
      </header>

      <main>
        <div>
          <Link to="new">+ New Poll</Link>

          <hr />

          {data.pollListItems.length === 0 ? (
            <p>No polls yet</p>
          ) : (
            <ol>
              {data.pollListItems.map((poll) => (
                <li key={poll.id}>
                  <NavLink to={poll.id}>📝 {poll.title}</NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
