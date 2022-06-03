import { Link } from "@remix-run/react";
import { H } from "~/components/atoms/h";
import { useOptionalUser } from "~/utils/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <div>
      <H>Hello</H>
      {user ? (
        <Link to="/polls">View polls for {user.email}</Link>
      ) : (
        <div>
          <Link to="/join">Sign up</Link>
          <Link to="/login">Log In</Link>
        </div>
      )}
    </div>
  );
}
