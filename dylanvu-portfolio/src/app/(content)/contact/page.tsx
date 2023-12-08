import ContentBlockTitle from "@/components/content-block/ContentBlockTitle"
// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import "../../../styles/contact.css"


export default function ResumeSocials() {
    return (
        <div>
            <div>
                <ContentBlockTitle title="Resume" />
                <div className="content-block">
                    Here's my resume!
                </div>
            </div>
            <div>
                <ContentBlockTitle title="Contact Me" />
                <div className="content-block">
                    <a href="https://github.com/dylanvu" target="_blank" rel="noreferrer" className="contact-icon">
                        <FontAwesomeIcon
                            icon={faGithub}
                            id="github"
                            className="icon"
                        />
                    </a>
                    <a href="https://www.linkedin.com/in/dylanvu9/" target="_blank" rel="noreferrer" className="contact-icon">
                        <FontAwesomeIcon
                            icon={faLinkedinIn}

                            className="icon"
                        />
                    </a>
                    <a href="mailto:dylanvu9@gmail.com" target="_blank" rel="noreferrer" className="contact-icon">
                        <FontAwesomeIcon
                            icon={faEnvelope}

                            className="icon"
                        />
                    </a>
                </div>
            </div>
        </div>
    )
}