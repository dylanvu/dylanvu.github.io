import ContentBlockTitle from "@/components/content-block/ContentBlockTitle"
import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"
import { PageLayout } from "../layout"
import "../../styles/content-block/content-block.css";
import "../../styles/buttons.css";
import SurpriseMe from "@/components/SurpriseMe";

export default function Projects() {
    const sections: navigationObject[] = [
        {
            displaySection: "TypeScript/JavaScript (Web Dev)",
            urlSegment: "ts-js"
        },
        {
            displaySection: "Python (CV, Automation, RPI)",
            urlSegment: "python"
        },
        {
            displaySection: "Flutter (Mobile)",
            urlSegment: "flutter"
        },
        {
            displaySection: "Embedded (MCU, Circuitry)",
            urlSegment: "embedded-systems"
        },
        {
            displaySection: "Other",
            urlSegment: "other"
        }
    ]
    return (
        <PageLayout>
            <NavigationGroup sections={sections} title="Project Categories" />
            <SurpriseMe sections={sections} />
        </PageLayout>
    )
}