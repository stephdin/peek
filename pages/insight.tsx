import git from "isomorphic-git";
import fs from "fs";

import Nav from "../components/nav.tsx";

const dir = ".";

const Insight = async () => {
  // Get all commits
  const log = await git.log({ fs, dir });

  // Collect unique authors with their commit counts
  const authorStats = new Map<string, { name: string; email: string; count: number }>();

  for (const commit of log) {
    const { name, email } = commit.commit.author;
    const key = `${name} <${email}>`;

    if (authorStats.has(key)) {
      authorStats.get(key)!.count++;
    } else {
      authorStats.set(key, { name, email, count: 1 });
    }
  }

  // Convert to array and sort by commit count (descending)
  const authors = Array.from(authorStats.values()).sort((a, b) => b.count - a.count);

  return (
    <>
      <Nav />
      <h1>Insight</h1>

      <h2>Contributors ({authors.length})</h2>
      <ul>
        {authors.map((author) => (
          <li key={`${author.name} <${author.email}>`}>
            <strong>{author.name}</strong> ({author.email})
            <em> - {author.count} commit{author.count !== 1 ? "s" : ""}</em>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Insight;
