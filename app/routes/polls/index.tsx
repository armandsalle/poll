import { Link } from "@remix-run/react";

export default function PollIndexPage() {
  return (
    <p>
      No poll selected. Select a poll, or{" "}
      <Link to="new">create a new poll.</Link>
    </p>
  );
}
