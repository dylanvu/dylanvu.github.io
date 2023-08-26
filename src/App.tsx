import "./App.css";
import React from "react";
import Header from "./components/Header";
import ProjectGroup from "./components/ProjectGroup";
import Navbar from "./components/Navbar";
import Project from "./classes/project";
import Contributions from "./components/Contributions";

// If there are issues with net::ERR_ABORTED 404, look into package.json and make sure the homepage is set to github pages with the / repository name.
// Example: https://vu-dylan.github.io/portfolio/

let AboutMe = [
	new Project("My name is Dylan Vu", "", "/about/about.txt"),
	new Project("Resume at a Glance", "", "/about/glance.txt"),
	new Project("Current Learning Goals", "", "/about/next.txt")
]

let PythonProjects = [
	new Project("Draw on a projector and a computer for a seamless hybrid learning experience", "GRIP Board", "/projectgroup/python/gripboard/gripboard.txt"),
	new Project("Convert your Spotify playlist to a YouTube playlist", "You-tify", "/projectgroup/python/youtify/youtify.txt"),
	new Project("Record the current UCSB course availability with the click of a button", "GoldWebscraper", "/projectgroup/python/goldwebscraper/goldwebscraper.txt")
]

let JavaScriptProjects = [
	new Project("Find a Chemical Engineering Internship and/or Job", "UCSB AIChE Careers Bot", "/projectgroup/javascript/aichecareers/aichecareers.txt"),
	new Project("Add a Chaotic Twist to an Auto-Battler Game", "Super RNG Pets", "/projectgroup/javascript/super-rng-pets/super-rng-pets.txt"),
	new Project("Cut Retail Waste with Global Inventory Management", "F•sync", "/projectgroup/javascript/fsync/fsync.txt"),
	new Project("Increase engagement in your Discord server", "Discord Question of the Day", "/projectgroup/javascript/discordqotd/discordqotd.txt"),
	new Project("Schedule Chemical Engineering Lab Usage", "UCSB AIChE Lab Reservation/Registration", "/projectgroup/javascript/reservation/reservation.txt"),
	new Project("Add and save your favorite movies through a social media app", "SeenIt", "/projectgroup/javascript/seenit/seenit.txt"),
	new Project("Draw with your friends in a collaborative whiteboard", "SketchedOut", "/projectgroup/javascript/sketchedout/sketchedout.txt"),
	new Project("Modernize your club website", "UCSB Robotics Website", "/projectgroup/javascript/ucsbrobotics/ucsbrobotics.txt")
];

let OtherProjects = [
	new Project("Use a VR controller that gives tactile feedback", "GRIP Controller", "/projectgroup/clangs/grip/grip.txt"),
	new Project("Get fit through a mobile fitness AI-generated text-adventure game", "Geoverse", "/projectgroup/flutter/geoverse/geoverse.txt"),
	new Project("Compete in a competitive 1v1 Wordle shooter game", "WordShip", "/projectgroup/other/wordship/wordship.txt"),
	new Project("Mentoring 4 beginners to first place", "Zot Class Mobile", "/projectgroup/flutter/zotclass/zotclass.txt")
];

function App() {

	// When you refresh, get sent to the top.
	window.onbeforeunload = function () {
		window.scrollTo(0, 0);
	}

	return (
		<div>
			<Header />
			<Navbar />
			<div className="content">
				<Contributions />
				<ProjectGroup projects={AboutMe} color={"#36393f"} group="About" scroll="About" />
				<ProjectGroup projects={JavaScriptProjects} color={"#c0392b"} group="NodeJS" scroll="JS" />
				<ProjectGroup projects={PythonProjects} color={"#2081C3"} group="Python" scroll="Python" />
				<ProjectGroup projects={OtherProjects} color={"#6DA34D"} group="C# and Flutter" scroll="Other" />
			</div>
		</div>
	)
}

export default App;

// D++ red? #D40000
// Old JS red: #DD1C1A

/* TODO:

Project arrays into JSON ?

*/
