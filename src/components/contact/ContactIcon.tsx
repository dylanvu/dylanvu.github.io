import solid from "@fortawesome/free-solid-svg-icons";
import brands from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/styles/contact/contact.css";

export default function ContactIcon({
  link,
  icon,
  id,
}: {
  link: string;
  icon: solid.IconDefinition | brands.IconDefinition;
  id: string;
}) {
  return (
    <div>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="contact-icon-link"
      >
        <FontAwesomeIcon icon={icon} id={id} className="contact-icon" />
      </a>
    </div>
  );
}
