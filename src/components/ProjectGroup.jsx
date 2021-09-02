import React from 'react'
import ProjectContent from './ProjectContent'
import Collapsible from './Collapsible'

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
            {/* <p className="project-group-title" style={{color: `${props.color}` }}>
                {props.group}
            </p> */}
            <button type="button" className="project-group-title" id={props.scroll} style={{borderColor : `${props.color}`}}>{props.group}</button>
            <br/>
            <br/>
            {props.projects.map((project) => (
                <ProjectContent hook={project.projectHook} title={project.projectName} id={project.projectName} textPath={project.textPath} color={props.color}/>
            ))}
            {/* {props.projects.map((project) => (
                <div>
                    <p>
                        {project.projectHook}&nbsp;
                        <span className="text-category" style={{color: `${props.color}` }} >{project.projectName}</span>
                    </p>
                    <br/>
                </div>
            ))}
            {props.projects.map((project) => (
                <ProjectContent color={props.color} name={project.projectName} image={project.projectImage} description={project.projectDescription}/>
            ))} */}
        </div>
    )
}
// When you refresh, the content does not get routed again. Check out https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually
export default ProjectGroup