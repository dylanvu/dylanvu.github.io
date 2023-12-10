'use client'
// animation template
import { motion } from "framer-motion";
import { usePathname } from 'next/navigation'
// import { useEffect } from "react";

export default function TransitionTemplate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // useEffect(() => {
    //     console.log("mounting " + pathname)
    //     return () => {
    //         console.log("unmounting from " + pathname);
    //     }
    // }, []);
    return (

        <motion.div initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ bounce: 0, ease: "easeInOut", duration: 0.5 }}
            key={pathname}
        >
            {children}
        </motion.div>
    )
}
