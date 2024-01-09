import "../../../../../styles/content-block/content-block.css";
import { navigationObject } from "@/components/NavigationGroup";
import { promises as fs } from "fs";
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import Paragraph from "@/components/content-block/Paragraph";
import { redirect } from "next/navigation";
import TransitionTemplate from "@/components/TransitionTemplate";

// dynamically generate each project page from the parameter 
export async function generateStaticParams({
    params: { group },
}: {
    params: { group: string }
}) {
    // for this project group, fetch each project-group.json to get the list of their URLs and displaySections
    const projectsFile = await fs.readFile(process.cwd() + `/src/app/json/${group}.json`, 'utf8');
    const parsedJSON = JSON.parse(projectsFile);
    // unpack the json into the relevant "props"
    const navigationObjects: navigationObject[] = parsedJSON.data;
    return navigationObjects.map((project) => { project: project.urlSegment });
}


export default async function ProjectGroupPage({ params }: { params: { group: string, project: string } }) {
    // generate project pages based on the txt file located in public

    // fetch the project data
    const group = params.group;
    const project = params.project;
    // then, for this project group, fetch each project-group.json to get the list of their URLs and displaySections
    let projectsFile;
    try {
        projectsFile = await fs.readFile(process.cwd() + `/src/app/txt/projects/${group}/${project}.txt`, 'utf8');
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
                {content.map((paragraph, index) =>
                    <Paragraph text={paragraph} key={"_" + paragraph + index.toString()} />
                )}
            </div>
        </TransitionTemplate>
    )
}