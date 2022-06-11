import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { Container } from "./components/atoms/container";
import { Navbar } from "./components/organisms/navbar";
import { getUser } from "./plugins/session.server";
import globalStyle from "./styles/global.css";
import { getCssText } from "./styles/theme";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: globalStyle }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Polls",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  });
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {/* <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        /> */}
      </head>
      <body>
        <Navbar />
        <Container>
          <Outlet />
        </Container>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
