# My Portfolio Website

My portfolio website created using React.js, Next.js, Framer Motion, and Tailwind CSS

https://dylanvu.com

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
2. Determine which group the project falls under. Example: "ts-js" for TypeScript/JavaScript projects
3. Create the project folder, and name it something url friendly. Like: "amazing-project"
4. Have an image (required: ends in .png) named the same thing: "amazing-project.png"
5. Create a json file with the following format, where the data is what will be parsed. Each `\n` is the separator, and you can include both links and images. The first line will be the title:

```txt
My Amazing Project

This is my amazing project.

Here is a great description of it.

Here is a cool picture.

/projects/ts-js/amazing-project/amazing-project-picture-1.jpg
```

6. Go to `src/app/json`, go to the group.json, and add this new project under the format in the section above under "adding new project groups". This file controls the rendering order:

Example:
```json
{
    "displaySection": "Amazing Project",
    "urlSegment": "string"
}
```
