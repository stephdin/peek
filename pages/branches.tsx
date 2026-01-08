import git from "isomorphic-git";
import fs from "fs";

import Nav from "../components/nav.tsx";

const dir = ".";

const Branches = async () => {
  const branches = await git.listBranches({ fs, dir });

  return (
    <>
      <Nav />
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
