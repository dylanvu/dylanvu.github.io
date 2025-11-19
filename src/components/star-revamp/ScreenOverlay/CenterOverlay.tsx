import GenericOverlay from "@/components/star-revamp/ScreenOverlay/GenericOverlay";
import { useCenterOverlayContext } from "@/hooks/useCenterOverlay";

export default function CenterOverlay() {
  const {
    titleText,
    originText,
    aboutText,
    introText,
    overlayVisibility,
    horizontalPosition,
  } = useCenterOverlayContext();
  return (
    <GenericOverlay
      overlayName="Center"
      titleText={titleText}
      originText={originText}
      aboutText={aboutText}
      introText={introText}
      overlayVisibility={overlayVisibility}
      titlePosition={"center"}
      horizontalPosition={horizontalPosition}
    />
  );
}
