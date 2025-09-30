import { ReadCommitResult } from "@isomophic-git/isomophic-git";

type Props = {
  commits: Array<ReadCommitResult>;
};

const Commits = (props: Props) => {
  return (
    <>
      <h1>Commits</h1>
      <ul>
        {props.commits.map((commit) => (
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
