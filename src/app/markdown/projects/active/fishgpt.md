# FishGPT

![FishGPT interface in action](/projects/web-development/fish-gpt/fish-gpt.gif)

## Overview

FishGPT is an online chatbot built with ChatGPT that allows a user to simultaneously watch a fish and ask it questions to be answered! It uses computer vision to track the fish location in the tank to select a response and simulate different fish emotions and mood.

This was my team's submission to UCI WebJam 2023, and we chose this project because we took the theme (the Deep Sea) a bit too seriously for fun. My team was Casey Tran, Sharon Ma, Duong (Linda) Vu, and I! We ended up getting third overall despite a rocky live demo! Wow!

## Technical Challenges

I focused on the video feed portion. Originally, I wanted to learn WebRTC but that ended up being a bit difficult as I ran into some sort of concurrency issue with OpenCV and Socket.io, so I could not perform the handshake and connect while displaying streaming the video.

Also, I deployed the Fish Cam onto a Raspberry Pi, but I ran into issues with actually getting the right Python version. I ended up effectively compiling the entirety of Python 3.7 on my Raspberry Pi...

I think my Raspberry Pi handling skills do need a little bit of improvement.

Another great challenge I faced was optimizing the video stream so that it would not stream the video at like 1 frame per second. We solved this by downsizing the frame size and discarding frames to achieve something around 10 FPS and a somewhat smooth video.

## Reflections

Overall though, I'm extremely happy with how this project turned out. We basically finished everything we set out to do, and it was really fun! Next time, I'll definitely try to learn WebRTC properly. While this was probably one of the most random ideas I've ever worked on, it was a really great one and I'll always remember what it was like to safely lug a fish and about 5 gallons of water from my apartment to campus.

## Meet Fork the Fish

Here's the pet fish I bought for the project: Fork.

![Picture of an orange fish named Fork the fish](/projects/web-development/fish-gpt/fork-the-fish.jpg)

## Demo & Media

Check out the demo video below!

https://www.youtube.com/watch?v=VpWZEQg8e4E

Here's a news article written about the project:

https://ics.uci.edu/2023/12/04/ge-z-zottrees-and-fishgpt-cinch-top-3-at-webjam-2023/
