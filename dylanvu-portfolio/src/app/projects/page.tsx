import NavigationGroup, { navigationObject } from "@/components/NavigationGroup"

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
        <div>
            <div>
                Projects
            </div>
            <NavigationGroup sections={sections} />
        </div>
    )
}