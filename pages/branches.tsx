type Props = {
  branches: Array<string>;
};

const Branches = (props: Props) => {
  return (
    <>
      <h1>Branches</h1>
      <ul>
        {props.branches.map((branch) => (
          <li key={branch}>
            <strong>{branch}</strong>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Branches;
