import "./App.css";
//import {fadeIn, FlyInLeft1, FlyInLeft2, FlyInRight1, FlyInRight2} from "./animateHome.js"
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
//import Header from "./components/Header.jsx"
import ProjectGroup from "./components/ProjectGroup";
import Sidebar from "./components/Sidebar";

// Import font awesome icons. Follow these instructions: https://fontawesome.com/how-to-use/on-the-web/using-with/react
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

function App() {
	return (
		<Router basename="/">
			<div className="sidebar">
				<Link to="/" className="link">
					<header id="fade" className="text-category">
						Dylan Vu
					</header>
				</Link>

				<p>Welcome to my page! </p>
				<Link to="/About" className="link">
					<div className="text-category" style={{ color: "#26C485" }}>
						Who am I?
					</div>
				</Link>
				<p>Check out my projects below:</p>
				<br />
				<Link to="/Python" className="link">
					<div className="text-category" style={{ color: "#2081C3" }}>
						Python
					</div>
				</Link>
				<Link to="/JS-HTML-CSS" className="link">
					<div className="text-category" style={{ color: "#DD1C1A" }}>
						JavaScript/HTML/CSS
					</div>
				</Link>
				<Link to="/CPP" className="link">
					<div className="text-category" style={{ color: "#6DA34D" }}>
						C++
					</div>
				</Link>
				<Link to="NonCoding" className="link">
					<div className="text-category" style={{ color: "#FE5D26" }}>
						Non-Coding
					</div>
				</Link>
				<br />
				<br />
				<a
					href="https://github.com/vu-dylan"
					style={{ color: "#f2f2f2" }}
				>
					<FontAwesomeIcon
						icon={faGithub}
						size="4x"
						className="icon"
					/>
				</a>
				<br />
				<span>
					<a
						href="https://www.linkedin.com/in/dylanvu9/"
						style={{ color: "#f2f2f2" }}
					>
						<FontAwesomeIcon
							icon={faLinkedinIn}
							size="4x"
							className="icon"
						/>
					</a>
				</span>
				<br />
				<a href="mailto:dylanvu@ucsb.edu" style={{ color: "#f2f2f2" }}>
					<FontAwesomeIcon
						icon={faEnvelope}
						size="4x"
						className="icon"
					/>
				</a>
			</div>
			<div className="content">
				<Switch>
					<Route exact path="/">
						<p>Welcome?</p>
					</Route>
					<Route exact path="/About">
						<p>About Placeholder</p>
					</Route>
					<Route exact path="/Python">
						<ProjectGroup color="#2081C3" />
					</Route>
					<Route exact path="/JS-HTML-CSS">
						<p>JS Placeholder</p>
					</Route>
					<Route exact path="/CPP">
						<p>C++ Placeholder</p>
					</Route>
					<Route exact path="/NonCoding">
						<p>Non-Coding Placeholder</p>
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;

// D++ red? #D40000
// Old JS red: #DD1C1A
/*
TODO:
Make animations slow down toward the end (control position using a function)
Potentially transition to only static HTML with scripts or something?
Add an animation on hover for my name? Or an idle animation for my name, such as a box occasionally forming around it?
- Do the same for the clickables. On hover, stop it though.
- See https://speckyboy.com/css-javascript-text-animation-snippets/ Typing carousel? Dylan Vu! Dylan Vu? Dylan Vu. D
Add GitHub or LinkedIn icons
Potentially implement react to route to content under the projects section?
- See if you can add transitions
- Nested routing for the Resume/Email/Who am I
- For email, maybe add an animation to switch from email to whatever? 
- Ensure that when you click again, it un-routes it back to home.
*/
// F038FF

function getEmail() {
	if (document.getElementById("email").innerHTML === "My email") {
		document.getElementById("email").innerHTML = "dylanvu9@gmail.com";
	} else if (
		document.getElementById("email").innerHTML === "dylanvu9@gmail.com"
	) {
		document.getElementById("email").innerHTML = "My email";
	}
}
