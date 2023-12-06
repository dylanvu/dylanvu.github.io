import ContentBlockTitle from "@/components/content-block/ContentBlockTitle"
import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"
import { PageLayout } from "../layout"
import "../../styles/content-block/content-block.css";

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
            <div className="content-block">
                <ContentBlockTitle title="Project Categories" />
                <NavigationGroup sections={sections} />
            </div>
        </PageLayout>
    )
}