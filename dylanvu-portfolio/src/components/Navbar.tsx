'use client'

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import "../styles/navbar.css"

// The eslint-disable-next-line is necessary because these are <a> and not <button> so tons of warnings pop up.
//I'm a bit lazy to fix this because it would involve fixing the css styling and this works as it is
const Navbar = () => {
    const [responsiveClass, setResponsive] = useState("inactive");

    function scrolling(id: string) {
        if (responsiveClass === "is-responsive") {
            setResponsive('inactive');
        }
        let scrollable = document.getElementById(id)
        if (scrollable) {
            scrollable.scrollIntoView({ behavior: "smooth" });
        } else {
            console.error(`could not find scrollable with id ${id}`)
        }
    }

    function toggleBurger() {
        // console.log("Burger clicked");
        if (responsiveClass === "inactive") {
            setResponsive('is-responsive');
        } else {
            setResponsive('inactive');
        }
    }

    return (
        <nav className={`navbar ${responsiveClass}`} id="navbar">
            {/* eslint-disable-next-line */}
            <Link className="nav-link" href="/"><span className="name">Dylan Vu</span></Link>
            {/* eslint-disable-next-line */}
            {/* <a className="nav-link" style={{ color: "#c0392b" }} onClick={() => scrolling('JS')}><span>JavaScript/NodeJS</span></a> */}
            {/* eslint-disable-next-line */}
            {/* <a className="nav-link" style={{ color: "#2081C3" }} onClick={() => scrolling('Python')}><span>Python</span></a> */}
            {/* eslint-disable-next-line */}
            {/* <a className="nav-link" style={{ color: "#6DA34D" }} onClick={() => scrolling('Other')}><span>Other</span></a> */}
            {/* eslint-disable-next-line */}
            <Link className="nav-link" style={{ color: "#FE5D26" }} href="/about/Dylan_Vu_Resume.pdf" target="_blank" rel="noreferrer"><span>Resume</span></Link>
            <a href="https://github.com/dylanvu" target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
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
            <a href="mailto:dylanvu9@gmail.com" target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
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