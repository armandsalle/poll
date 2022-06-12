import { Form, Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils/utils";

import { Container } from "../atoms/container";
import { H } from "../atoms/h";
import { Stack } from "../atoms/stack";

export function Navbar() {
  const user = useOptionalUser();
  return (
    <Container as="nav">
      <Stack horizontal={0} justify="spaceBetween">
        <Link to="/">
          <H>Polls</H>
        </Link>

        <Stack horizontal={8}>
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
        </Stack>
      </Stack>
    </Container>
  );
}
