import React from 'react'

const ProjectContent = (props) => {
    return (
        <div className="projectContent">
            <h1 style={{color: `${props.color}` }}>
                {props.name}
            </h1> 
            <br/>
            <img src={props.image} alt={props.name} className="projectImage"/>
            <br/><br/>
            <p>
                {props.description}
            </p>
            <br/>
        </div>
    )
}

export default ProjectContent