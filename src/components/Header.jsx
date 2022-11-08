import { React, useEffect, useState } from 'react';

const Header = () => {
	const [introText, setIntrotext] = useState("");
	useEffect(() => {
		// Play video and animate header typing
		// React has an issue with the muted in the video tag not being set properly.
		document.addEventListener("DOMContentLoaded", () => {
			document.getElementById("video").muted = true;
		})
		document.getElementById("video").play(); // Might be necessary for chrome
		AnimateHome();
	}, []);

	function AnimateHome() {
		let intro = "Heyo! I'm Dylan Vu and welcome to my site!";
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
	return (
		<div className="header" id="header">
			<div className="welcome">
				{introText}
			</div>
			<video className="video" preload="auto" id="video" autoPlay loop muted playsInline>
				<source src={process.env.PUBLIC_URL + "/reel.mp4"} type='video/mp4' />
				Video tag not supported
			</video>
		</div>
	)
}

export default Header
