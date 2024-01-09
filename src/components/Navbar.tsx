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
        // colors:
        // #c0392b - red
        // #2081C3 - blue
        // #6DA34D - green
        // #FE5D26 - orange
        <nav className={`navbar ${responsiveClass}`} id="navbar">
            <Link className="nav-link" href="/"><span className="name">Dylan Vu</span></Link>
            <Link className="nav-link" href="/projects"><span className="name">Projects</span></Link>
            <Link className="nav-link" href="/Dylan_Vu_Resume.pdf" target="_blank" rel="noreferrer"><span className="name">Resume</span></Link>
            <Link className="nav0link" href="/contact"><span className="name">Contact</span></Link>
            {/* <Link className="nav-link" style={{ color: "#2081C3" }} href="/projects"><span>Projects</span></Link>
            <Link className="nav-link" style={{ color: "#FE5D26" }} href="/Dylan_Vu_Resume.pdf" target="_blank" rel="noreferrer"><span>Resume</span></Link>
            <Link className="nav0link" style={{ color: "#6DA34D" }} href="/contact"><span>Contact</span></Link> */}
            <div className={`hamburger ${responsiveClass}`} id="hamburger" onClick={() => toggleBurger()}>
                <span className="line"></span>
                <span className="line"></span>
                <span className="line"></span>
            </div>
        </nav>
    )
}

export default Navbar