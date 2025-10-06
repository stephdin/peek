import { marked } from "marked";

import git from "isomophic-git";
import fs from "node:fs";

const dir = ".";

const files: Array<{
  name: string;
  isDir: boolean;
  lastCommitMessage?: string;
  lastCommitTime?: number;
}> = [];

for await (const dirEntry of Deno.readDir(dir)) {
  let lastCommitMessage: string | undefined = undefined;
  let lastCommitTime: number | undefined = undefined;

  try {
    const commits = await git.log({
      fs,
      dir,
      depth: 1,
      filepath: dirEntry.name,
    });
    if (commits.length > 0) {
      lastCommitMessage = commits[0].commit.message;
      lastCommitTime = commits[0].commit.committer.timestamp * 1000;
    }
  } catch {
    // Ignore errors for now
  }

  files.push({
    name: dirEntry.name,
    isDir: dirEntry.isDirectory,
    lastCommitMessage,
    lastCommitTime,
  });
}

const readme = await Deno.readTextFile("README.md").then((text) =>
  marked.parse(text)
);

const Index = () => {
  return (
    <>
      <ul>
        <li>
          <a href="/commits">View Commits</a>
        </li>
        <li>
          <a href="/branches">Branches</a>
        </li>
        <li>
          <a href="/tags">Tags</a>
        </li>
      </ul>

      <h1>Files</h1>

      <table>
        <tbody>
          {files.map((file) => (
            <tr>
              <td>
                {file.isDir ? (
                  <img class="icon" src="./static/folder.svg" />
                ) : (
                  <img class="icon" src="./static/file.svg" />
                )}
              </td>
              <td>{file.name}</td>
              <td>{file.lastCommitMessage}</td>
              <td>
                {file.lastCommitTime !== undefined
                  ? new Date(file.lastCommitTime).toLocaleString("de-DE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div dangerouslySetInnerHTML={{ __html: readme }} />
    </>
  );
};

export default Index;
