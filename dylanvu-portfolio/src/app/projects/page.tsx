import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"
import { PageLayout } from "../layout"

export default function Projects() {
    const sections: navigationObject[] = [
        {
            displaySection: "TypeScript/JavaScript",
            urlSegment: "ts-js"
        },
        {
            displaySection: "Python",
            urlSegment: "python"
        },
        {
            displaySection: "Other",
            urlSegment: "other"
        }
    ]
    return (
        <PageLayout>
            <div>
                Projects
            </div>
            <NavigationGroup sections={sections} />
        </PageLayout>
    )
}