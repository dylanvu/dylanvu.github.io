import { PageLayout } from "@/app/layout"
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import NavigationGroup, { navigationObject } from "@/components/NavigationGroup";
import ProjectCard from "@/components/project/ProjectCard";
import SurpriseMe from "@/components/SurpriseMe";
import "../../../styles/content-block/content-block.css";
import "../../../styles/project-card.css";
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
        },
        {
            displaySection: "Project 5",
            urlSegment: "project-5"
        },
        {
            displaySection: "Project 6",
            urlSegment: "project-6"
        }
    ];

    return (
        <PageLayout>
            <ContentBlockTitle title="Welcome to {PROJECT GROUP}" />
            <div className="project-card-group">
                {sections.map((section) => <ProjectCard section={section} />)}
            </div>
            {/* <NavigationGroup sections={sections} title="Welcome to {PROJECT GROUP}" /> */}
            <SurpriseMe sections={sections} />
        </PageLayout>
    )
}