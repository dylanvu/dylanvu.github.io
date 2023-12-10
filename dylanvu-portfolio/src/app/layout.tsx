// import Navbar from '@/components/Navbar'
import ParticlesBg from '@/components/ParticlesBg'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// fix the large flashing icon: https://blog.cetindere.de/fix-huge-flashing-icons-fontawesome/
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from "@fortawesome/fontawesome-svg-core";
// Prevent fontawesome from dynamically adding its css since we are going to include it manually
config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dylan Vu',
  description: 'Dylan Vu is a Computer Science student at the University of California, Irvine (UCI), and is an aspiring Software Developer. He does web development, software development, mobile application development, and game development. He is familiar with TypeScript, JavaScript, Flutter, and Python.',
  keywords: "Dylan Vu, Portfolio, Software, Developer, Software Developer, Hackathon, Engineer, Software Engineer, NodeJS, TypeScript, JavaScript, Programming, UCSB, UCI, UC Irvine"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="main">
          {/* floating particles in background  */}
          <ParticlesBg />
          {children}
        </div>
      </body>
    </html>
  )
}
