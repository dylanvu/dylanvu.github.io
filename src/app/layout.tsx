// import Navbar from '@/components/Navbar'
import ParticlesBg from '@/components/ParticlesBg'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// fix the large flashing icon: https://blog.cetindere.de/fix-huge-flashing-icons-fontawesome/
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from "@fortawesome/fontawesome-svg-core";
import { AnimatePresence } from 'framer-motion';
import TransitionTemplate from '@/components/TransitionTemplate';
// Prevent fontawesome from dynamically adding its css since we are going to include it manually
config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dylan Vu - Software Developer | Web, Embedded, Mobile & Game Development',
  description: "Dylan Vu is a Software Developer currently working for Amazon Health, One Medical that graduated from UC Irvine. He specializes in web, mobile, and game development with expertise in TypeScript, JavaScript, Flutter, and Python. Dylan's experience spans software engineering, hackathons, and projects in NodeJS and full-stack development.",
  keywords: "Dylan Vu, Software Developer, Full-Stack Developer, Web Development, Mobile Development, Embedded Systems, IoT, Internet of Things, Game Development, Amazon Health, One Medical, UCI, UC Irvine, Computer Science, TypeScript, JavaScript, Flutter, Python, NodeJS, Hackathon, Software Engineering"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="main">
          {/* floating particles in background  */}
          <ParticlesBg />
          {children}
        </main>
      </body>
    </html>
  )
}
