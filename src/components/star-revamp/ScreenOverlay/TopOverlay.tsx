import GenericOverlay from "@/components/star-revamp/ScreenOverlay/GenericOverlay";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";

export default function CenterOverlay() {
  const {
    titleText,
    originText,
    aboutText,
    introText,
    overlayVisibility,
    horizontalPosition,
  } = useTopOverlayContext();
  return (
    <GenericOverlay
      overlayName="Top"
      titleText={titleText}
      originText={originText}
      aboutText={aboutText}
      introText={introText}
      overlayVisibility={overlayVisibility}
      titlePosition={"top"}
      horizontalPosition={horizontalPosition}
    />
  );
}
