import React from 'react'
import ProjectContent from './ProjectContent'


let PythonProjects = [{
    projectHook: "Ever wanted to convert your Spotify playlist to a YouTube one?",
    projectName: "You-tify",
    projectImage: "/You-tify.png",
    projectDescription: "This was my first hackathon submission."
    },{
    projectHook: "Ever wanted to record the current UCSB course availability with the click of a button?",
    projectName: "GoldWebscraper",
    projectImage: "Something image here",
    projectDescription: "This was my first Python project."
    }]

const ProjectGroup = (props) => {
    return (
        <div className="ProjectGroup">
            <p style={{color: `${props.color}` }}>
                Click on a colored link below!
            </p>
            <br/>
            {PythonProjects.map((project) => (
                <div>
                    <p>
                        {project.projectHook}&nbsp;
                        <span className="text-category" style={{color: `${props.color}` }} >{project.projectName}</span>
                    </p>
                    <br/>
                </div>
            ))}
            {PythonProjects.map((project) => (
                <ProjectContent color={props.color} name={project.projectName} image={project.projectImage} description={project.projectDescription}/>
            ))}
        </div>
    )
}
// When you refresh, the content does not get routed again. Check out https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually
export default ProjectGroup