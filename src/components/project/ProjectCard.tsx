
'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigationObject } from "../NavigationGroup";
import "../../styles/project/project-card.css";
import Image from "next/image";
import { motion } from "framer-motion"
import { ImageExtension } from "../content-block/Paragraph";

export interface ProjectCardInterface extends navigationObject {
    extension: ImageExtension
}

export default function ProjectCard({ section }: { section: ProjectCardInterface }) {
    // use pathname to dynamically link to different subsections
    const pathName = usePathname();
    const baseless = pathName.split("/").slice(1).join("/");
    const extension: ImageExtension = section.extension ?? "png"
    const imageUrl = `/${baseless}/${section.urlSegment}/${section.urlSegment}.${extension}`
    return (
        <motion.div initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}>
            <Link href={pathName == "/" ? `${section.urlSegment}` : `${pathName}/${section.urlSegment}`} className="project-card">
                <div className="project-card-title">
                    {section.displaySection}
                </div>
                <div className="project-card-image-container">
                    {/* https://stackoverflow.com/questions/65169431/how-to-set-the-next-image-component-to-100-height */}
                    <Image src={imageUrl} alt={section.displaySection} width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '100%', height: 'auto', objectFit: "contain" }} />
                </div>
            </Link>
        </motion.div>
    )
}