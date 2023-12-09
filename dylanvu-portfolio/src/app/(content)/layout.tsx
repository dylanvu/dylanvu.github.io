'use client'
import Navbar from "@/components/Navbar"
import ScrollTemplate from "@/components/ScrollTemplate"
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
                        <ScrollTemplate children={children} />
                        {/* {children} */}
                    </div>
                </div>
            </div>
        </div >
    )
}