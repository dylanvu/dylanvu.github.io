import React from "react";
import { useEffect, useState } from 'react';

/* Props:
title = title of the project
hook = project title
textPath = the path of the text description of the content relative to the public folder. This is a text file inside of the public/{projectgroup}/{projectname} directory
    Example of valid text path prop: "/projectgroup/javascript/discordqotd/discordqotd.txt"
*/

const ProjectContent = (props: { id: string, color: string, hook: string, title: string, textPath: string }) => {

    const [paragraphs, setParagraphs] = useState<string[]>([])


    useEffect(() => {
        // Import text file and split into array divided by paragraph
        const getParagraphs = () => {
            // eslint-disable-next-line
            fetch(props.textPath)
                .then(r => r.text())
                .then(text => {
                    setParagraphs(text.split("\n"))
                })

        }
        getParagraphs();
        // eslint-disable-next-line
    }, [])

    function checkIfphoto(text: string) {
        // The photo refereced in the txt file is a path that's uploaded in the public folder
        // Add more file extensions if needed
        let validImageExtension = ['.jpg', '.png', '.jpeg', '.svg', '.webp']
        for (let i = 0; i < validImageExtension.length; i++) {
            if (text.includes(validImageExtension[i])) {
                return true;
            }
        }
        return false;
    }

    function CheckIfLink(text: string) {
        if (text.includes("github.com/") || text.includes("devpost.com/software") || text.includes("https://")) {
            return true;
        } else {
            return false
        }
    }

    return (
        <div className="project-content">
            <h4 style={{ color: `${props.color}` }}> {props.hook}: </h4>
            <h3 style={{ color: `${props.color}` }}> {props.title} </h3>
            {paragraphs.map((paragraph) => {
                //console.log(paragraph);
                if (checkIfphoto(paragraph)) {
                    //console.log("Hi there");
                    return <img key={paragraph} src={process.env.PUBLIC_URL + paragraph} alt={paragraph} />
                } else if (CheckIfLink(paragraph)) {
                    return <p key={paragraph} className="text"><a className="collapsible-link" href={paragraph} target="_blank" rel="noreferrer">{paragraph}</a></p>
                } else {
                    if (paragraph[0] === "*") {
                        return <ul>
                            <li key={paragraph}>{paragraph.slice(2)}</li>
                        </ul>
                    }
                    return <p className="text" key={paragraph + Math.floor(Math.random() * 500 * Math.floor(Math.random() * 500)).toString()}>{paragraph}</p>
                }

            }
            )}
            <br /><br />
        </div>
    )
}

export default ProjectContent