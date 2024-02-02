'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigationObject } from "../NavigationGroup";
import "../../styles/project/project-highlight.css";
import Image from "next/image";

import { motion } from "framer-motion"

export type validHighlightExtensions = "png" | "gif" | "jpg";

/**
 * Component for the main section, a super flashy and large card
 */
export default function ProjectHighlight({ section, index, description, extension }: { section: navigationObject, index: number, description: string, extension: validHighlightExtensions }) {
    // use pathname to dynamically link to different subsections
    const pathName = usePathname();
    const imageUrl = `/highlights/${section.urlSegment.split("/").at(-1)}.${extension}`;

    // do a media query
    const isSmallScreen = window.matchMedia('(max-width: 1023px)').matches;
    console.log(isSmallScreen)

    let first = <Link href={pathName == "/" ? `${section.urlSegment}` : `${pathName}/${section.urlSegment}`} className={`project-highlight rotate-${index % 2 ? "right" : "left"}`}>
        <div className="project-highlight-title">
            {section.displaySection}
        </div>
        <div className="project-highlight-image-container">
            {/* https://stackoverflow.com/questions/65169431/how-to-set-the-next-image-component-to-100-height */}
            <Image src={imageUrl} alt={section.displaySection}
                fill
                objectFit="contain"
            // width={0}
            // height={0}
            // sizes="100vw"
            // style={{ width: '100%', height: 'auto', objectFit: "contain" }}
            />
        </div>
    </Link>

    let second = <div className="project-highlight-desc">
        {description}
    </div>

    if (index % 2 && !isSmallScreen) {
        // swap order
        let temp = first;
        first = second;
        second = temp;
    }

    return (
        <motion.div initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="project-highlight-group">
            {first}
            {second}
        </motion.div>
    )
}