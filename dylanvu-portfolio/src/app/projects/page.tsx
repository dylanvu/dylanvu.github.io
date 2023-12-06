import ContentBlockTitle from "@/components/content-block/ContentBlockTitle"
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
            displaySection: "Flutter",
            urlSegment: "flutter"
        },
        {
            displaySection: "Embedded Systems",
            urlSegment: "embedded-systems"
        },
        {
            displaySection: "Other",
            urlSegment: "other"
        }
    ]
    return (
        <PageLayout>
            <ContentBlockTitle title="Project Categories" />
            <NavigationGroup sections={sections} />
        </PageLayout>
    )
}