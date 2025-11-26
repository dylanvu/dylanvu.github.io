# SweetStack

![SweetStack Logo](/projects/games/sweetstack/sweetstack.png)

This is SweetStack, a two-player cake stacking game built in React, Vite, React Three Fiber, React Three Rapier, and the Rune SDK for the Winter ReactJam 2023 (a 12 day Game Jam hackathon).

Featuring custom made Blender assets! Consistent and aesthetic design! Amazing quality backend (at one point)!

![SweetStack Gameplay GIF](/projects/games/sweetstack/sweetstack.gif)

![SweetStack Game Interface Screenshot](/projects/games/sweetstack/sweetstack_game.png)

A super amazing looking game! It's cute, wholesome, and has sound effects. Super innocent... right?

No. This cute cake stacking game is literally the most algorithmically challenging projects I've ever worked on. As of this post, I'm about 2 or so years into studying web development.

I've always kind of been critical of Leetcode and whatnot because I don't think it's actually that useful in software engineering. Although I will say that I basically haven't even started my career yet, since at this time, I'm about to graduate from UCI in about 6 months.

![Another SweetStack Game Screenshot](/projects/games/sweetstack/sweetstack_game_2.png)

I felt that the skill of being able to troubleshoot your problems, generate and test ideas on the causes of bugs, and the ability to find the knowledge you need out there, followed by actual comfort working with frameworks and real tech stacks over niche-seeming algorithms and their applications was way more valuable for a career.

However, SweetStack challenged my algorithm skills way more than I expected. I had to write some gnarly recursive functions to recursively check if the player was making progress, due to the way I represented game items in the backend. I naturally gravitated toward a sort of graph/tree-like structure. Another helpful function to actually combine utilized a sliding window algorithm. Although I didn't write that function myself (thanks Casey Tran!), I still correctly identified that approach as a viable solution. I'm surprised that Leetcode prep actually pulled through for a project.

Also, the frontend itself is a mess of state management. Besides some nasty prop drilling, I also worked with Three.js (well, React Three Fiber) and Rapier (React Three Rapier) and that was pretty difficult. And one of the biggest troubles was tracking objects with the Three.js camera. Adhiti, the teammate who was the first to work with Three.js and Rapier, was sorely missed...

![SweetStack Game High Score Screen](/projects/games/sweetstack/sweetstack_game_3.png)

Overall, SweetStack really challenged me in an algorithms perspective and also a frontend state logic perspective. I worked a lot with the idea of a Finite State Machine in games, also. I sort of took the ideas I got from making Rattle, and refined and made it much better here. It also helped a lot that I didn't need to write my own backend or netcode. Rune was actually really nice to work with!

I also got to work with an incredibly talented designer (Jasmine Wu!), and it was a really different yet very rewarding and satisfying experience.

https://app.rune.ai/dev-OLyoinkn

https://github.com/dylanvu/SweetStack
