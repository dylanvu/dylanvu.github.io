import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import ProjectCard, {
  ProjectCardInterface,
} from "@/components/project/ProjectCard";
import SurpriseMe from "@/components/SurpriseMe";
import "../../../../styles/content-block/content-block.css";
import "../../../../styles/project/project-card.css";
import { handleGenerateStaticParams } from "./util";
import { promises as fs } from "fs";
import TransitionTemplate from "@/components/TransitionTemplate";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return await handleGenerateStaticParams();
}

export default async function ProjectGroupPage({
  params,
}: {
  params: Promise<{
    group: string;
  }>;
}) {
  // fetch the project data
  const projectParams = await params;
  const projectGroup = projectParams.group;
  // then, for this project group, fetch each project-group.json to get the list of their URLs and displaySections
  let projectsFile;
  try {
    projectsFile = await fs.readFile(
      process.cwd() + `/src/app/json/${projectGroup}.json`,
      "utf8"
    );
  } catch {
    // navigate to 404
    redirect("/404");
  }
  const parsedJSON = JSON.parse(projectsFile);
  // unpack the json into the relevant "props"
  const projects: ProjectCardInterface[] = parsedJSON.data;
  const title = parsedJSON.title;

  return (
    <TransitionTemplate>
      <ContentBlockTitle title={`${title} Projects`} />
      <div className="content-block">
        <div className="project-card-group">
          {projects.map((section) => (
            <ProjectCard section={section} key={"_" + section.urlSegment} />
          ))}
        </div>
        <SurpriseMe sections={projects} />
      </div>
    </TransitionTemplate>
  );
}
