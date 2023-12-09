'use client'
// animation template
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from 'next/navigation'

export default function ScrollTemplate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    return (
        <AnimatePresence>
            <motion.div initial={{ x: "100vw" }}
                animate={{ x: 0 }}
                exit={{ x: "-100vw" }}
                transition={{ bounce: 0 }} key={pathname}>
                {children}
            </motion.div>
        </AnimatePresence>
    )
}