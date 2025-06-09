import { readdir, readFile } from "fs/promises";
import path from "path";

const ROOT_DIR = path.join(process.cwd(), "src/app/md/projects");

export interface Project {
  url: string;
  content: string;
}

export async function readMarkdownFilesRecursively(
  dir: string
): Promise<{ url: string; content: string }[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectory
        return await readMarkdownFilesRecursively(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const content = await readFile(fullPath, "utf-8");
        // convert the path if windows into a unix path, and remove the .md to infer the website URL
        // TODO: I don't like the current system of using a .json file to define URL segments, consider refactoring it to just build a URL segment based on the file name in the .md directory
        const relativePath = path
          .relative(ROOT_DIR, fullPath)
          .replace(/\\/g, "/")
          .replace(".md", "");
        // now build the website URL
        const url = `/projects/${relativePath}`;
        return [{ url: url, content }];
      } else {
        return [];
      }
    })
  );

  return files.flat();
}

export async function getAllProjectInformation() {
  const fileContents = await readMarkdownFilesRecursively(ROOT_DIR);
  return fileContents;
}
