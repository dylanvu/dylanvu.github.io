import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import { navigationObject } from "@/components/NavigationGroup";
import ProjectCard from "@/components/project/ProjectCard";
import SurpriseMe from "@/components/SurpriseMe";
import "../../../../styles/content-block/content-block.css";
import "../../../../styles/project-card.css";
import { handleGenerateStaticParams } from "./util";
import { promises as fs } from "fs";

export async function generateStaticParams() {
    return await handleGenerateStaticParams();
}

export default async function ProjectGroupPage({ params }: {
    params: {
        group: string
    }
}) {

    // fetch the project data
    const projectGroup = params.group;
    // then, for this project group, fetch each project-group.json to get the list of their URLs and displaySections
    const projectsFile = await fs.readFile(process.cwd() + `/src/app/json/${projectGroup}.json`, 'utf8');
    const parsedJSON = JSON.parse(projectsFile);
    // unpack the json into the relevant "props"
    const projects: navigationObject[] = parsedJSON.data;
    const title = parsedJSON.title;


    return (
        <div key={projectGroup}>
            <ContentBlockTitle title={`${title} Projects`} />
            <div className="content-block">
                <div className="project-card-group">
                    {projects.map((section) => <ProjectCard section={section} />)}
                </div>
                <SurpriseMe sections={projects} />
            </div>
        </div>
    )
}