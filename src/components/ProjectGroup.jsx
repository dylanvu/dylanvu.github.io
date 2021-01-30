import React from 'react'

let PythonProjects = {
    projectHook: "Ever wanted to convert your Spotify playlist to a YouTube one?",
    projectName: "You-tify",
    projectImage: "Something here",
    projectDescription: "This was my first hackathon submission."
}

const ProjectGroup = () => {
    return (
        <div>
            <p>
                {PythonProjects.projectHook}&nbsp;
                <span className="text-category" style={{color: "#2081C3"}}>{PythonProjects.projectName}</span>
            </p>
        </div>
    )
}

export default ProjectGroup