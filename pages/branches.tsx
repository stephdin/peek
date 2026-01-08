import git from "isomorphic-git";
import fs from "fs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

import Nav from "../components/nav.tsx";

dayjs.extend(relativeTime);

const dir = ".";

type BranchInfo = {
  name: string;
  isCurrent: boolean;
  lastCommit: {
    message: string;
    author: string;
    date: Date;
    sha: string;
  };
};

const Branches = async () => {
  // Get all branches
  const branches = await git.listBranches({ fs, dir });

  // Get current branch
  const currentBranch = await git.currentBranch({ fs, dir, fullname: false });

  // Get detailed info for each branch
  const branchInfos: BranchInfo[] = await Promise.all(
    branches.map(async (branchName) => {
      // Get the latest commit for this branch
      const [latestCommit] = await git.log({ fs, dir, ref: branchName, depth: 1 });

      return {
        name: branchName,
        isCurrent: branchName === currentBranch,
        lastCommit: {
          message: latestCommit.commit.message.split("\n")[0], // First line only
          author: latestCommit.commit.author.name,
          date: new Date(latestCommit.commit.author.timestamp * 1000),
          sha: latestCommit.oid.substring(0, 7),
        },
      };
    })
  );

  return (
    <>
      <Nav />
      <h1>Branches</h1>
      <ul>
        {branchInfos.map((branch) => (
          <li key={branch.name} class={branch.isCurrent ? "current-branch" : ""}>
            <div>
              <strong>{branch.name}</strong>
              {branch.isCurrent && <span class="branch-badge">current</span>}
            </div>
            <div class="branch-meta">
              <span>{branch.lastCommit.message}</span>
            </div>
            <div class="branch-meta">
              <em>
                {branch.lastCommit.author} committed {dayjs(branch.lastCommit.date).fromNow()}
              </em>
              <code class="commit-sha">{branch.lastCommit.sha}</code>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Branches;
