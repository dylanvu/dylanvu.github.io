
import "../styles/navigation-group.css";

export interface navigationViewProps {
    sections: string[];
}
export default function NavigationGroup(props: navigationViewProps) {

    return (
        <div className="navigation-group">
            {props.sections.map((section) =>
                <div className="navigation-link">
                    <span className="navigation-link-underline">{section}</span>
                </div>
            )}
        </div>
    )
}