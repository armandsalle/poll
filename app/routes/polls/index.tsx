import { Link } from "@remix-run/react";

export default function PollIndexPage() {
  return (
    <p>
      No poll selected. Select a poll on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new poll.
      </Link>
    </p>
  );
}
