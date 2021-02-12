import React from 'react'
import ProjectContent from './ProjectContent'
import { BrowserRouter as Router, Link, useRouteMatch, Switch, Route } from 'react-router-dom'


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
    let { path, url } = useRouteMatch();
    //TODO: If there's a space in the project name, replace it with a hyphen for the URL?

    return (
        <Router className="ProjectGroup">
            <p style={{color: `${props.color}` }}>
                Click on a colored link below!
            </p>
            <br/>
            {PythonProjects.map((project) => (
                <div>
                    <p>
                        {project.projectHook}&nbsp;
                        <Link to={url + "/" + project.projectName} className="link">
                            <span className="text-category" style={{color: `${props.color}` }} >{project.projectName}</span>
                        </Link>
                    </p>
                    <br/>
                </div>
            ))}
            <br/><br/>
            <Switch>
                {PythonProjects.map((project) => (
                    <Route exact path={url + "/" + project.projectName}>
                        <ProjectContent color={props.color} name={project.projectName} image={project.projectImage} description={project.projectDescription}/>
                    </Route>
                ))}
            </Switch>
        </Router>
    )
}

export default ProjectGroup