import ContentBlockTitle from "@/components/content-block/ContentBlockTitle"
// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faFile } from '@fortawesome/free-solid-svg-icons'
import "../../styles/contact/contact.css"
import ContactIcon from "./ContactIcon"

export default function ContactLinks({isHorizontal}: {isHorizontal?: boolean}) {
    return (
        <div>
            <div>
                <ContentBlockTitle title="My Path So Far" />
                <div className="content-block">
                    <div className="contact-icon-block">
                        <ContactIcon link="/Dylan_Vu_Resume.pdf" icon={faFile} id="resume"/>
                    </div>
                </div>
            </div>
            <div>
                <ContentBlockTitle title="Find Me Around" />
                <div className="content-block">
                    <div className={`contact-icon-block ${isHorizontal ? "horizontal" : null}`}>
                        <ContactIcon link="mailto:dylanvu9@gmail.com" icon={faEnvelope} id="email"/>
                        <ContactIcon link="https://github.com/dylanvu" icon={faGithub} id="github"/>
                        <ContactIcon link="https://www.linkedin.com/in/dylanvu9/" icon={faLinkedinIn} id="linkedin"/>
                    </div>
                </div>
            </div>
        </div>
    )
}