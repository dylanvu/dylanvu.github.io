'use client'
import "../styles/navigation-group.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { navigationObject } from "./NavigationGroup";


export default function NavigationGroupEntry({ section }: { section: navigationObject }) {
    // use pathname to dynamically link to different subsections
    const pathName = usePathname();
    const [chevronState, setChevronState] = useState<"up" | "right" | "left">("up");

    return (
        <div className="navigation-link navigation-link-underline" key={section.urlSegment}
            onMouseEnter={() => {
                setChevronState("right");
            }}
            onMouseLeave={() => {
                setChevronState("up");
            }}
            onMouseUp={() => {
                setChevronState("left");
            }}
        >
            <FontAwesomeIcon icon={faChevronUp} className={`chevron-icon chevron-${chevronState}`} />
            {/* <span className="navigation-link-underline"><Link href={pathName == "/" ? `${section.urlSegment}` : `${pathName}/${section.urlSegment}`} >{section.displaySection}</Link></span> */}
            <Link href={pathName == "/" ? `${section.urlSegment}` : `${pathName}/${section.urlSegment}`} >{section.displaySection}</Link>
        </div>
    )
}