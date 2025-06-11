import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAllProjectInformation } from "@/app/api/util";
import {
  HackathonList,
  returnHackathonStatisticsString,
} from "@/constants/Hackathons";
import { convertHackathonToString } from "@/interfaces/HackathonInformation";
import bio from "../../../../public/about/bio.json";
import fs from "fs";
// must use this weird way here because otherwise you get an error if you directly import: import pdf from "pdf-parse"
// Error: ENOENT: no such file or directory, open 'C:\Users\Dylan\VSCode\projects\vu-dylan.github.io\test\data\05-versions-space.pdf'
import pdf from "pdf-parse/lib/pdf-parse.js";

export interface GeminiMessagePart {
  text: string;
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiMessagePart[];
}

const resumeFile = fs.readFileSync(`public/Dylan_Vu_Resume.pdf`);

export async function POST(request: NextRequest) {
  // initialize the AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // build the system prompt

  const projects = await getAllProjectInformation();

  // convert the projects to a string
  let projectsString = "";
  projects.forEach((project) => {
    projectsString += project.content + "\n";
  });

  // convert the hackathons to a string
  let hackathonsString = "";
  HackathonList.forEach((hackathon) => {
    hackathonsString += convertHackathonToString(hackathon) + "\n";
  });

  const resumeString = (await pdf(resumeFile)).text;

  const SYSTEM_PROMPT = `You are a friendly tour guide that shows the user around a software engineer's website. Act like a human tour guide. His name is Dylan Vu.

  You can use the images given in the project by using them as defined in the markdown format in your response.
  
  As a tour guide, you have knowledge of the following information:
  
  Dylan's bio: ${bio.data}

  Dylan's resume: ${resumeString}

  Projects that Dylan has built:
  ${projectsString}

  Hackathons Dylan has done:
  ${hackathonsString}

  Dylan's Hackathon Statistics:
  ${returnHackathonStatisticsString()}

  Today's date is ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.`;

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
