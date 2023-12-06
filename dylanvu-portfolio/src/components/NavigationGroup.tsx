'use client'

import "../styles/navigation-group.css";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useEffect } from "react";

export interface navigationObject {
    displaySection: string; // what will be displayed to the user
    urlSegment: string; // the actual url
}
export interface navigationViewProps {
    sections: navigationObject[];
}
export default function NavigationGroup(props: navigationViewProps) {
    // use pathname to dynamically link to different subsections
    const pathName = usePathname();
    return (
        <div className="navigation-group">
            {props.sections.map((section) =>
                <div className="navigation-link navigation-link-underline" key={section.urlSegment}>
                    {/* <span className="navigation-link-underline"><Link href={pathName == "/" ? `${section.urlSegment}` : `${pathName}/${section.urlSegment}`} >{section.displaySection}</Link></span> */}
                    <Link href={pathName == "/" ? `${section.urlSegment}` : `${pathName}/${section.urlSegment}`} >{section.displaySection}</Link>
                </div>
            )}
        </div>
    )
}