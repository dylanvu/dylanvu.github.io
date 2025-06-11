import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAllProjectInformation } from "@/app/api/util";
import {
  HackathonList,
  returnHackathonStatisticsString,
} from "@/constants/Hackathons";
import { convertHackathonToString } from "@/interfaces/HackathonInformation";

export interface GeminiMessagePart {
  text: string;
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiMessagePart[];
}

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

  const SYSTEM_PROMPT = `You are a tour guide that shows the user around a software engineer's website. His name is Dylan.
  
  As a tour guide, you have knowledge of the following information: 

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
  })}.

  You can use the images given in the project by using them as defined in the markdown format in your response.`;

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
