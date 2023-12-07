import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"
import { PageLayout } from "../layout"
import "../../styles/content-block/content-block.css";
import "../../styles/buttons.css";
import SurpriseMe from "@/components/SurpriseMe";

export default function Projects() {
    const sections: navigationObject[] = [
        {
            displaySection: "TypeScript/JavaScript",
            info: "Web Development",
            urlSegment: "ts-js"
        },
        {
            displaySection: "Python",
            info: "Computer Vision, Automation, Raspberry Pi Applications",
            urlSegment: "python"
        },
        {
            displaySection: "Flutter",
            info: "Mobile Development",
            urlSegment: "flutter"
        },
        {
            displaySection: "Embedded (MCU, Circuitry)",
            info: "Microcontrollers, Circuitry, Hardware",
            urlSegment: "embedded"
        },
        {
            displaySection: "Other",
            info: "Other Stuff",
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