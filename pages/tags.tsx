type Props = {
  tags: Array<string>;
};

const Tags = (props: Props) => {
  return (
    <>
      <h1>Tags</h1>
      <ul>
        {props.tags.map((tag) => (
          <li key={tag}>
            <strong>{tag}</strong>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Tags;
