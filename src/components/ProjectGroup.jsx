import React from 'react'
import ProjectContent from './ProjectContent'
import { BrowserRouter as Router, Link, useRouteMatch, Switch, Route } from 'react-router-dom'


let PythonProjects = [{
    projectHook: "Ever wanted to convert your Spotify playlist to a YouTube one?",
    projectName: "You-tify",
    projectImage: "Something here",
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
        <Router>
            {PythonProjects.map((project) => (
                <div>
                    <p>
                        {project.projectHook}&nbsp;
                        <Link to={url + "/" + project.projectName} className="link">
                            <span className="text-category" style={{color: `${props.color}` }}>{project.projectName}</span>
                        </Link>
                    </p>
                    <br />
                </div>
            ))}
            <Switch>
                {PythonProjects.map((project) => (
                    <Route exact path={url + "/" + project.projectName}>
                        <ProjectContent color={props.color} name={project.projectName}/>
                    </Route>
                ))}
            </Switch>
        </Router>
    )
}

export default ProjectGroup