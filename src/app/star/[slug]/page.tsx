// this file produces indexable pages for all for all of the md files in this directory for SEO
import fs from "fs";
import path from "path";
import StarPanel from "@/components/star-revamp/ScreenOverlay/StarPanel";
import ReactMarkdown from "react-markdown";

const activeProjectsBasePath = "src/app/markdown/projects/active";

export async function generateStaticParams() {
  // read all the files in the active directory
  const projectsDir = path.join(process.cwd(), activeProjectsBasePath);
  const projectFiles = fs
    .readdirSync(projectsDir)
    .filter((file) => file.endsWith(".md"));
  return projectFiles.map((file) => ({
    slug: file.replace(".md", ""),
  }));
}

export default async function MarkdownPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = (await params).slug;
  const filePath = path.join(
    process.cwd(),
    activeProjectsBasePath,
    `${slug}.md`
  );
  const markdown = fs.readFileSync(filePath, "utf8");

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
