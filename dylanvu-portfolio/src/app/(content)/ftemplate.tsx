// 'use client'
// import { usePathname } from 'next/navigation'

// export default function Template({ children }: { children: React.ReactNode }) {
//     const pathname = usePathname();
//     return (
//         <div key={pathname}>
//             {children}
//         </div>
//     )
// }

'use client'
// animation template
import { motion } from "framer-motion";
import { usePathname } from 'next/navigation'
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    useEffect(() => {
        return () => {
            console.log("unmounting from ");
        }
    }, [])
    return (
        <motion.div initial={{ x: "100vw" }}
            animate={{ x: 0 }}
            exit={{ x: "-100vw" }}
            transition={{ bounce: 1, ease: "easeInOut", duration: 1 }}
            key={pathname}
        >
            {children}
        </motion.div>
    )
}