import {React, useState} from 'react'
// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

// The eslint-disable-next-line is necessary because these are <a> and not <button> so tons of warnings pop up.
//I'm a bit lazy to fix this because it would involve fixing the css styling and this works as it is
const Navbar = () => {
    const [responsiveClass, setResponsive] = useState("inactive");

    function scrolling(id) {
        if (responsiveClass === "is-responsive") {
            setResponsive('inactive');
        }
		document.getElementById(id).scrollIntoView({behavior: "smooth"});
	}
    
    function toggleBurger() {
        console.log("Burger clicked");
        if (responsiveClass === "inactive") {
            setResponsive('is-responsive');
        } else {
            setResponsive('inactive');
        }
    }

    function colorChange(id) {
        let icon = document.getElementById(id);
        if (icon.style.color === "#f2f2f2") {
            icon.style.color = "#26C485";
        } else {
            icon.style.color = "#f2f2f2";
        }
        
    }

    return(
        // <nav className={`navbar ${responsiveClass}`} id="navbar">
        <nav className={`navbar ${responsiveClass}`} id="navbar">
            
            {/* eslint-disable-next-line */}
            <a className="nav-link" onClick={() => scrolling('About')}><span className="name">Dylan Vu</span></a>
            {/* eslint-disable-next-line */}
            <a className="nav-link" style={{ color: "#c0392b" }} onClick={() => scrolling('JS')}><span>JavaScript/NodeJS</span></a>
            {/* eslint-disable-next-line */}
            <a className="nav-link" style={{ color: "#2081C3" }} onClick={() => scrolling('Python')}><span>Python</span></a>
            {/* eslint-disable-next-line */}
            <a className="nav-link" style={{ color: "#6DA34D" }} onClick={() => scrolling('C')}><span>C++/C#</span></a>
            {/* eslint-disable-next-line */}
            <a className="nav-link" style={{ color: "#FE5D26" }} href="/about/Dylan Vu Resume.pdf" target="_blank" rel="noreferrer"><span>Resume</span></a>
            <a href="https://github.com/vu-dylan" target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
                <FontAwesomeIcon
                    icon={faGithub}
                    id="github"
                    className="icon"
                />
            </a>
            <a href="https://www.linkedin.com/in/dylanvu9/" target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
                <FontAwesomeIcon
                    icon={faLinkedinIn}
                    
                    className="icon"
                />
            </a>
            <a href="mailto:dylanvu@ucsb.edu" target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
                <FontAwesomeIcon
                    icon={faEnvelope}
                    
                    className="icon"
                />
            </a> 
            <div className={`hamburger ${responsiveClass}`} id="hamburger" onClick={() => toggleBurger()}>
                <span className="line"></span>
                <span className="line"></span>
                <span className="line"></span>
            </div>
        </nav>
    )

}

export default Navbar