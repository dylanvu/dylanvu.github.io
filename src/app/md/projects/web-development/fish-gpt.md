# FishGPT

![FishGPT in action](/projects/web-development/fish-gpt/fish-gpt.gif)

FishGPT is an online chatbot built with ChatGPT that allows a user to simultaneously watch a fish and ask it questions to be answered! It uses computer vision to track the fish location in the tank to select a response and simulate different fish emotions and mood.

This was my team's submission to UCI WebJam 2023! My team was Casey Tran, Sharon Ma, Duong (Linda) Vu, and I! We ended up getting third overall despite a rocky live demo! Wow!

I focused on the video feed portion. Originally, I wanted to learn WebRTC but that ended up being a bit difficult as I ran into some sort of concurrency issue with OpenCV and Socket.io. Also, I deployed the Fish Cam onto a Raspberry Pi, but I ran into issues with actually getting the right Python version. I ended up effectively compiling the entirety of Python 3.7 on my Raspberry Pi...

I think my Raspberry Pi handling skills do need a little bit of improvement.

Overall though, I'm extremely happy with how this project turned out. We basically finished everything we set out to do, and it was really fun! Next time, I'll definitely try to learn WebRTC properly. While this was probably one of the most random ideas I've ever worked on, it was a really great one!

Here's the pet fish I bought for the project: Fork.

![Picture of an orange fish](/projects/web-development/fish-gpt/fork-the-fish.jpg)

Check out the demo video below!

https://www.youtube.com/watch?v=VpWZEQg8e4E

Here's an article written about the project:

https://ics.uci.edu/2023/12/04/ge-z-zottrees-and-fishgpt-cinch-top-3-at-webjam-2023/
