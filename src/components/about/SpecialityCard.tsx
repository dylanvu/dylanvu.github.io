import "@/styles/content-block/paragraph.css";
import "@/styles/content-block/content-block.css";
import { motion } from "motion/react";

// import "../../styles/content-block/paragraph.css";

export default function SpecialtyCard({
  title,
  skills,
  proof,
  idx,
}: {
  title: string;
  skills: string[];
  proof: string[];
  idx: number[];
}) {
  let animationOffset = 300;
  const difference = idx[0] - idx[1];
  if (difference === 1 || difference === 0) {
    // right button
  } else if (difference === -1) {
    // left button
    animationOffset = animationOffset * -1;
  } else if (idx[0] < idx[1] && difference < -1) {
    // right button, we circled around
  } else {
    // left button, we circled around
    animationOffset = animationOffset * -1;
  }
  return (
    <motion.div
      initial={{ x: animationOffset, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -1 * animationOffset, opacity: 0 }}
    >
      <div className="content-block">
        <div>{title}</div>
        <div className="paragraph">Specializing in...</div>
        {skills.map((skill) => (
          <div className="paragraph" key={skill}>
            <li className="paragraph-bullet">{skill}</li>
          </div>
        ))}
        <div className="paragraph">Proven by...</div>
        {proof.map((evidence) => (
          <div className="paragraph" key={evidence}>
            <li className="paragraph-bullet">{evidence}</li>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
