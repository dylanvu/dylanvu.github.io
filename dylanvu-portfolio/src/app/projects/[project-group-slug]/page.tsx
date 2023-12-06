import { PageLayout } from "@/app/layout"
import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"
export default function ProjectGroupPage() {
    // generate list of projects based on the json located in public

    const sections: navigationObject[] = [
        {
            displaySection: "Project 1",
            urlSegment: "project-1"
        },
        {
            displaySection: "Project 2",
            urlSegment: "project-2"
        },
        {
            displaySection: "Project 3",
            urlSegment: "project-3"
        },
        {
            displaySection: "Project 4",
            urlSegment: "project-4"
        }
    ];

    return (
        <PageLayout>
            <div>
                <NavigationGroup sections={sections} />
                <div>
                    Surprise me!
                </div>
            </div>
        </PageLayout>
    )
}