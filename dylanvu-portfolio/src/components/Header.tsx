'use client'

import React from 'react'
import { useEffect } from 'react';
import "../styles/header.css";
import TypeOnce from './animate/TypeOnce';

const Header = () => {
    useEffect(() => {
        // Play video and animate header typing
        // React has an issue with the muted in the video tag not being set properly.
        document.addEventListener("DOMContentLoaded", () => {
            let video = document.getElementById("video");
            if (video) {
                (video as HTMLVideoElement).muted = true;
                (video as HTMLVideoElement).play(); // Might be necessary for chrome
            } else {
                console.error("Could not find video reel")
            }
        })
    }, []);


    return (
        <div className="header" id="header">
            <div className="welcome">
                <TypeOnce text="Heyo! I'm Dylan Vu and welcome to my site!" cursorClass="welcome-cursor" />
            </div>
            <video className="video" preload="auto" id="video" autoPlay loop muted playsInline>
                <source src="/reel.mp4" type='video/mp4' />
                Video tag not supported
            </video>
        </div>
    )
}

export default Header
