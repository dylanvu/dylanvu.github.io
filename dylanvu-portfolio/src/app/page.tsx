import Image from 'next/image'
import Contributions from '../components/Contributions'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import NavigationGroup, { navigationObject } from '../components/NavigationGroup'

export default function Home() {

  const sections: navigationObject[] = [
    {
      displaySection: "Projects",
      urlSegment: "projects"
    },
    {
      displaySection: "About",
      urlSegment: "about"
    },
    {
      displaySection: "Resume & Socials",
      urlSegment: "resume-socials"
    }
  ]

  return (
    <div>
      <Header />
      <Navbar />
      <div className="content-container">
        {/* place all important content here */}
        <div className="content">
          <Contributions />
          <NavigationGroup sections={sections} title="Where To?" />
        </div>
      </div>
    </div>
  )
}
