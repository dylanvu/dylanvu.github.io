
'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigationObject } from "../NavigationGroup";
import "../../styles/project-card.css"

export default function ProjectCard({ section }: { section: navigationObject }) {
    // use pathname to dynamically link to different subsections
    const pathName = usePathname();
    return (
        <Link href={`${pathName}/${section.urlSegment}`}>
            <div className="project-card">
                {section.displaySection}
            </div>
        </Link>
    )
}