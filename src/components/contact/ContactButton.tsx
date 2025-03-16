import solid from "@fortawesome/free-solid-svg-icons";
import brands from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/contact/contact-button.css";

/*
    Button that brings a user to an external website, with an icon and an arrow and a title
*/
export default function ContactButton({
  title,
  link,
  icon,
  id,
}: {
  title: string;
  link: string;
  icon: solid.IconDefinition | brands.IconDefinition;
  id: string;
}) {
  return (
    <a href={link} target="_blank" rel="noreferrer" className="contact-button">
      {title}
      <FontAwesomeIcon icon={icon} id={id} className="contact-button-icon" />
    </a>
  );
}
