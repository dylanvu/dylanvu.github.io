import "../styles/navigation-group.css";
import NavigationGroupEntry from "./NavigationGroupEntry";

export interface navigationObject {
    displaySection: string; // what will be displayed to the user
    urlSegment: string; // the actual url
}
export interface navigationViewProps {
    sections: navigationObject[];
}
export default function NavigationGroup(props: navigationViewProps) {
    return (
        <div className="navigation-group">
            {props.sections.map((section) =>
                <NavigationGroupEntry section={section} />
            )}
        </div>
    )
}