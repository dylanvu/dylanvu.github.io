import ProjectHighlight, {
  validHighlightExtensions,
} from "@/components/project/ProjectHighlight";
import Contributions from "../components/Contributions";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import "../styles/project/project-highlight.css";
import NavigationGroup, {
  navigationObject,
} from "../components/NavigationGroup";
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import ContactLinks from "@/components/contact/ContactLinks";

interface highlightObject extends navigationObject {
  description: string;
  extension: validHighlightExtensions;
}

export default function Home() {
  const sections: navigationObject[] = [
    {
      displaySection: "Projects",
      urlSegment: "projects",
    },
    {
      displaySection: "About",
      urlSegment: "about",
    },
    {
      displaySection: "Resume & Socials",
      urlSegment: "contact",
    },
  ];

  const highlights: highlightObject[] = [
    {
      displaySection: "Amelia",
      urlSegment: "projects/embedded/amelia",
      description: `A physical generative AI travel companion brought to life through hardware and a Large Action Model!`,
      extension: "png",
    },
    {
      displaySection: "SweetStack",
      urlSegment: "projects/games/sweetstack",
      description:
        "An addictive and aesthetic two-player collaborative cake-stacking game—programmed with surprising algorithmic complexity!",
      extension: "gif",
    },
    {
      displaySection: "FishGPT",
      urlSegment: "projects/web-development/fish-gpt",
      description: `Challenging UCI's perception of a "WebJam." Talk to your fish through a computer vision and hardware-powered chatbot!`,
      extension: "gif",
    },
    {
      displaySection: "WordShip",
      urlSegment: "projects/games/wordship",
      description:
        "Wordle + shooter = 1v1 competitive manic shooter. A unique game born from the blending of two very different games!",
      extension: "gif",
    },
    {
      displaySection: "Discord Careers Bot",
      urlSegment: "projects/web-development/aiche-careers",
      description:
        "Solving a club's career crisis one job at a time. Circumventing LinkedIn's rules through a creative approach!",
      extension: "gif",
    },
  ];

  return (
    <div>
      <Header />
      <Navbar />
      <div className="content-container">
        {/* place all important content here */}
        <div className="content">
          <ContentBlockTitle title={"What I'm Up To"} />
          <Contributions />
          <ContentBlockTitle title={"Best of the Best"} />
          {highlights.map((item, index) => {
            return (
              <ProjectHighlight
                section={item}
                index={index}
                key={"highlight-" + item.urlSegment}
                description={item.description}
                extension={item.extension}
              />
            );
          })}
          <ContactLinks/>
        </div>
      </div>
    </div>
  );
}
