import { Form, Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils/utils";

import { Container } from "../atoms/container";
import { H } from "../atoms/h";
import { Outlet } from "../atoms/outlet";

export function Navbar() {
  const user = useOptionalUser();
  return (
    <Container as="nav">
      <Outlet horizontal={0} justify="spaceBetween">
        <Link to="/">
          <H>Polls</H>
        </Link>

        <Outlet horizontal={8}>
          {user ? (
            <>
              <Link to="/polls">Dashboard</Link>
              <p>{user.name}</p>
              <Form action="/logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            </>
          ) : (
            <>
              <Link to="/join">Sign up</Link>
              <Link to="/login">Log In</Link>
            </>
          )}
        </Outlet>
      </Outlet>
    </Container>
  );
}
