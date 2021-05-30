import React from 'react'
import { useParams } from 'react-router-dom'

const ProjectContent = (props) => {
    let { projectTitle } = useParams();
    return (
        <div className="projectContent">
            <h1 style={{color: `${props.color}` }}>
                {projectTitle}
            </h1> 
            <br/>
            <img src={props.image} alt={props.name} className="projectImage"/>
            <br/><br/>
            <p>
                {props.description}
            </p>
        </div>
    )
}

export default ProjectContent