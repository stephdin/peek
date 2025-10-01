type Props = {
  files: Array<string>;
};

const Index = (props: Props) => {
  return (
    <>
      <ul>
        <li>
          <a href="/commits">View Commits</a>
        </li>
        <li>
          <a href="/branches">Branches</a>
        </li>
         <li>
          <a href="/tags">Tags</a>
        </li>
      </ul>
      <h1>Files</h1>
      <ul>
        {props.files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </>
  );
};

export default Index;
