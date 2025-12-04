import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// fix the large flashing icon: https://blog.cetindere.de/fix-huge-flashing-icons-fontawesome/
import { WindowSizeProvider } from "@/hooks/useWindowSizeProvider";
import { SPACE_BACKGROUND_COLOR } from "./theme";

import { CenterOverlayProvider } from "@/hooks/useCenterOverlay";
import { TopOverlayProvider } from "@/hooks/useTopOverlay";
import NightSky from "@/components/star-revamp/NightSky";
import { FocusProvider } from "@/hooks/useFocusProvider";
import { PolarisProvider } from "@/hooks/Polaris/usePolarisProvider";
import PortraitModeOverlay from "@/components/PortraitModeOverlay";
import { Analytics } from '@vercel/analytics/next';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Dylan Vu - Software Developer | Web, Embedded, Mobile & Game Development",
  description:
    "Dylan Vu is a Software Developer currently working for Amazon Health, One Medical that graduated from UC Irvine. He specializes in web, mobile, and game development with expertise in TypeScript, JavaScript, Flutter, and Python. Dylan's experience spans software engineering, hackathons, and projects in NodeJS and full-stack development.",
  keywords:
    "Dylan Vu, Software Developer, Full-Stack Developer, Web Development, Mobile Development, Embedded Systems, IoT, Internet of Things, Game Development, Amazon Health, One Medical, UCI, UC Irvine, Computer Science, TypeScript, JavaScript, Flutter, Python, NodeJS, Hackathon, Software Engineering",
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1.0,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ backgroundColor: SPACE_BACKGROUND_COLOR }}>
      <body className={inter.className} style={{ backgroundColor: SPACE_BACKGROUND_COLOR }}>
        <main className="main">
          <WindowSizeProvider>
            <CenterOverlayProvider>
              <PolarisProvider>
                <TopOverlayProvider>
                  <FocusProvider>
                    {/* children here really just refers to the side panels that appear when you go to a specific link */}
                    <NightSky>{children}</NightSky>
                  </FocusProvider>
                </TopOverlayProvider>
              </PolarisProvider>
            </CenterOverlayProvider>
            <PortraitModeOverlay />
          </WindowSizeProvider>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
