'use client'
import Navbar from "@/components/Navbar"
import TransitionTemplate from "@/components/TransitionTemplate"
export default function PageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <Navbar />
            <div className="content-container">
                <div className="content">
                    <div className="page">
                        <TransitionTemplate children={children} />
                        {/* {children} */}
                    </div>
                </div>
            </div>
        </div >
    )
}