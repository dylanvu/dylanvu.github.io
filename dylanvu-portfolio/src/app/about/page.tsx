
// export const getStaticProps = (async (context) => {
//     const res = await fetch('./about/bio.json')
//     const text = await res.json()
//     return { props: { text } }
// }) satisfies GetStaticProps<{
//     text: String
// }>

import ContentBlock from "@/components/content-block/ContentBlock";
import ContentBlockTitle from "@/components/content-block/ContentBlockTitle";
import bio from "../../../public/about/bio.json";
import hackathons from "../../../public/about/hackathons.json"
import { PageLayout } from "../layout";

import "../../styles/content-block/paragraph.css";
import "../../styles/content-block/content-block.css";


/**
 * Inteface to represent a hackathon in the public/about/hackathon.json file
 */
interface HackathonItem {
    name: string, // name of the hackathon
    awards: string[] // list of awards, if any
}

export default function About({ text }: { text: string }) {
    // parse the text, separate by newline, and then create many Paragraph blocks
    const aboutParagraphs: string[] = bio.data.split("\n");
    // process the hackathons
    const hackathonItems: HackathonItem[] = hackathons.data;
    const hackathonList = hackathonItems.map((hackathon) => {
        let hackathonParagraph = "* " + hackathon.name;
        const awards = hackathon.awards;
        if (awards.length > 0) {
            // concatenate the awards
            hackathonParagraph = hackathonParagraph + " - ";
            for (const [index, award] of awards.entries()) {
                hackathonParagraph += `${award}`;
                if (index != awards.length - 1) {
                    hackathonParagraph += ", "
                }
            }
        }
        return hackathonParagraph;
    });
    const competedHackathons = hackathonItems.filter((hackathon) => !hackathon.name.toLowerCase().includes("mentor"));
    const filteredHackathonWinners = competedHackathons.filter((hackathon) => hackathon.awards.length > 0);
    const filteredHackathonMentorship = hackathonItems.filter((hackathon) => hackathon.name.toLowerCase().includes("mentor"));
    return (
        <PageLayout>
            <div className="content">
                <ContentBlock title="About" paragraphs={aboutParagraphs} />
                <div className="content-block">
                    <ContentBlockTitle title="Hackathon Statistics" />
                    {/* we are not using ContentBlock here because I want to animate the numbers counting up */}
                    <div>
                        Participated:  {hackathonList.length}
                    </div>
                    <div>
                        Competed:  {competedHackathons.length}
                    </div>
                    <div>
                        Awards: {filteredHackathonWinners.length}
                    </div>
                    <div>
                        Mentored: {filteredHackathonMentorship.length}
                    </div>
                </div>
                <ContentBlock title="Hackathon List" paragraphs={hackathonList} />
            </div>
        </PageLayout>
    )
}