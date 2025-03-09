import "../../../../../styles/content-block/content-block.css";
import { navigationObject } from "@/components/NavigationGroup";
import { promises as fs } from "fs";
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import Paragraph from "@/components/content-block/Paragraph";
import { redirect } from "next/navigation";
import TransitionTemplate from "@/components/TransitionTemplate";
import { handleGenerateStaticParams } from "./util";

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
  params: { group: string; project: string };
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
      process.cwd() + `/src/app/txt/projects/${group}/${project}.txt`,
      "utf8"
    );
  } catch (e) {
    // navigate to 404
    redirect("/404");
  }

  const paragraphs = projectsFile.split("\n");
  const title = paragraphs[0];
  const content = paragraphs.slice(1);

  return (
    <TransitionTemplate>
      <ContentBlockTitle title={title} />
      <div className="content-block">
        {content.map((paragraph, index) => (
          <Paragraph
            text={paragraph}
            key={"_" + paragraph + index.toString()}
          />
        ))}
      </div>
    </TransitionTemplate>
  );
}
