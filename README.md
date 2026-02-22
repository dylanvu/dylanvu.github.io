# My Portfolio Website

My portfolio website created using React.js, Next.js, Framer Motion, and TypeScript.

https://dylanvu-github-io.vercel.app/

## TODO List

- Add a "Hackathons" page
- Add a "Mentoring" page

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
6. Create a txt file with the following format, where the data is what will be parsed. The first line will be the title:

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
