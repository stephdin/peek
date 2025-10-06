import git from "isomophic-git";
import fs from "node:fs";

const dir = ".";

const Branches = async () => {
  const branches = await git.listBranches({ fs, dir });

  return (
    <>
      <h1>Branches</h1>
      <ul>
        {branches.map((branch) => (
          <li key={branch}>
            <strong>{branch}</strong>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Branches;
