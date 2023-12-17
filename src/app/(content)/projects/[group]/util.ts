import { navigationObject } from "@/components/NavigationGroup";
import { promises as fs } from 'fs';
// dynamically generate each project-group page from the list of project-groups 
export async function handleGenerateStaticParams() {
    // first, get each project group in projects.json (aka "ts-js", "python", etc)
    // this serves as the URL of the page ("projects/ts-js") with all the projects details

    // grab the list of all the project-groups: ["ts-js", "python", "flutter", etc]
    const projectGroupFile = await fs.readFile(process.cwd() + '/src/app/json/project-groups.json', 'utf8');
    const projectGroups: navigationObject[] = JSON.parse(projectGroupFile).data;

    // map through the object and generate the static parameter
    return projectGroups.map((group) => ({
        group: group.urlSegment
    }
    ));
}