import React from 'react'

const ProjectContent = (props) => (
    <div className="projectContent">
        <h1 style={{color: `${props.color}` }}>
            {props.name}
        </h1> 
    </div>
)

export default ProjectContent