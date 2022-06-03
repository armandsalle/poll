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
  useLoaderData,
} from "@remix-run/react";

import { getUser } from "./session.server";
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
  css: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
    css: getCssText(),
  });
};

export default function App() {
  const { css } = useLoaderData() as LoaderData;

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <style id="stitches">{css}</style>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
