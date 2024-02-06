import ContentBlockTitle from "@/components/content-block/ContentBlockTitle"
// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faFile } from '@fortawesome/free-solid-svg-icons'
import "../../../styles/contact.css"


export default function ResumeSocials() {
    return (
        <div>
            <div>
                <ContentBlockTitle title="Contact Me" />
                <div className="content-block">
                    <div className="contact-icon-block">
                        <div>
                            <a href="mailto:dylanvu9@gmail.com" target="_blank" rel="noreferrer" className="contact-icon-link">
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="contact-icon"
                                />
                            </a>
                        </div>
                        <div>
                            <a href="https://github.com/dylanvu" target="_blank" rel="noreferrer" className="contact-icon-link">
                                <FontAwesomeIcon
                                    icon={faGithub}
                                    className="contact-icon"
                                />
                            </a>
                        </div>
                        <div>
                            <a href="https://www.linkedin.com/in/dylanvu9/" target="_blank" rel="noreferrer" className="contact-icon-link">
                                <FontAwesomeIcon
                                    icon={faLinkedinIn}
                                    className="contact-icon"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <ContentBlockTitle title="Resume" />
                <div className="content-block">
                    <div className="contact-icon-block">
                        <div>
                            <a href="/Dylan_Vu_Resume.pdf" target="_blank" rel="noreferrer" className="contact-icon-link">
                                <FontAwesomeIcon
                                    icon={faFile}
                                    id="resume"
                                    className="contact-icon"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}