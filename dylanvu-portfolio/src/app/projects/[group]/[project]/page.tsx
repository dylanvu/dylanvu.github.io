import { PageLayout } from "@/app/layout"
import "../../../../styles/content-block/content-block.css";
import { navigationObject } from "@/components/NavigationGroup";
import { promises as fs } from "fs";

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


export default function ProjectGroupPage({ params }: { params: { group: string, project: string } }) {
    // generate project pages based on the json located in public
    return (
        <PageLayout>
            <div className="content-block">
                {params.project}
            </div>
        </PageLayout>
    )
}