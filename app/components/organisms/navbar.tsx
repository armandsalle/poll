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
              <Link to="/user/profile">{user.name}</Link>
              <Form action="/logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            </>
          ) : (
            <>
              <Link to="/register">Sign up</Link>
              <Link to="/login">Log In</Link>
            </>
          )}
        </Outlet>
      </Outlet>
    </Container>
  );
}
