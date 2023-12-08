import { PageLayout } from "@/app/layout"
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import { navigationObject } from "@/components/NavigationGroup";
import ProjectCard from "@/components/project/ProjectCard";
import SurpriseMe from "@/components/SurpriseMe";
import "../../../styles/content-block/content-block.css";
import "../../../styles/project-card.css";

import { promises as fs } from "fs";

// dynamically generate each project-group page from the list of project-groups 
export async function generateStaticParams() {
    // first, get each project group in projects.json (aka "ts-js", "python", etc)
    // this serves as the URL of the page ("projects/ts-js") with all the projects details

    // grab the list of all the project-groups: ["ts-js", "python", "flutter", etc]
    const projectGroupFile = await fs.readFile(process.cwd() + '/src/app/json/project-groups.json', 'utf8');
    const projectGroups: string[] = JSON.parse(projectGroupFile).data;

    // map through the object and generate the static parameter
    return projectGroups.map((group) => {
        return {
            "project-group-slug": group
        }
    });

}

export default async function ProjectGroupPage({ params }: {
    params: {
        "project-group-slug": string
    }
}) {

    // fetch the project data
    const projectGroup = params["project-group-slug"];
    // then, for this project group, fetch each project-group.json to get the list of their URLs and displaySections
    const projectsFile = await fs.readFile(process.cwd() + `/src/app/json/${projectGroup}.json`, 'utf8');
    const parsedJSON = JSON.parse(projectsFile);
    // unpack the json into the relevant "props"
    const projects: navigationObject[] = parsedJSON.data;
    const title = parsedJSON.title;


    return (
        <PageLayout>
            <ContentBlockTitle title={`Welcome to ${title}`} />
            <div className="project-card-group">
                {projects.map((section) => <ProjectCard section={section} />)}
            </div>
            <SurpriseMe sections={projects} />
        </PageLayout>
    )
}