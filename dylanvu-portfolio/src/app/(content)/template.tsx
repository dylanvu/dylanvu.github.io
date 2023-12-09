'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // useEffect(() => {
    //     console.log(pathname)
    // }, [])
    return (
        <div key={pathname}>
            {children}
        </div>
    )
}