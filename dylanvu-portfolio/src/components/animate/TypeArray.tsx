'use client'

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import CursorBlinker, { validBlinkingCursorTypes } from "./CursorBlinker";

export default function TypeArray({ texts, cursorClass }: { texts: string[], cursorClass: validBlinkingCursorTypes }) {
    const textIndex = useMotionValue(0);

    const baseText = useTransform(textIndex, (latest) => texts[latest] || "");
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) =>
        baseText.get().slice(0, latest)
    );
    const updatedThisRound = useMotionValue(true);

    useEffect(() => {
        animate(count, 60, {
            type: "tween",
            duration: 1,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 3,
            onUpdate(latest) {
                if (updatedThisRound.get() === true && latest > 0) {
                    updatedThisRound.set(false);
                } else if (updatedThisRound.get() === false && latest === 0) {
                    if (textIndex.get() === texts.length - 1) {
                        textIndex.set(0);
                    } else {
                        textIndex.set(textIndex.get() + 1);
                    }
                    updatedThisRound.set(true);
                }
            }
        });
    }, []);

    return (
        <span>
            <motion.span>
                {displayText}
            </motion.span>
            <CursorBlinker className={cursorClass} />
        </span>
    )
}