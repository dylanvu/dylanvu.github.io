"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import "@/styles/navbar.css";
import { AnimatePresence, motion } from "motion/react";

const Navbar = () => {
  const [responsiveClass, setResponsive] = useState("inactive");
  const [showLinks, setShowLinks] = useState(false);

  function toggleBurger() {
    // console.log("Burger clicked");
    if (responsiveClass === "inactive") {
      setResponsive("is-responsive");
      setShowLinks(true);
    } else {
      setResponsive("inactive");
      setShowLinks(false);
    }
  }

  const links = [
    <Link className="nav-link" key="/about" href="/about">
      <span className="name">About</span>
    </Link>,
    <Link className="nav-link" key="/projects" href="/projects">
      <span className="name">Projects</span>
    </Link>,
    <Link
      className="nav-link"
      key="/Dylan_Vu_Resume.pdf"
      href="/Dylan_Vu_Resume.pdf"
      target="_blank"
      rel="noreferrer"
    >
      <span className="name">Resume</span>
    </Link>,
    <Link className="nav-link" key="/contact" href="/contact">
      <span className="name">Contact</span>
    </Link>,
  ];

  // colors of interest: #2081C3, #FE5D26, #6DA34D

  return (
    // colors:
    // #c0392b - red
    // #2081C3 - blue
    // #6DA34D - green
    // #FE5D26 - orange
    <div className="sticky">
      <nav className={`navbar ${responsiveClass}`} id="navbar">
        <div className="left">
          <Link className="nav-link" href="/">
            <span className="name">Dylan Vu</span>
          </Link>
        </div>
        <div className={`right ${responsiveClass}`}>
          <div
            className={`hamburger ${responsiveClass}`}
            id="hamburger"
            onClick={() => toggleBurger()}
          >
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
          {responsiveClass !== "is-responsive"
            ? links.map((link) => link) // non-responsive view
            : null}
        </div>
      </nav>
      {/* responsive links when you press the hamburger menu */}
      {showLinks ? (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.4 }}
            className="responsive-link-menu">{links.map((link) => link)}</motion.div>
        </AnimatePresence>
      ) : null}
    </div>
  );
};

export default Navbar;
