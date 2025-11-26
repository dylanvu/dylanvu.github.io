import { ConstellationData } from "@/interfaces/StarInterfaces";
import { Group, Text } from "react-konva";
import { FONT_FAMILY, SPACE_TEXT_COLOR, FANCY_FONT_FAMILY } from "@/app/theme";
import { useRef } from "react";
import Konva from "konva";

export default function ConstellationLabel({
  data,
  minY,
  height,
  centerX,
}: {
  data: ConstellationData;
  minY: number;
  height: number;
  centerX: number;
}) {
  const constellationLabelRef = useRef<Konva.Text>(null);
  const textRef = useRef<Konva.Text>(null);
  return (
    <Group>
      <Text
        ref={constellationLabelRef}
        x={centerX}
        y={minY + height + (constellationLabelRef.current?.height() ?? 0)}
        text={data.name}
        fontSize={12}
        fill={SPACE_TEXT_COLOR}
        fontFamily={FANCY_FONT_FAMILY.style.fontFamily}
        align="center"
        offsetX={
          constellationLabelRef.current
            ? constellationLabelRef.current.width() / 2
            : 0
        }
      />
      <Text
        ref={textRef}
        x={centerX}
        y={
          minY +
          height +
          (constellationLabelRef.current?.height() ?? 0) +
          (textRef.current?.height() ?? 0) +
          10
        }
        text={data.about}
        fontSize={8}
        fill={SPACE_TEXT_COLOR}
        fontFamily={FONT_FAMILY.style.fontFamily}
        align="center"
        offsetX={textRef.current ? textRef.current.width() / 2 : 0}
      />
    </Group>
  );
}
