'use client'
import { navigationObject } from "./NavigationGroup"
import { usePathname, useRouter } from 'next/navigation'
import "../styles/buttons.css"
import "../styles/surprise-me.css"

export default function SurpriseMe({ sections }: { sections: navigationObject[] }) {
    const pathName = usePathname();
    const router = useRouter()

    return (
        <div className="content-block surprise-me-container">
            <div className="surprise-me-title" >
                Can&apos;t Decide?
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