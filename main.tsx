import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { serveStatic } from "@hono/hono/deno";

import git from "@isomophic-git/isomophic-git";
import fs from "node:fs";

import Index from "./pages/index.tsx";
import Commits from "./pages/commits.tsx";
import Branches from "./pages/branches.tsx";
import Layout from "./components/layout.tsx";

const dir = ".";

const dirEntries: Array<string> = [];
for await (const dirEntry of Deno.readDir(dir)) {
  dirEntries.push(dirEntry.name);
}

const [commits, branches, _files, _tags] = await Promise.all([
  git.log({ fs, dir }),
  git.listBranches({ fs, dir }),
  git.listFiles({ fs, dir }),
  git.listTags({ fs, dir }),
]);

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) =>
  c.html(
    <Layout>
      <Index files={dirEntries} />
    </Layout>
  )
);

app.get("/commits", (c) =>
  c.html(
    <Layout>
      <Commits commits={commits} />
    </Layout>
  )
);

app.get("/branches", (c) =>
  c.html(
    <Layout>
      <Branches branches={branches} />
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
