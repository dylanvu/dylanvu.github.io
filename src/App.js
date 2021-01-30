import './App.css';
import {fadeIn, FlyInLeft1, FlyInLeft2, FlyInRight1, FlyInRight2} from "./animateHome.js"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"
//import Header from "./components/Header.jsx"
import ProjectGroup from "./components/ProjectGroup"

function App() {
  return (
    <Router>
      <header id="fade">Dylan Vu</header>
      <br />
      <p id="fly-in-left1" className="fly-in-left">
        Welcome to my page! Check out my projects below:
      </p>
      <p id="fly-in-right1" className="fly-in-right">
        <Link to="/Python" className="link">
          <span className="text-category" style={{color: "#2081C3"}}>Python</span>
        </Link>,&nbsp;
        <Link to="/JavaScript_HTML_CSS" className="link">
          <span className="text-category" style={{color: "#DD1C1A"}}>JavaScript/HTML/CSS</span>
        </Link>,&nbsp;
        <Link to="/C++" className="link">
          <span className="text-category" style={{color: "#6DA34D"}}>C++</span>
        </Link>, and&nbsp;
        <Link to="Non-Coding" className="link">
          <span className="text-category" style={{color: "#FE5D26"}}>Non-Coding</span>
        </Link>
      </p>
      <br />
      <p id="fly-in-left2" className="fly-in-left">
        Let's talk:&nbsp;
        <span id="email" className="text-category" style={{color: "#26C485"}} onClick={getEmail}>My email</span>
      </p>
      <p id="fly-in-right2" className="fly-in-right">
        A bit about me:&nbsp;
        <Link to="/About" className="link">
          <span className="text-category" style={{color: "#26C485"}}>Who am I?</span>
        </Link>
      </p>
      <Switch>
        <Route exact path="/Python" component={ProjectGroup} />
      </Switch>
      <script>
        {setTimeout(fadeIn, 550)}
      </script>
      <script>
        {setTimeout(FlyInLeft1, 1000)}
      </script>
      <script>
        {setTimeout(FlyInRight1, 1100)}
      </script>
      <script>
        {setTimeout(FlyInLeft2, 1200)}
      </script>
      <script>
        {setTimeout(FlyInRight2, 1300)}
      </script>
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