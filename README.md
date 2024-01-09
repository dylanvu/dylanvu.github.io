# My Portfolio Website

My portfolio website created using React.js, Next.js, Framer Motion, and TypeScript.

https://dylanvu-github-io.vercel.app/


## IN4MATX 133 Aside

I'm submitting this portfolio as part of an assignment for UCI's IN4MATX 133: User Interaction Software.

I was in the process of revamping my previous website, migrating it from Create-React-App to Next.js in lieu of the deprecation of Create-React-App and the potential benefit of SEO through Next.js. However, I ran into a big issue that made me give up on the migration. This migration to Next.js was a long-awaited task that I've tackled a few times in the past, but never finish.

I wrote the vast majority of this code prior to the course. However, after looking at the assignment 1, that was my chance to push myself to solve the ultimate hurdle I was struggling with: nested dynamic paths. It was a bit confusing to grasp, but I figured it out in the end and wrote my code to implement it.

So, I ran the build command to generate the dynamic paths, and it worked!

So I deployed it and... it would work on my local machine, but never when I deployed it on Vercel.

I first tried using a different technique to generate my static paths, since they were relying on fs.readFile yet this would always return a 404 not found. I first tried to not use the fs library and instead hardcode and import all the things I needed. However, I knew this would be a very... bad solution overall and wanted the current system I had. I had an extra challenge in front of me since I didn't want to use a real database at all.

After some fiddling around, scouring Google for potential solutions, trying and failing to console.log my way out of my issues, I finally figured out what was wrong and fixed it, completing my portfolio!

The issue? A missing parentheses was the main culprit, causing my static path generation function provided by Next.js to not generate any static paths.

Then, I ran my website through the achecks.org and discovered 3 known problems, all under the same one:

> Check 301: The contrast between the colour of text and its background for the element is not sufficient to meet WCAG2.0 Level AA.

It was my navbar, where I added contrasting colors for style points. So, I just removed the color and made it white.

I looked through the potential problems (93) and I think many of them stemmed from the fact that I was using Next.js? The checker had a lot of issues with things in `<script>`.

Here are some of the main requirements this portfolio satisifes:
### Basic HTML Content
* Sematic HTML tags (I use the `<nav>` for the nav bar, `<main>`, etc)
* Multiple pages with navigation between them (the entire portfolio has 32 static pages)
* Links to external pages (most project pages include links to the GitHub repositories and Devpost links for Hackathon projects)
* I added custom icons from Font Awesome. You can see them in the `contact` page, and a GitHub one in the homepage.

### Custom CSS Styling
* I modify margins and paddings extensively to achieve the look of my website.
* I modify my website colors to be visually appealing
* I also add a custom font: Oxygen from Google.

### 1 Advanced Feature
* One of the kind of advanced features of Next.js is the ability to generate static pages through Static Site Generation (SSG). I leverage this in my portfolio using Next.js's `generateStaticParams` function.
* Of course, potentially the use of a web framework may be good enough for the advanced feature beyond modifying the text and block layouts?


## How to Add New Project Groups
1. Go to the `public` directory
2. Create a folder in lowercase
3. Go to `src/app/json` and add this new project group to `project-groups.json` under the format:

```ts
{
    "displaySection": string,
    "urlSegment": string,
    "info": string
}

```

Example:

```json
{
    "displaySection": "Rust",
    "urlSegment": "rust",
    "info": "Backend Development"
}
```
4. The project group will be added with the title "displaySection", url "urlSegment", and when you hover, the extra information will "info"

## How to Add New Projects
1. Go to the `public` directory
2. Determine which group the project falls under. Example: "web-development" for Web Development projects
3. Create the project folder in the `public/projects/web-development`, and name it something url friendly. Like: "amazing-project"
4. Have an image (required: ends in .png) named the same thing: "amazing-project.png". `public/web-development/amazing-project/amazing-project.png`. You can add more images here, too. The basic name will be what's shown in the project group page as a sort of image header/hook.
5. Create a txt file under that same group, named the same thing: `src/app/txt/web-development/amazing-project.txt`
5. Create a txt file with the following format, where the data is what will be parsed. The first line will be the title:

```txt
My Amazing Project

This is my amazing project.

Here is a great description of it.

Here is a cool picture.

/projects/web-development/amazing-project/amazing-project-picture-1.jpg
```

6. Go to `src/app/json`, go to the group.json, and add this new project under the format in the section above under "adding new project groups". This file controls the rendering order:

Example:
```json
{
    "displaySection": "Amazing Project",
    "urlSegment": "amazing-project"
}
```
