import { promises as fs } from "fs";
import { navigationObject } from "@/components/NavigationGroup";

// dynamically generate each project page from the parameter 
export async function handleGenerateStaticParams(group: string) {
    // for this project group, fetch each project-group.json to get the list of their URLs and displaySections
    const projectsFile = await fs.readFile(process.cwd() + `/src/app/json/${group}.json`, 'utf8');
    const parsedJSON = JSON.parse(projectsFile);
    // unpack the json into the relevant "props"
    const navigationObjects: navigationObject[] = parsedJSON.data;
    return navigationObjects.map((project) => { project: project.urlSegment });
}