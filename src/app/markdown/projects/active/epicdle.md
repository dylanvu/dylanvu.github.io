# Epicdle

![Epicdle game trailer](/projects/games/epicdle/epicdle.gif)

Play it here: https://epicdle.com

## Overview

Epicdle is the first project I've actively marketed online and one that I've had to implement tons of optimizations and perform operational improvements on.

Epicdle is a daily song guessing game, inspired by Wordle, Heardle, and my-shot (Hamilton's version), built for the Epic the Musical fandom. I absolutely love this musical and listen to it all the time, so this project I wanted to impart as much of my love for this musical as possible into this game.

Upon launch, I saw 600 daily active users. I take user feedback and iterate on the game to make it better and independently market it on the Epic the Musical subreddit.

![Epicdle interface](/projects/games/epicdle/epicdle.png)

## Technologies

Here are the technologies I used:

* Next.js
* React
* TypeScript
* Maintine UI
* Google Cloud Firestore
* Google Cloud Storage
* CloudFlare R2 CDN
* FFmpeg
* Motion

## Architecture

I'm quite proud of this project because I wanted to serve this to the fandom without spending a lot of money on maintenance. I made the cloud architecture be able to support a theoretical daily active user count of 300,000 users for free. This was accomplished by minimizing the frequency and size of files served to users. I also accomplished daily resets with zero downtime or maintenance by pregenerating the song a day ahead using a cron job.

Here is how the architecture works:

1. I stored Epic the Musical songs in Firebase Cloud Storage, which are access once a day during reset time
2. The cron job reads from the Firebase Cloud Storage bucket, picks a random song, and picks a random time stamp for the song snippet.
3. The song answer and timestamp are saved for tomorrow in Firestore
4. The song snippet (about 4 seconds long) is saved to Cloudflare R2 CDN Bucket
5. Requests for the answer are fetched from the backend server time, so when the day resets, players get tomorrow's song without any race conditions.
6. I implemented caching for the song snippet, expiring in a server-calculated time at reset time so that users hit their local cache if they replay the song.

So in theory, the amount of database reads and writes should be minimal to support a daily active user count of 300,000 users and the latency is quite low!

## Launch Issues and Solutions

I ran into two major issue after launch. The first was that at nearly peak popularity of my Reddit post, a time reset bug appeared where the song reset at 4 PM PST (UTC Midnight instead of 7 AM UTC time like I intended). Luckily, a user notified me and I had sufficient logging to quickly identify the issue and fix it. Still though, I now understand the terror that comes when a user reports a major bug!

The second was regarding data transfers limits the night after the launch. My GIFs were large, but one of my GIFs was especially extremely large (400 MB!) and I forgot to locally cache it for users. When you have 600 users in a day, that ended up moving about 70 GB of data, quickly exceeding Vercel's free tier for data transfers.

To solve this, I fixed it in 2 stages:

1. I set custom cache headers for the GIF to be cached for a year and retrieved the data in an API call rather than let Vercel handle serving it.
2. This lowered the data transfers, but it still was not enough. I then reduced the GIF size from 400 MB to just 15 MB, moved it to Cloudflare R2 CDN, and served it from there since Cloudflare has a better free tier for data transfers.

This overall brought my daily data transfer from 70 GB to 10 GB for 600 daily users. I've learned how important it is to cache and serve assets from a CDN and also the pressure from fixing bugs for a launched project.

## Repository

Here's the project repo:

https://github.com/dylanvu/Epicdle

## Marketing and Future Goals

Another thing I'm thinking more about is how to launch and garner interest for this project.

I posted on Reddit and have been focusing on community building a bit, responding to all the feedback and comments I got. The big question: how do you advertise a project without being annoying? I've settled on this strategy: Iteratively improve the project, launch it, and then post a Reddit post about it. This way, I can get feedback from the community and iterate on the project.

My ultimate goal is to get noticed by the creator of Epic the Musical, and I hope I get to meet him and have him play my project!
