type Props = {
  files: Array<{ name: string; isDir: boolean }>;
  readme: string;
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

      <table>
        <tbody>
          {props.files.map((file) => (
            <tr>
              <td>
                {file.isDir ? (
                  <img class="icon" src="./static/folder.svg" />
                ) : (
                  <img class="icon" src="./static/file.svg" />
                )}
              </td>
              <td>{file.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div dangerouslySetInnerHTML={{ __html: props.readme }} />
    </>
  );
};

export default Index;
