import git from "isomorphic-git";
import fs from "fs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

import Nav from "../components/nav.tsx";

dayjs.extend(relativeTime);

const dir = ".";

type Props = {
  oid: string;
};

type DiffLine = {
  type: "add" | "del" | "ctx";
  content: string;
};

type FileChange = {
  path: string;
  type: "added" | "modified" | "deleted";
  diff: DiffLine[];
};

/**
 * Recursively get all files from a tree.
 * Returns Map of filepath -> blob OID.
 */
async function getTreeFiles(
  treeOid: string,
  basePath: string = ""
): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const { tree } = await git.readTree({ fs, dir, oid: treeOid });

  for (const entry of tree) {
    const fullPath = basePath ? `${basePath}/${entry.path}` : entry.path;

    if (entry.type === "blob") {
      files.set(fullPath, entry.oid);
    } else if (entry.type === "tree") {
      const subFiles = await getTreeFiles(entry.oid, fullPath);
      for (const [path, oid] of subFiles) {
        files.set(path, oid);
      }
    }
  }

  return files;
}

/**
 * Read file content from a blob OID.
 * Returns null if binary or unreadable.
 */
async function readBlobContent(blobOid: string): Promise<string | null> {
  try {
    const { blob } = await git.readBlob({ fs, dir, oid: blobOid });
    const content = new TextDecoder().decode(blob);

    // Check if it looks like binary (contains null bytes)
    if (content.includes("\0")) {
      return null;
    }

    return content;
  } catch {
    return null;
  }
}

/**
 * Create a simple line-by-line diff.
 * Shows all deleted lines first, then all added lines for simplicity.
 */
function createDiff(oldContent: string | null, newContent: string | null): DiffLine[] {
  const oldLines = oldContent?.split("\n") ?? [];
  const newLines = newContent?.split("\n") ?? [];
  const diff: DiffLine[] = [];

  // For added files: show all lines as added
  if (oldContent === null && newContent !== null) {
    for (const line of newLines) {
      diff.push({ type: "add", content: line });
    }
    return diff;
  }

  // For deleted files: show all lines as deleted
  if (oldContent !== null && newContent === null) {
    for (const line of oldLines) {
      diff.push({ type: "del", content: line });
    }
    return diff;
  }

  // For modified files: simple line comparison
  // Find lines that were removed and lines that were added
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  // Lines in old but not in new = deleted
  for (const line of oldLines) {
    if (!newSet.has(line)) {
      diff.push({ type: "del", content: line });
    }
  }

  // Lines in new but not in old = added
  for (const line of newLines) {
    if (!oldSet.has(line)) {
      diff.push({ type: "add", content: line });
    }
  }

  return diff;
}

/**
 * Get list of changed files with their diffs.
 */
async function getChangedFiles(commitOid: string): Promise<FileChange[]> {
  const commit = await git.readCommit({ fs, dir, oid: commitOid });
  const treeOid = commit.commit.tree;
  const parentOid = commit.commit.parent[0];

  // Get files in current and parent trees
  const currentFiles = await getTreeFiles(treeOid);
  let parentFiles = new Map<string, string>();

  if (parentOid) {
    const parentCommit = await git.readCommit({ fs, dir, oid: parentOid });
    parentFiles = await getTreeFiles(parentCommit.commit.tree);
  }

  const changes: FileChange[] = [];

  // Find added and modified files
  for (const [path, blobOid] of currentFiles) {
    const parentBlobOid = parentFiles.get(path);

    if (!parentBlobOid) {
      // Added file
      const content = await readBlobContent(blobOid);
      const diff = createDiff(null, content);
      changes.push({ path, type: "added", diff });
    } else if (parentBlobOid !== blobOid) {
      // Modified file
      const oldContent = await readBlobContent(parentBlobOid);
      const newContent = await readBlobContent(blobOid);
      const diff = createDiff(oldContent, newContent);
      changes.push({ path, type: "modified", diff });
    }
  }

  // Find deleted files
  for (const [path, blobOid] of parentFiles) {
    if (!currentFiles.has(path)) {
      const content = await readBlobContent(blobOid);
      const diff = createDiff(content, null);
      changes.push({ path, type: "deleted", diff });
    }
  }

  // Sort by path
  changes.sort((a, b) => a.path.localeCompare(b.path));

  return changes;
}

/**
 * Commit detail page component.
 */
const Commit = async ({ oid }: Props) => {
  // Try to read the commit
  let commit;
  try {
    commit = await git.readCommit({ fs, dir, oid });
  } catch {
    return (
      <>
        <Nav />
        <h1>Commit not found</h1>
        <p>The commit {oid} could not be found.</p>
      </>
    );
  }

  // Get changed files with diffs
  const changes = await getChangedFiles(oid);

  // Format dates
  const date = dayjs(commit.commit.author.timestamp * 1000);

  // Parse commit message
  const fullMessage = commit.commit.message;
  const firstNewline = fullMessage.indexOf("\n");
  const title = firstNewline > -1 ? fullMessage.substring(0, firstNewline) : fullMessage;
  const body = firstNewline > -1 ? fullMessage.substring(firstNewline + 1).trim() : "";

  return (
    <>
      <Nav />
      <p class="back-link">
        <a href="/commits">&larr; Back to commits</a>
      </p>

      <h1>{title}</h1>

      <div class="commit-meta">
        <p>
          <strong>{commit.commit.author.name}</strong> committed {date.fromNow()}
        </p>
        <p class="commit-date-full">{date.format("MMMM D, YYYY [at] HH:mm")}</p>
        <p class="commit-oid">
          <code>{oid.substring(0, 7)}</code>
        </p>
      </div>

      {body.length > 0 && (
        <div class="commit-body">
          <pre>{body}</pre>
        </div>
      )}

      <h2>Changed files ({changes.length})</h2>

      {changes.length === 0 && <p>No file changes detected.</p>}

      {changes.map((change) => (
        <div class="file-diff" key={change.path}>
          <div class="file-header">
            <span class={`file-status file-status-${change.type}`}>
              {change.type === "added" && "A"}
              {change.type === "modified" && "M"}
              {change.type === "deleted" && "D"}
            </span>
            <span class="file-path">{change.path}</span>
          </div>

          {change.diff.length > 0 && (
            <pre class="diff-content">
              {change.diff.map((line, i) => (
                <div key={i} class={`diff-${line.type}`}>
                  {line.type === "add" ? "+" : line.type === "del" ? "-" : " "}
                  {line.content}
                </div>
              ))}
            </pre>
          )}

          {change.diff.length === 0 && (
            <div class="diff-binary">Binary file or no text changes</div>
          )}
        </div>
      ))}
    </>
  );
};

export default Commit;
