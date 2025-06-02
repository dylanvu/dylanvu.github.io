import "@/styles/content-block/content-block.css";
import { promises as fs } from "fs";
import { redirect } from "next/navigation";
import TransitionTemplate from "@/components/TransitionTemplate";
import { handleGenerateStaticParams } from "./util";
import MarkdownRenderer from "@/components/content-block/MarkdownRenderer";

// dynamically generate each project page from the parameter
// https://github.com/vercel/next.js/issues/42840#issuecomment-1352105907
export async function generateStaticParams({
  params: { group },
}: {
  params: { group: string };
}) {
  return await handleGenerateStaticParams(group);
}

export default async function ProjectGroupPage({
  params,
}: {
  params: Promise<{ group: string; project: string }>;
}) {
  // generate project pages based on the txt file located in public

  // fetch the project data
  const projectParams = await params;
  const group = projectParams.group;
  const project = projectParams.project;
  // then, for this project group, fetch each project-group.json to get the list of their URLs and displaySections
  let projectsFile;
  try {
    projectsFile = await fs.readFile(
      process.cwd() + `/src/app/md/projects/${group}/${project}.md`,
      "utf8"
    );
  } catch {
    // navigate to 404
    redirect("/404");
  }

  return (
    <TransitionTemplate>
      <div className="content-block">
        <MarkdownRenderer text={projectsFile} />
      </div>
    </TransitionTemplate>
  );
}
