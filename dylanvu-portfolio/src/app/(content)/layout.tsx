import Navbar from "@/components/Navbar"
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
                        {children}
                    </div>
                </div>
            </div>
        </div >
    )
}