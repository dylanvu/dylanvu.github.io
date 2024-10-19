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
    const [showLinks, setShowLinks] = useState(false);

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
            setShowLinks(true);
        } else {
            setResponsive('inactive');
            setShowLinks(false);
        }
    }

    const links = [
        <Link className="nav-link" href="/about"><span className="name">About</span></Link>,
        <Link className="nav-link" href="/projects"><span className="name">Projects</span></Link>,
        <Link className="nav-link" href="/Dylan_Vu_Resume.pdf" target="_blank" rel="noreferrer"><span className="name">Resume</span></Link>,
        <Link className="nav-link" href="/contact"><span className="name">Contact</span></Link>,
    ]

    // colors of interest: #2081C3, #FE5D26, #6DA34D

    return (
        // colors:
        // #c0392b - red
        // #2081C3 - blue
        // #6DA34D - green
        // #FE5D26 - orange
        <div className="sticky">
            <nav className={`navbar ${responsiveClass}`} id="navbar">
                <div className='left'>
                    <Link className="nav-link" href="/"><span className="name">Dylan Vu</span></Link>
                </div>
                <div className={`right ${responsiveClass}`}>
                    <div className={`hamburger ${responsiveClass}`} id="hamburger" onClick={() => toggleBurger()}>
                        <span className="line"></span>
                        <span className="line"></span>
                        <span className="line"></span>
                    </div>
                            {/* <Link className="nav-link" href="/about"><span className="name">About</span></Link>
        <Link className="nav-link" href="/projects"><span className="name">Projects</span></Link>
        <Link className="nav-link" href="/Dylan_Vu_Resume.pdf" target="_blank" rel="noreferrer"><span className="name">Resume</span></Link>
        <Link className="nav-link" href="/contact"><span className="name">Contact</span></Link> */}
                    {
                        responsiveClass !== "is-responsive" ?
                            links.map((link) => link) // non-responsive view
                            :
                            null
                    }
                    
                </div>
            </nav>
            {/* responsive links when you press the hamburger menu */}
            {
                showLinks ?
                    // TODO: add framer motion to animate the rendering of this when the hamburger menu is clicked
                    <div className='responsive-link-menu'>
                        {links.map((link) => link)}
                    </div>
                    : null
            }
        </div>
        
    )
}

export default Navbar