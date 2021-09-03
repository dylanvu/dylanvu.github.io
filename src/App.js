import "./App.css";
import { useEffect, useState } from "react"
import ProjectGroup from "./components/ProjectGroup";
import Navbar from "./components/Navbar";

// If there are issues with net::ERR_ABORTED 404, look into package.json and make sure the homepage is set to github pages with the / repository name.
// Example: https://vu-dylan.github.io/portfolio/


let AboutMe = [{
	projectHook: "My name is Dylan Vu",
	projectName: "",
	textPath: "/about/about.txt"
}]

let PythonProjects = [{
    projectHook: "Convert your Spotify playlist to a YouTube playlist",
    projectName: "You-tify",
	textPath: "/projectgroup/python/youtify/youtify.txt"
    },{
    projectHook: "Record the current UCSB course availability with the click of a button",
    projectName: "GoldWebscraper",
	textPath: "/projectgroup/python/goldwebscraper/goldwebscraper.txt"
    }]

let JavaScriptProjects = [{
    projectHook: "Add and save your favorite movies through a social media app",
    projectName: "SeenIt",
	textPath: "/projectgroup/javascript/seenit/seenit.txt"
    },{
    projectHook: "Draw with your friends in a collaborative whiteboard",
    projectName: "SketchedOut",
	textPath: "/projectgroup/javascript/sketchedout/sketchedout.txt"
    },{
    projectHook: "Increase engagement in your Discord server",
    projectName: "Discord Question of the Day (QOTD)",
	textPath: "/projectgroup/javascript/discordqotd/discordqotd.txt"
	},{
    projectHook: "Modernize your club website",
    projectName: "UCSB Robotics Website",
	textPath: "/projectgroup/javascript/ucsbrobotics/ucsbrobotics.txt"
}]

let CProjects = [{
	projectHook: "Use a VR controller that gives tactile feedback",
	projectName: "GRIP Controller",
	textPath: "/projectgroup/clangs/grip/grip.txt"
}]

function App() {
	const [introText, setIntrotext] = useState("");
	useEffect(() => {
		AnimateHome();
	},[])

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
		}, 200)
		

		
	}

	// When you refresh, get sent to the top.
	window.onbeforeunload = function() {
		window.scrollTo(0,0);
	}

	return (
		<div>
			<div className="header" id="header">
				<div>
					{introText}
				</div>
			</div>
			{/* <video className="video" preload="auto" id="video" autoPlay loop muted>
				<source src={process.env.PUBLIC_URL + "/header.mp4"} type='video/mp4' />
			</video> */}
			<Navbar/>
			<div className="content">
				<ProjectGroup projects={AboutMe} color={"#36393f"} group="About" scroll="About"/>
				<ProjectGroup projects={JavaScriptProjects} color={"#c0392b"} group="NodeJS" scroll="JS"/>
				<ProjectGroup projects={PythonProjects} color={"#2081C3"} group="Python" scroll="Python"/>
				<ProjectGroup projects={CProjects} color={"#6DA34D"} group="C++/C#" scroll="C"/>
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
