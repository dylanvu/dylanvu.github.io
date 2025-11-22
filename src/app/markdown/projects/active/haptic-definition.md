# Haptic Definition

![A picture of the Haptic Definition gloves](/projects/embedded/haptic-definition/haptic_definition_gloves.webp)

Haptic Definition was the most challenging embedded systems project I've worked on. I'd call this the pinnacle of my hackathon experience.

## Redefining HD

The name says it all: my friends and I set out to redefine what "HD" meant. Instead of High Definition video, we created Haptic Definition—turning any video into a full-body immersive experience with temperature and vibration feedback. Upload any MP4 file, put on our custom suit and gloves, and feel what's happening on screen.

Built for a hackathon with my team, we wanted to bring 4D immersion anywhere, breaking free from the physical constraints of specialized venues and seating.

## The Vision

The team and I originally had the idea to create a temperature and haptic feedback magic game, where you could cast spells and actually feel the sensations as you play. Unfortunately, our game developer ran into some major Unity issues off the bat and pivoted into bringing video experiences to life instead. 

Haptic Definition originally included both a full-body suit and glove combo laced with vibration motors and heating pads, capable of delivering heat and touch sensations that match what's happening in any video. While we fully created both the suit and the glove combo, only the glove worked in the end, most likely due to fragile hardware and soldering.

## The Technical Challenge

This project pushed every aspect of my hardware and software skills to their limits. I effectively put the culmination of all of my hackathon experience into this entire project.

In hackathons, I always take the role of integration, stitching together all technologies across all tech stacks. Haptic Definition was slated to be the biggest challenge yet, requiring me to put together embedded systems, traditional web development, and AI. The original vision was even more complex, substituting a web application with Unity!

### Hardware

Our hardware was entirely custom-built:
- ESP32 microcontrollers for wireless control
- Multiple vibration motors throughout the suit
- Temperature pads for heat feedback
- Hand-stitched suit and glove combination
- Crimped wire connections between vest and gloves for full-body integration

![A different angle of haptic definition gloves](/projects/embedded/haptic-definition/haptic_definition_gloves_2.webp)
![Another angle of haptic definition gloves](/projects/embedded/haptic-definition/haptic_definition_gloves_3.webp)

The construction involved an insane amount of soldering to connect all motors together. I felt kind of bad for our electrical engineering team who had to constantly fix things. Our AirBnB was a soldering sweatshop.

We sewed heat pads onto the insides of the gloves and created custom pockets to keep the motors securely in place. Every component had to be carefully positioned and secured for both comfort and functionality.

### Software Architecture

The software side:
- **Google Gemini 1.5 Pro** for real-time video analysis, determining what sensations viewers should feel and when
- **Bluetooth communication** to bridge the gap between web and suit (after WebSocket proved too difficult with ESP32)
- Frontend with **Tailwind CSS** for the video viewing interface
- Custom video frame extraction and processing pipeline

## 36 Hours of Battles

This project tested my friends and I's willpower and our ability to flexibly adapt our idea to the obstacles we encountered:

1. **Fragile Hardware**: The vibration motors were incredibly thin and fragile, snapping if pushed the wrong way. We had to be extremely careful during assembly. The dedicated electrical engineers and I spent an impossible amount of time soldering and wiring things up. Unfortunately, our suit ended up not working, but I'm still happy that our gloves were super cool!

2. **The Laws of Thermodynamics**: We initially wanted to include cold temperature feedback, but realized we lacked a large enough heat sinks to deliver enough of a chilling experience. We had to scope down to heating only.

3. **Communication Nightmares**: I ran into issues with the ESP32 microcontroller connecting to WebSocket servers, owing to my inexperience in implementing them and difficulty with the Arduino IDE. In hindsight, I should have learned PlatformIO here. I spent hours troubleshooting before pivoting to Bluetooth as our communication protocol.

4. **Learning to Sew**: None of my teammates were experienced with fabric work, so learning to properly sew components into wearable garments while maintaining electrical connections was a unique challenge that definitely wasn't covered in their CS and engineering curriculum.

I've never had to make so many calls to pivot and rip out functionality ever. Haptic Definition is a project that is honestly incomplete and not even close to being demoable, but it was still one of the most amazing things I've been a part of and had the joy of leading.

![Haptic Definition project logo](/projects/embedded/haptic-definition/haptic_definition_logo.png)

## Links

[Devpost](https://devpost.com/software/haptic-definition)
