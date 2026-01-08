import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/de.js";

import fs from "fs";
import git from "isomorphic-git";
import { marked } from "marked";

import Nav from "../components/nav.tsx";

dayjs.locale("de");
dayjs.extend(relativeTime);

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

// Sort files: directories first, then README, then LICENSE, then other files alphabetically
files.sort((a, b) => {
  const aLower = a.name.toLowerCase();
  const bLower = b.name.toLowerCase();

  // Directories first
  if (a.isDir && !b.isDir) return -1;
  if (!a.isDir && b.isDir) return 1;

  // Within files, apply special ordering
  if (!a.isDir && !b.isDir) {
    const aIsReadme = aLower.includes("readme");
    const bIsReadme = bLower.includes("readme");
    const aIsLicense = aLower.includes("license");
    const bIsLicense = bLower.includes("license");

    // README comes first among files
    if (aIsReadme && !bIsReadme) return -1;
    if (!aIsReadme && bIsReadme) return 1;

    // LICENSE comes second among files
    if (aIsLicense && !bIsLicense) return -1;
    if (!aIsLicense && bIsLicense) return 1;
  }

  // Alphabetical within each group
  return aLower.localeCompare(bLower);
});

const readme = await Deno.readTextFile("README.md").then((text) =>
  marked.parse(text)
);

const Index = () => {
  return (
    <>
      <Nav />

      <table>
        <tbody>
          {files.map((file) => (
            <tr>
              <td>
                {file.isDir ? (
                  <img class="icon" src="/static/folder.svg" />
                ) : (
                  <img class="icon" src="/static/file.svg" />
                )}
              </td>
              <td>{file.name}</td>
              <td>{file.lastCommitMessage}</td>
              <td
                title={dayjs(file.lastCommitTime).format(
                  "dddd, DD.MM.YYYY, HH:mm:ss"
                )}
              >
                {file.lastCommitTime !== undefined
                  ? dayjs(file.lastCommitTime).fromNow()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div class="markdown-body" dangerouslySetInnerHTML={{ __html: readme }} />
    </>
  );
};

export default Index;
