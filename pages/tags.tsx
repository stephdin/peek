import git from "isomorphic-git";
import fs from "fs";

const dir = ".";

const Tags = async () => {
  const tags = await git.listTags({ fs, dir });

  return (
    <>
      <h1>Tags</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <strong>{tag}</strong>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Tags;
