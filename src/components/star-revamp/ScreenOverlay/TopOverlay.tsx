import GenericOverlay from "@/components/star-revamp/ScreenOverlay/GenericOverlay";
import { useTopOverlayContext } from "@/hooks/useTopOverlay";

export default function CenterOverlay() {
  const {
    titleText,
    originText,
    aboutText,
    introText,
    overlayVisibility,
    titlePosition,
  } = useTopOverlayContext();
  return (
    <GenericOverlay
      titleText={titleText}
      originText={originText}
      aboutText={aboutText}
      introText={introText}
      overlayVisibility={overlayVisibility}
      titlePosition={titlePosition}
    />
  );
}
