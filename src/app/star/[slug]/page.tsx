// this file produces indexable pages for all for all of the md files in this directory for SEO
import fs from "fs";
import path from "path";
import StarPanel from "@/components/star-revamp/ScreenOverlay/StarPanel";
import ReactMarkdown from "react-markdown";

const directories = [
  "src/app/markdown/projects/active",
  "src/app/markdown/iter"
]

export async function generateStaticParams() {
  // read all the files in the active 
  let paths = []
  for (const directory of directories) {
    const currentDirectory = path.join(process.cwd(), directory);
    const files = fs
      .readdirSync(currentDirectory)
      .filter((file) => file.endsWith(".md"));
    for (const file of files) {
      paths.push({
        slug: file.replace(".md", ""),
      })
    }
  }

  return paths;
}

export default async function MarkdownPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = (await params).slug;
  
  // Search through all directories to find the markdown file
  let markdown = "";
  let filePath = "";
  
  for (const directory of directories) {
    const currentFilePath = path.join(
      process.cwd(),
      directory,
      `${slug}.md`
    );
    
    if (fs.existsSync(currentFilePath)) {
      filePath = currentFilePath;
      markdown = fs.readFileSync(filePath, "utf8");
      break;
    }
  }
  
  // If no file was found, throw an error
  if (!markdown) {
    throw new Error(`Markdown file not found for slug: ${slug}`);
  }

  return (
    <>
      {/* Full-page for SEO and crawlers: keep it accessible by wrapping with an ID. */}
      <article id="doc-fullpage" style={{ display: "none" }}>
        <h1>{slug}</h1>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
      {/* The side panels that the user sees */}
      <StarPanel markdown={markdown} slug={slug} />
    </>
  );
}
