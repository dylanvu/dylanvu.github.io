'use client'
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import CursorBlinker, { validBlinkingCursorTypes } from "./CursorBlinker";


// reference: https://blog.noelcserepy.com/how-i-created-a-typing-text-animation-with-framer-motion
export default function TypeOnce({ text, cursorClass }: { text: string, cursorClass: validBlinkingCursorTypes }) {
    const count = useMotionValue(0);
    useEffect(() => {
        const controls = animate(count, text.length, {
            type: "tween",
            duration: 2,
            ease: "linear"
        });
        return controls.stop;
    }, []);

    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) =>
        text.slice(0, latest)
    );

    return (
        <span>
            <motion.span>
                {displayText}
            </motion.span>
            <CursorBlinker className={cursorClass} />
        </span>
    )
}