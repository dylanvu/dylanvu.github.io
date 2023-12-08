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
    // first, get each project group in projects.json
    // const projectGroups = await fetch("/projects.json");

    let projectNavigations: { "project-group-slug": string }[] = [];

    const projectGroupFile = await fs.readFile(process.cwd() + '/src/app/json/project-groups.json', 'utf8');
    const projectGroups: string[] = JSON.parse(projectGroupFile).data;

    // map through the object
    return projectGroups.map((group) => {
        return {
            "project-group-slug": group
        }
    });

}

interface projectInformation {
    title: string,
    sections: navigationObject[]
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
    const projects = parsedJSON.data;
    const title = parsedJSON.title;
    let projectNavigations: navigationObject[] = [];
    for (const project of projects) {
        projectNavigations.push({ displaySection: project.displaySection, urlSegment: project.urlSegment });
    }
    // create the object


    return (
        <PageLayout>
            <ContentBlockTitle title={`Welcome to ${title}`} />
            <div className="project-card-group">
                {projectNavigations.map((section) => <ProjectCard section={section} />)}
            </div>
            <SurpriseMe sections={projectNavigations} />
        </PageLayout>
    )
}