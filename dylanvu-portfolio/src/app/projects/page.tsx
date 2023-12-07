import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"
import { PageLayout } from "../layout"
import "../../styles/content-block/content-block.css";
import "../../styles/buttons.css";
import SurpriseMe from "@/components/SurpriseMe";

export default function Projects() {
    const sections: navigationObject[] = [
        {
            displaySection: "TypeScript/JavaScript",
            info: "Web Dev, Discord Bots",
            urlSegment: "ts-js"
        },
        {
            displaySection: "Python",
            info: "Computer Vision, Rasp. Pi Stuff, Web Scraping",
            urlSegment: "python"
        },
        {
            displaySection: "Flutter",
            info: "App Dev",
            urlSegment: "flutter"
        },
        {
            displaySection: "Embedded (MCU, Circuitry)",
            info: "Arduino, ESP32, Circuitry, Hardware",
            urlSegment: "embedded"
        },
        {
            displaySection: "Other",
            info: "Anything & Everything Else",
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