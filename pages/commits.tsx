import git from "isomorphic-git";
import fs from "fs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

import Nav from "../components/nav.tsx";

dayjs.extend(relativeTime);

const dir = ".";

const Commits = async () => {
  const log = await git.log({ fs, dir });

  // Group commits by day
  const commitsByDay = new Map<string, typeof log>();

  for (const commit of log) {
    const date = dayjs(commit.commit.author.timestamp * 1000);
    const dayKey = date.format("YYYY-MM-DD");

    if (!commitsByDay.has(dayKey)) {
      commitsByDay.set(dayKey, []);
    }
    commitsByDay.get(dayKey)!.push(commit);
  }

  return (
    <>
      <Nav />
      <h1>Commits</h1>
      {Array.from(commitsByDay.entries()).map(([dayKey, commits]) => {
        const date = dayjs(dayKey);
        const formattedDate = date.format("MMM D, YYYY");

        return (
          <div key={dayKey} class="commit-group">
            <h2 class="commit-date">Commits on {formattedDate}</h2>
            <ul>
              {commits.map((commit) => (
                <li key={commit.oid}>
                  <a href={`/commit/${commit.oid}`}>
                    <strong>{commit.commit.message.split("\n")[0]}</strong>
                  </a>
                  <em>
                    {commit.commit.author.name} committed{" "}
                    {dayjs(commit.commit.author.timestamp * 1000).fromNow()}
                  </em>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
};

export default Commits;
