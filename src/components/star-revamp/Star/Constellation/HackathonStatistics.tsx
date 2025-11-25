import { Group, Rect, Text } from "react-konva";
import { useState, useRef, useEffect } from "react";
import Konva from "konva";
import { SPACE_TEXT_COLOR, FONT_FAMILY } from "@/app/theme";
import { useFocusContext } from "@/hooks/useFocusProvider";
import { calculateHackathonStatistics } from "@/constants/Hackathons";

interface HackathonStatisticsProps {
  x: number;
  y: number;
  width: number;
}

export default function HackathonStatistics({
  x,
  y,
  width,
}: HackathonStatisticsProps) {
  const { focusedObject } = useFocusContext();
  const isFocused = focusedObject.constellation?.name === "Elevare";
  
  const [opacity, setOpacity] = useState(0);
  const groupRef = useRef<Konva.Group>(null);
  const fadeAnimationRef = useRef<Konva.Tween | null>(null);

  // Get hackathon statistics
  const stats = calculateHackathonStatistics();
  const totalHackathons = stats.competedHackathons.length + stats.filteredHackathonMentorship.length;

  // Format statistics text with rounded hours
  const participatedText = `Participated: ${totalHackathons} hackathons, ~${Math.round(stats.totalHours).toLocaleString()} hours`;
  const competedText = `Competed: ${stats.competedHackathons.length} hackathons, ~${Math.round(stats.hoursCompeted).toLocaleString()} hours, ${stats.filteredHackathonWinners.length} awards`;
  const mentoredText = `Mentored: ${stats.filteredHackathonMentorship.length} hackathons, ~${Math.round(stats.hoursMentored).toLocaleString()} hours`;

  const fontSize = 10;
  const lineHeight = fontSize * 1.4;
  const padding = 8;
  const contentHeight = lineHeight * 3 + padding * 2;

  // Fade animation
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    // Cancel any existing animation
    if (fadeAnimationRef.current) {
      fadeAnimationRef.current.destroy();
      fadeAnimationRef.current = null;
    }

    const targetOpacity = isFocused ? 1 : 0;
    
    fadeAnimationRef.current = new Konva.Tween({
      node,
      duration: 0.5,
      opacity: targetOpacity,
      easing: Konva.Easings.EaseInOut,
      onUpdate: () => {
        setOpacity(node.opacity());
      },
      onFinish: () => {
        if (fadeAnimationRef.current) {
          fadeAnimationRef.current.destroy();
          fadeAnimationRef.current = null;
        }
      },
    });

    fadeAnimationRef.current.play();

    return () => {
      if (fadeAnimationRef.current) {
        fadeAnimationRef.current.destroy();
        fadeAnimationRef.current = null;
      }
    };
  }, [isFocused]);

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y + 5}
      opacity={opacity}
    >
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={contentHeight}
        fill="rgba(0, 0, 0, 0.5)"
        stroke={SPACE_TEXT_COLOR}
        strokeWidth={1}
        cornerRadius={5}
      />

      {/* Statistics Text */}
      <Text
        x={padding}
        y={padding}
        text={participatedText}
        fontSize={fontSize}
        fill={SPACE_TEXT_COLOR}
        fontFamily={FONT_FAMILY.style.fontFamily}
        listening={false}
      />
      
      <Text
        x={padding}
        y={padding + lineHeight}
        text={competedText}
        fontSize={fontSize}
        fill={SPACE_TEXT_COLOR}
        fontFamily={FONT_FAMILY.style.fontFamily}
        listening={false}
      />
      
      <Text
        x={padding}
        y={padding + lineHeight * 2}
        text={mentoredText}
        fontSize={fontSize}
        fill={SPACE_TEXT_COLOR}
        fontFamily={FONT_FAMILY.style.fontFamily}
        listening={false}
      />
    </Group>
  );
}
