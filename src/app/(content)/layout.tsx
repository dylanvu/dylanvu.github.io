"use client";
import Navbar from "@/components/Navbar";
import { AnimatePresence } from "motion/react";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <div className="content-container">
        <div className="content">
          <div className="page">
            <AnimatePresence
              mode="wait"
              onExitComplete={() => console.log("Animate exit")}
            >
              {/* <motion.div initial={{ x: "100vw" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100vw" }}
                                transition={{ bounce: 0, ease: "easeInOut", duration: 1 }}
                                key={pathname}
                                className={pathname}
                            > */}
              {children}
              {/* </motion.div> */}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
