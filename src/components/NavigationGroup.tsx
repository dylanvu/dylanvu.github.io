import "../styles/navigation-group.css";
import ContentBlockTitle from "./content-block/ContentBlockTitle";
import NavigationGroupEntry from "./NavigationGroupEntry";

/**
 * displaySection: string,
 * urlSegment: string,
 * info?: string
 */
export interface navigationObject {
  displaySection: string; // what will be displayed to the user
  urlSegment: string; // the actual url
  info?: string; // info to put under the entry
}
export default function NavigationGroup({
  sections,
  title,
}: {
  sections: navigationObject[];
  title: string;
}) {
  return (
    <div className="content-block navigation-group-container">
      <ContentBlockTitle title={title} />
      <div className="navigation-group">
        {sections.map((section, index) => (
          <NavigationGroupEntry
            section={section}
            key={"_" + section.urlSegment + index.toString()}
          />
        ))}
      </div>
    </div>
  );
}
