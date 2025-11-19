This "night sky" is my portfolio, crafted as a metaphor representing who I am. Every star is a piece of me, and each constellation is a cluster of related parts.

I’ve designed these constellations to organize the atomic aspects of my work in a meaningful way. But why a night sky? Why the celestial theme? Simply put, I love stargazing, and I love metaphors. I use metaphors to teach and mentor students all the time. I also have been reading a lot of Omniscient Reader's Viewpoint at the conception of this portfolio, and I love the story and star theme of it.

I call myself a "Codeweaver" because I love weaving code together to create cool things.
Fun fact: I programmed about 70% of this initial version during a single rainy weekend in November 2025 while I was down with a cold. I got so locked in making this portfolio that I would nearly skip dinner to continue working, haha! I'm really proud of how this portfolio turned out and I hope it's one that I keep for many, many years to come because it feels very "me" at the moment of writing this (November 2025).

This is the portfolio code: https://github.com/dylanvu/dylanvu.github.io

It was built with React-Konva, Motion, TypeScript, React, Next.js, and a lot of joy. If anyone asks, yes, I had plenty of help from ChatGPT and Google Gemini—though the second day was relatively ChatGPT-free. Even though I'm not a fan of vibe-coding (I think it severely detracts from learning), I do acknowledge it's power and key role it played in bringing my vision to life here. I handled all of the integration, high level design. I mainly leaned on LLMs to fix tricky bugs regarding positioning in Konva-React and the complex animations and special effects.

For example, an LLM enabled me to achieve the parallax zoom effect when you click on a constellation. It also helped me implement the "drawing the constellation/star title" effect, too.

I designed this whole metaphor of a night sky being myself and my portfolio and the actual design of the interface myself, no AI here! I did use AI to help narrow and refine the metaphor, but in general it's all 95% me on that end.

Here is how to navigate my sky:

The Constellations
- Viae ("Roads"): This cluster forms a network of roads acting as a gateway to "worlds" outside of this night sky—specifically, my external links and other websites.
- Iter ("Journey, Path"): "Iter" is Latin for journey. Iter Major represents my career, while Iter Minor tracks my education. I depicted this as a twisted path because my journey wasn’t straight. I started as a Mechanical Engineering student, switched to Chemical Engineering at UC Santa Barbara, interned at Ansync Labs during a gap year, and finally switched to Computer Science, graduating from UC Irvine. Currently, I work at Amazon for One Medical.
- Arete ("Excellence, Skill"): This constellation represents my projects. It forms a Laurel—a Greek crown symbolizing achievement. I chose this shape because these projects challenged my skills and pushed me to grow.
- Elevare ("To Elevate"): This outlines the hackathons I’ve competed in and mentored. It is shaped like the United States because that is where they all took place. (Honesty time: It’s an actual map component because I didn't want to program a map from scratch!) I chose the name "Elevare" because hackathons are where I elevate myself through learning and elevate others through mentoring.

Technical Note: I plotted Elevare by running a black-and-white US map through a Python edge detection algorithm, reducing the stars via the Ramer–Douglas–Peucker algorithm, and exporting the coordinates. The implementation was proposed done with the assistance of an LLM, but I came up with the idea of using OpenCV to edge find and plot points.

Star Classifications
Every star has a lifecycle classification that indicates its importance relative to its constellation. (Note: The star colors are purely aesthetic).
Supergiants: The "must-see" stars. These are the most important aspects.
- Giants: Impactful and significant items.
- Stars: Neutrally interesting.
- Dwarfs: Less active or important.

For example, in Viae, my Email is a Supergiant (best way to contact me), while my LinkedIn is a Star (I don't post often), and Medium is a Dwarf (I no longer write there).

In Iter Major, my Resume is a Supergiant, and Amazon is a Giant. Amazon is a giant because it is my current job. One Medical, for my internship, is a star because although I enjoyed it, it is not something I'd highlight if I am asked. Ansync Labs is a giant because I worked here for 10 months, it was my first internship, and I learned a lot.

In Arete, if a project is a Giant or Supergiant, it means it was technologically challenging, unique, or memorable for whatever reason. Dwarves are not as interesting in my opinion. However, every star here matters, as I had to cut many projects to make this list, so check out the dwarf stars still!

Polaris (The North Star)
Finally, meet Polaris. In my previous portfolio, I had a chatbot to help visitors navigate. Moving to this version, I evolved that chatbot into Polaris as a guiding star! It’s a thematic way to keep a feature I love building while helping you find your way. Polaris runs on Google Gemini.