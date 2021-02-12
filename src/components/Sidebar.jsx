import React from 'react'
import {
    BrowserRouter as Router,
    Link
} from "react-router-dom"

// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'



const Sidebar = () => {
    return (
        <Router>
            <div className="sidebar">
                <Link to="/" className="link">
                    <header id="fade" className="text-category">Dylan Vu</header>
                </Link>
                
                <p>Welcome to my page! </p>
                <Link to="/About" className="link">
                    <div className="text-category" style={{color: "#26C485"}}>Who am I?</div>
                </Link>
                <p>Check out my projects below:</p>
                <br />
                <Link to="/Python" className="link">
                    <div className="text-category" style={{color: "#2081C3"}}>Python</div>
                </Link>
                <Link to="/JS-HTML-CSS" className="link">
                    <div className="text-category" style={{color: "#DD1C1A"}}>JavaScript/HTML/CSS</div>
                </Link>
                <Link to="/CPP" className="link">
                    <div className="text-category" style={{color: "#6DA34D"}}>C++</div>
                </Link>
                <Link to="NonCoding" className="link">
                    <div className="text-category" style={{color: "#FE5D26"}}>Non-Coding</div>
                </Link>
                <br /><br />
                <a href="https://github.com/vu-dylan" style={{color: "#f2f2f2"}}>
                    <FontAwesomeIcon icon={faGithub} size="4x" className="icon"/>
                </a>
                <br/>
                <span>
                    <a href="https://www.linkedin.com/in/dylanvu9/" style={{color: "#f2f2f2"}}>
                        <FontAwesomeIcon icon={faLinkedinIn} size="4x" className="icon"/>
                    </a>
                </span>
                <br/>
                <a href="mailto:dylanvu@ucsb.edu" style={{color: "#f2f2f2"}}>
                    <FontAwesomeIcon icon={faEnvelope} size="4x"className="icon"/>
                </a>
            </div>
        </Router>
    )
}

export default Sidebar