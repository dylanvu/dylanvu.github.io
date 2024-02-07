'use client'
import { useEffect, useState, useRef } from "react";
import SpecialtyCard from "./SpecialityCard";
import "@/styles/about/carousel.css";
import { AnimatePresence } from "framer-motion";

export default function SpecialityCarousel() {

    // carouselIndex[0] is "current"
    // carouselIndex[1] is "previous"
    const [carouselIndex, setCarouselIndex] = useState([0, 0]);

    const intervalRef = useRef<NodeJS.Timeout>();

    const specialties = [
        <SpecialtyCard title="Full-Stack Software Developer" key="swe" skills={["React.js", "TypeScript", "Express.js", "Next.js", "Socket.io"]} proof={["A Software Development Internship with One Medical (Amazon)", "A Software Development Internship with Ansync", "Countless Web Development Hackathon Projects and Side Projects"]} idx={carouselIndex} />,
        <SpecialtyCard title="Embedded Systems Engineer" key="embedded" skills={["ESP32", "Raspberry Pi", "Arduino", "IoT Devices", "Basic Circuitry, Wiring, and Soldering"]} proof={["The completion of 4x Hardware and IoT Device Hackathon projects", "The completion of the UCI Institute of Electrical and Electronics Engineers Open Project Space Program"]} idx={carouselIndex} />,
        <SpecialtyCard title="Game Developer" key="game" skills={["Non-Traditional Game Development", "Game-Web Integration and Communication via WebSockets", "Game Physics and Mechanics", "Web Games built with React.js", "Unity", "Unreal Engine 5",]} proof={["My success as the winner of 5x hackathons using Unity, Unreal, Godot, and React.js"]} idx={carouselIndex} />,
        <SpecialtyCard title="Mobile App Developer" key="mobile" skills={["Flutter", "Bluetooth"]} proof={["A capstone project partnered with one of the leading providers of In-Flight Entertainment: Thales"]} idx={carouselIndex} />,
        <SpecialtyCard title="Mentor and Leader" key="mentor" skills={["Teaching Embedded Systems and Programming", "Career and Field Discovery and Exploration", "Academic Coursework Planning"]} proof={["My leadership of 10+ hackathon projects", "My position as a Lab Instructor teaching 100 students in the UCI Institute of Electrical and Electronics Engineers Open Project Space Program", "My mentorship and instruction of 14 students in an IoT Fish Tank project", "My 1st and 2nd place mentorship of ZotHacks teams (a hackathon for beginner hackathon students only) two years in a row"]} idx={carouselIndex} />,
    ];

    useEffect(() => {
        intervalRef.current = setTimeout(() => {
            moveCarousel(1);
        }, 5000)

        return () => clearTimeout(intervalRef.current);

    }, [carouselIndex])

    function moveCarousel(amount: number) {
        let newIndex = carouselIndex[0] + amount;
        if (newIndex >= specialties.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = specialties.length - 1;
        }
        const newCarouselIndex = [newIndex, carouselIndex[0]]
        setCarouselIndex(newCarouselIndex);
    }

    return (
        <div>
            <button className="carousel-button" onClick={(e) => {
                e.preventDefault();
                moveCarousel(-1);
            }}>
                {`<`}
            </button>
            <button className="carousel-button" onClick={(e) => {
                e.preventDefault();
                moveCarousel(1);
            }}>
                {`>`}
            </button>
            <div className="content-block carousel">
                <AnimatePresence
                    initial={false}
                    mode="wait"
                >
                    {specialties[carouselIndex[0]]}
                </AnimatePresence>
            </div>
        </div>
    )
}