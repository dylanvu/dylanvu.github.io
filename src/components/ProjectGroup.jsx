import React from 'react'
import ProjectContent from './ProjectContent'

/* Props
color = string hex color of the project groups
group = string of name of the project group
scroll = css id to scroll to
projects = array of project objects with the following attributes:
    projectHook = string sentence to "hook" someone in
    projectName = name of the specific project
    textPath = path to .txt file containing the project contents in the public folder, relative to the public folder
*/


const ProjectGroup = (props) => {
    return (
        <div className="ProjectGroup">
            <button type="button" className="project-group-title" id={props.scroll} style={{borderColor : `${props.color}`}}>{props.group}</button>
            <br/>
            <br/>
            {props.projects.map((project) => (
                <ProjectContent key={project.projectName} hook={project.projectHook} title={project.projectName} id={project.projectName} textPath={project.textPath} color={props.color}/>
            ))}
        </div>
    )
}
// When you refresh, the content does not get routed again. Check out https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually
export default ProjectGroup