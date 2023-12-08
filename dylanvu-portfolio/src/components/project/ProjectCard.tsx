
'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigationObject } from "../NavigationGroup";
import "../../styles/project-card.css";
import Image from "next/image";

export default function ProjectCard({ section }: { section: navigationObject }) {
    // use pathname to dynamically link to different subsections
    const pathName = usePathname();
    const baseless = pathName.split("/").slice(1).join("/");
    const imageUrl = `/${baseless}/${section.urlSegment}/${section.urlSegment}.png`
    console.log(imageUrl);
    return (
        <Link href={`${pathName}/${section.urlSegment}`} className="project-card">
            <div className="project-card-title">
                {section.displaySection}
            </div>
            <div className="project-card-image-container">
                {/* https://stackoverflow.com/questions/65169431/how-to-set-the-next-image-component-to-100-height */}
                <Image src={imageUrl} alt={section.displaySection} fill objectFit={"contain"} />
            </div>
        </Link>
    )
}