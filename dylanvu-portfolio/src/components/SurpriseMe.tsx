'use client'
import ContentBlockTitle from "./content-block/ContentBlockTitle"
import { navigationObject } from "./NavigationGroup"
import { usePathname, useRouter } from 'next/navigation'
import "../styles/buttons.css"

export default function SurpriseMe({ sections }: { sections: navigationObject[] }) {
    const pathName = usePathname();
    const router = useRouter()

    return (
        <div className="content-block">
            <ContentBlockTitle title="Can't Decide?" />
            <div>
                Are you stuck? Not sure where to go?
            </div>
            <button className="surprise-me-button shimmer" onClick={() => {
                // send to random page
                router.push(`${pathName}/${sections[Math.floor(Math.random() * sections.length)].urlSegment}`);
            }}>
                Surprise Me!
            </button>
        </div>
    )
}