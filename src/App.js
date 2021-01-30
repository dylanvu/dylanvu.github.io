import './App.css';
//import {fadeIn, FlyInLeft1, FlyInLeft2, FlyInRight1, FlyInRight2} from "./animateHome.js"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"
//import Header from "./components/Header.jsx"
import ProjectGroup from "./components/ProjectGroup"
import Sidebar from "./components/Sidebar"

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="content">
        <Switch>
          <Route exact path="/">
            <p>Welcome?</p>
          </Route>
          <Route exact path="/About">
            <p>About Placeholder</p>
          </Route>
          <Route exact path="/Python">
            <p>Python Placeholder</p>
          </Route>
          <Route exact path="/JS_HTML_CSS">
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
    document.getElementById("email").innerHTML = "dylanvu9@gmail.com"
  } else if (document.getElementById("email").innerHTML === "dylanvu9@gmail.com") {
    document.getElementById("email").innerHTML = "My email"
  }
}