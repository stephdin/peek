import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/deno";

import Layout from "./components/layout.tsx";
import Branches from "./pages/branches.tsx";
import Commits from "./pages/commits.tsx";
import Index from "./pages/index.tsx";
import Tags from "./pages/tags.tsx";

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) =>
  c.html(
    <Layout>
      <Index />
    </Layout>
  )
);

app.get("/commits", (c) =>
  c.html(
    <Layout>
      <Commits />
    </Layout>
  )
);

app.get("/branches", (c) =>
  c.html(
    <Layout>
      <Branches />
    </Layout>
  )
);

app.get("/tags", (c) =>
  c.html(
    <Layout>
      <Tags />
    </Layout>
  )
);

app.use("/static/*", serveStatic({ root: "./" }));

Deno.serve(
  {
    hostname: "127.0.0.1",
    port: 8000,
    onListen({ hostname, port }) {
      console.log(`
                            ▄▄
                            ██
 ██▄███▄   ▄████▄   ▄████▄  ██ ▄██▀
 ██▀  ▀██ ██▄▄▄▄██ ██▄▄▄▄██ ██▄██
 ██    ██ ██▀▀▀▀▀▀ ██▀▀▀▀▀▀ ██▀██▄
 ███▄▄██▀ ▀██▄▄▄▄█ ▀██▄▄▄▄█ ██  ▀█▄
 ██ ▀▀▀     ▀▀▀▀▀    ▀▀▀▀▀  ▀▀   ▀▀▀
 ██

Open your web browser and view your
Git repository at http://${hostname}:${port}

Press Ctrl+C to stop
`);
    },
  },
  app.fetch
);
