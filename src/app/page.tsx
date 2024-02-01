import ProjectHighlight from '@/components/project/ProjectHighlight'
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
      urlSegment: "contact"
    }
  ]

  const highlights: navigationObject[] = [
    {
      displaySection: "Amelia",
      urlSegment: "projects/embedded/amelia"
    },
    {
      displaySection: "SweetStack",
      urlSegment: "projects/games/sweetstack"
    },
    {
      displaySection: "FishGPT",
      urlSegment: "projects/web-development/fishgpt"
    },
    {
      displaySection: "WordShip",
      urlSegment: "projects/games/wordship"
    },
    {
      displaySection: "Chemical Engineering Careers Bot",
      urlSegment: "projects/web-development/aiche-careers"
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
          <div className="project-highlight-group">
            {highlights.map((item, index) => {
              return <ProjectHighlight section={item} index={index} key={"highlight-" + item.urlSegment} />
            })}
          </div>
          <NavigationGroup sections={sections} title="Where To?" />
        </div>
      </div>
    </div>
  )
}
