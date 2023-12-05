
// export const getStaticProps = (async (context) => {
//     const res = await fetch('./about/bio.json')
//     const text = await res.json()
//     return { props: { text } }
// }) satisfies GetStaticProps<{
//     text: String
// }>

import ContentBlock from "@/components/content-block/ContentBlock";
import bio from "../../../public/about/bio.json";
import hackathons from "../../../public/about/hackathons.json"
import { PageLayout } from "../layout";

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
    const hackathonList = hackathonItems.map((hackathon) => "* " + hackathon.name);
    const filteredHackathonWinners = hackathonItems.filter((hackathon) => hackathon.awards.length > 0);
    return (
        <PageLayout>
            <div className="content">
                <ContentBlock title="About" paragraphs={aboutParagraphs} />
                <ContentBlock title="Hackathons" paragraphs={hackathonList} />
            </div>
        </PageLayout>
    )
}