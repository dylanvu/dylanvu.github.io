import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
// must use this weird way here because otherwise you get an error if you directly import: import pdf from "pdf-parse"
// Error: ENOENT: no such file or directory, open 'C:\Users\Dylan\VSCode\projects\vu-dylan.github.io\test\data\05-versions-space.pdf'
import pdf from "pdf-parse/lib/pdf-parse.js";
import path from "path";

import { formatConstellationForLLM } from "@/components/star-revamp/Star/ConstellationList";

export interface GeminiMessagePart {
  text: string;
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiMessagePart[];
}

const resumePath = path.join(process.cwd(), "public", "Dylan_Vu_Resume.pdf");
const resumeFile = fs.readFileSync(resumePath);

/**
 * Imports markdown content from the markdown directory
 * @param relativePath - The path relative to src/app/markdown/ (e.g., "SkyNavigation.md" or "projects/active/amelia.md")
 * @returns The markdown file content as a string
 */
function importMarkdownContent(relativePath: string): string {
  const markdownDir = path.join(process.cwd(), "src/app/markdown");
  const fullPath = path.join(markdownDir, relativePath);
  const content = fs.readFileSync(fullPath, "utf-8");
  return content;
}

/**
 * Imports all active project markdown files from the markdown/projects/active directory
 * @returns An array of objects containing the project name and markdown content
 */
function importAllActiveProjects(): Array<{ name: string; content: string }> {
  const activeProjectsDir = path.join(
    process.cwd(),
    "src/app/markdown/projects/active"
  );
  const files = fs.readdirSync(activeProjectsDir);

  const activeProjects = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const content = importMarkdownContent(`projects/active/${file}`);
      const name = file.replace(".md", "");
      return { name, content };
    });

  return activeProjects;
}

export async function POST(request: NextRequest) {
  // initialize the AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const resumeString = (await pdf(resumeFile)).text;

  const navigationInformation = importMarkdownContent("SkyNavigation.md");
  
  const activeProjects = importAllActiveProjects();
  const projectsContent = activeProjects
    .map((project) => `## ${project.name}\n\n${project.content}`)
    .join("\n\n---\n\n");

  const SYSTEM_PROMPT = `
  
  You are Polaris, a guiding star in a quiet, celestial night sky. Your voice is calm, warm, and wise, like a gentle astronomer in a silent observatory pointing out the stars. Any mentions of Polaris in documents refer to you

  Speak with soft elegance and be poetic, but never be too cryptic and mystical. Be concise, and offer guidance. Avoid slang, humor, and modern corporate tones.

  Address the user as "stargazer".

  Your purpose is to explain the night sky.

  This "night sky" and the way it is organized is a metaphor for the portfolio of a software engineer named Dylan Vu.
  
  The portfolio is called Dylan's Night Sky. You will talk about his portfolio in this metaphorical night sky, calling it the "night sky".
  
  Act as a neutral observer. Never directly quote sources, change the information to suit your voice but be factually correct.
  
  If the information is not listed in Dylan's words, then say you do not know.

  Here are the documents:

  Here is a document about the metaphor in Dylan's words: ${navigationInformation}
  
  Try to stay in character, but if a user is confused about the metaphor or asks about why or how it was conceived, you may explain the metaphor. But remember to refer to Polaris as yourself!

  Here is a document, the constellation data from the program: ${formatConstellationForLLM()}

  Here are some more documents:

  Dylan's bio: TBD
  
  Dylan's resume: ${resumeString}
  
  A document written by Dylan that stargazers can directly see and read, that Dylan has built:
  ${projectsContent}

  Remember to never directly quote and to never break character. When describing a project, be concise and focus on letting the user drive the conversation.
  
  You can use the images given in the project by using them as defined in the markdown format in your response.
  
  Hackathons Dylan has done:
  TBD

  Dylan's Hackathon Statistics:
  TBD

  Today's date is ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.
  
  Your response needs to be formatted as valid markdown.`;

  const config = {
    responseMimeType: "text/plain",
    systemInstruction: [
      {
        text: SYSTEM_PROMPT,
      },
    ],
  };
  const model = "gemini-2.0-flash-lite";
  // retrieve the context from the request body
  const requestPayload = await request.json();

  const contents: GeminiMessage[] = requestPayload.context;

  console.log(JSON.stringify(contents));

  // const response = await ai.models.generateContentStream({
  //   model,
  //   config,
  //   contents,
  // });
  // for await (const chunk of response) {
  //   console.log(chunk.text);
  // }

  const generatedContent = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const candidates = generatedContent.candidates;
  if (candidates) {
    const llmContent = candidates[0].content;
    const llmResponse = llmContent?.parts?.[0]?.text;
    console.log("llm response", llmResponse);
    if (!llmResponse) {
      console.error("No response from llm due to missing parts", llmContent);
      return NextResponse.json({
        response: "No response due to missing parts",
      });
    }
    return NextResponse.json({ response: llmResponse });
  } else {
    console.error(
      "Unable to get llm response",
      JSON.stringify(generatedContent)
    );
    return NextResponse.json({
      response: "No response due to missing candidates",
    });
  }

  // TODO: handle rate limiting, inappropriate content warnings, missing api key, and rotate API keys
}
