import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { Stack } from "~/components/atoms/stack";
import { getPollListItems } from "~/models/poll.server";
import { requireUserId } from "~/plugins/session.server";

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

  return (
    <Stack vertical={16} align="start">
      <Stack vertical={16} align="start">
        <Link to="new">+ New Poll</Link>

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
      </Stack>

      <Outlet />
    </Stack>
  );
}
