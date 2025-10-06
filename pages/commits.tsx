import git from "isomorphic-git";
import fs from "fs";

const dir = ".";

const Commits = async () => {
  const commits = await git.log({ fs, dir });

  return (
    <>
      <h1>Commits</h1>
      <ul>
        {commits.map((commit) => (
          <li key={commit.oid}>
            <strong>{commit.commit.message.split("\n")[0]}</strong>
            <br />
            <em>
              by {commit.commit.author.name} &lt;{commit.commit.author.email}
              &gt;
            </em>
            <br />
            <small>
              {new Date(commit.commit.author.timestamp * 1000).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Commits;
