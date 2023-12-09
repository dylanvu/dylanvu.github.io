'use client'
// animation template
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollTemplate({ children }: { children: React.ReactNode }) {
    return (
        <AnimatePresence>
            <motion.div initial={{ x: "100vw" }}
                animate={{ x: 0 }}
                exit={{ x: "-100vw" }}
                transition={{ bounce: 0 }} >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}