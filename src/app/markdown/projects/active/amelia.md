# Amelia

![Picture of Amelia's avatar](/projects/embedded/amelia/amelia.png)

Despite the... "interesting" appearance...

![Picture of Amelia in real life, which is a cardboard tower](/projects/embedded/amelia/amelia_1.jpg)

![Another picture of Amelia in real life](/projects/embedded/amelia/amelia_2.jpg)

Amelia is actually one of the most interesting projects I've ever worked on. I unknowingly programmed a "Large Action Model" to breathe life into this six-foot tall cardboard monstrosity.

Built for a hackathon during my last year at UC Irvine, this walking and talking cardboard tower was crafted from several discarded Amazon boxes, obscene quantities of masking tape, and a disrespectful amount of free company-sponsored merch.

## The Concept

Designed as a travel companion, Amelia's purpose was to guide tourists around a city. For our hackathon pitch, we demonstrated Amelia following people and identifying landmarks. But the most exciting discovery came afterward—I accidentally found that Amelia could play I-Spy, a skill that went beyond simply recognizing locations.

Amelia was built with Python, a Raspberry Pi, Google Gemini, H-Bridge ICs, wheels, a microphone, a camera, and a speaker.

## Large Action Model

The part I'm most proud of is the integration with Google Gemini enabling Amelia to actually "think" for herself and perform actions autonomously to complete your requests. Instead of programming specific travel-companion behaviors, I gave Amelia the ability to take actions: "see" the surroundings (camera), "think" about what she sees (LLM processing), then "talk" to the user (speaker). A Large Language Model orchestrated these actions together, breaking down a task into specific actions in the right order. Prompt engineering was done to effectively give her autonomy.

Using this approach, Amelia could play I-Spy without being explicitly programmed how—it was like equipping Amelia with all the tools and letting the Large Language Model do all the thinking. Later on, I discovered that this ability to think and reason was the key to the concept of Agentic AI and a Large Action Model.

In a nutshell, we gave a Generative AI LLM (Google Gemini) physical form: the ability to see, move, talk, and hear. I feel like the concept of using an LLM to solve a request and put it into a series of actionable steps is a super interesting idea. The possibilities that came from this concept fascinated me the most.

## Amelia's Lasting Impact

Amelia helped inspire me to take a graduate class on Robotic Autonomy, since she really got me thinking deeply about how LLMs could make robots more autonomous.

Even though Amelia was incredibly slow and single-threaded, and could only drive straight (you even had to kick it to get Amelia moving), she captured the hearts of hundreds of people who came by our booth and won the popular vote at the hackathon. Amelia remains one of my most memorable projects since it was the most fun to present and one of the most novel ideas I got the chance to build. 

Amelia is a project I'd love to remaster someday, combining my new knowledge in Robotic Operating System to help improve her processing speed and utilizing specific LLMs trained for robotics. One day, I'll remaster Amelia using what I've learned to transform her into a cardboard beauty rather than a monstrosity!

[GitHub](https://github.com/dylanvu/Amelia-Software)

[Devpost](https://devpost.com/software/amelia)
