import {
  FONT_FAMILY,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";
import { Layer, Stage } from "react-konva";
import BackgroundStarField from "@/components/star-revamp/Star/BackgroundStarField";
import MainStarField from "@/components/star-revamp/Star/MainStarField";
import { motion, AnimatePresence } from "motion/react";

export default function MainStage() {
  return (
    <>
      {/* full screen overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            color: SPACE_TEXT_COLOR,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "5rem",
          }}
          className={FONT_FAMILY.className}
        >
          Dylan Vu
        </motion.div>
      </AnimatePresence>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background: SPACE_BACKGROUND_COLOR }}
      >
        <Layer>
          <BackgroundStarField
            width={window.innerWidth}
            height={window.innerHeight}
            starCount={200}
          />
          <MainStarField />
        </Layer>
      </Stage>
    </>
  );
}
