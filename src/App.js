import "./App.css";
import { useEffect, useState } from "react"
import ProjectGroup from "./components/ProjectGroup";
import Navbar from "./components/Navbar";
import Project from "./objects/project.js"

// If there are issues with net::ERR_ABORTED 404, look into package.json and make sure the homepage is set to github pages with the / repository name.
// Example: https://vu-dylan.github.io/portfolio/

let AboutMe = [new Project("My name is Dylan Vu", "", "/about/about.txt"), new Project("Resume at a Glance", "", "/about/glance.txt")]

let PythonProjects = [
	new Project("Convert your Spotify playlist to a YouTube playlist", "You-tify", "/projectgroup/python/youtify/youtify.txt"),
	new Project("Record the current UCSB course availability with the click of a button", "GoldWebscraper", "/projectgroup/python/goldwebscraper/goldwebscraper.txt"),
	new Project("Draw on a projector and a computer for a seamless hybrid learning experience", "GRIP Board", "/projectgroup/python/gripboard/gripboard.txt")
]

let JavaScriptProjects = [
	new Project("Add and save your favorite movies through a social media app", "SeenIt", "/projectgroup/javascript/seenit/seenit.txt"),
	new Project("Draw with your friends in a collaborative whiteboard", "SketchedOut", "/projectgroup/javascript/sketchedout/sketchedout.txt"),
	new Project("Increase engagement in your Discord server", "Discord Question of the Day", "/projectgroup/javascript/discordqotd/discordqotd.txt"),
	new Project("Modernize your club website", "UCSB Robotics Website", "/projectgroup/javascript/ucsbrobotics/ucsbrobotics.txt"),
	new Project("Cut Retail Waste with Global Inventory Management", "F•sync", "/projectgroup/javascript/fsync/fsync.txt")
]

let OtherProjects = [new Project("Use a VR controller that gives tactile feedback", "GRIP Controller", "/projectgroup/clangs/grip/grip.txt"), new Project("Get fit through a mobile fitness AI-generated text-adventure game", "Geoverse", "/projectgroup/flutter/geoverse/geoverse.txt")]

function App() {
	const [introText, setIntrotext] = useState("");
	useEffect(() => {
		// Play video and animate header typing
		// React has an issue with the muted in the video tag not being set properly.
		document.addEventListener("DOMContentLoaded", () => {
			document.getElementById("video").muted = true;
		})
		document.getElementById("video").play(); // Might be necessary for chrome
		AnimateHome();
	}, [])

	function AnimateHome() {
		let intro = "Hi, I'm Dylan Vu. Welcome to my site!";
		let currHeaderText = intro[0];
		let i = 0;
		// Animate "typing"
		setTimeout(() => {
			let headerHandle = setInterval(() => {
				setIntrotext(currHeaderText);
				i++;
				currHeaderText = currHeaderText + intro[i];
				if (i >= intro.length) {
					// After animation ends, change height if the user has not scrolled yet
					setTimeout(() => {
						// Shrink header to expose content only if they haven't scrolled yet
						// Use both documentElement for chrome, and body for everything else
						if (!document.documentElement.scrollTop && !document.body.scrollTop) {
							document.getElementById("header").style.height = "85vh";
							// document.getElementById("video").style.height = "85vh";
						}
					}, 500)
					clearInterval(headerHandle);
				}
			}, 60)
		}, 600)



	}

	// When you refresh, get sent to the top.
	window.onbeforeunload = function () {
		window.scrollTo(0, 0);
	}

	return (
		<div>
			<div className="header" id="header">
				<div className="welcome">
					{introText}
				</div>
				<video className="video" preload="auto" id="video" autoPlay loop muted playsInline>
					<source src={process.env.PUBLIC_URL + "/header.mp4"} type='video/mp4' />
					Video tag not supported
				</video>
			</div>
			<Navbar />
			<div className="content">
				<ProjectGroup projects={AboutMe} color={"#36393f"} group="About" scroll="About" />
				<ProjectGroup projects={JavaScriptProjects} color={"#c0392b"} group="NodeJS" scroll="JS" />
				<ProjectGroup projects={PythonProjects} color={"#2081C3"} group="Python" scroll="Python" />
				<ProjectGroup projects={OtherProjects} color={"#6DA34D"} group="C# and Flutter" scroll="Other" />
			</div>
		</div>
	);
}

export default App;

// D++ red? #D40000
// Old JS red: #DD1C1A

/* TODO:

Project arrays into JSON ?

*/
