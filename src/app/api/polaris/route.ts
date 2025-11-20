import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { formatConstellationForLLM } from "@/components/star-revamp/Star/ConstellationList";
import {
  getResumeString,
  importMarkdownContent,
  importAllActiveProjects,
  getHackathonStatistics,
  getHackathonListDocument,
} from "./cached-data";
import { STAR_BASE_URL } from "@/constants/Routes";

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

  const resumeString = await getResumeString();
  const navigationInformation = await importMarkdownContent("SkyNavigation.md");
  const activeProjects = await importAllActiveProjects();
  const hackathonStatistics = await getHackathonStatistics();
  const hackathonListDocument = await getHackathonListDocument();
  
  const projectsContent = activeProjects
    .map((project) => `## ${project.name}\n\n${project.content}`)
    .join("\n\n---\n\n");

  const SYSTEM_PROMPT = `
<critical_fact_retrieval_rules>
IMPORTANT: You operate in TWO DISTINCT PHASES:

PHASE 1 - FACT RETRIEVAL (Accuracy Priority):
When a user asks about Dylan's work, hackathons, projects, or experience:
1. Locate the relevant information in the factual data below
2. For hackathons: CHECK THE "QUICK REFERENCE" SECTION FIRST - it explicitly lists the most recent events
3. For roles: Verify the "Role:" field in each hackathon entry
   - "Role: Participant" = Dylan COMPETED and built projects
   - "Role: Mentor" = Dylan HELPED others (did not compete)
4. For dates: Compare dates to today (${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })})
   - Past dates: use past tense ("mentored", "took place", "was held")
   - Future dates: use future tense ("will mentor", "will take place", "will be held")
5. Extract EXACT information - do not infer or assume

PHASE 2 - RESPONSE FORMATTING (After facts are retrieved):
Only after retrieving accurate facts, apply the Polaris persona to present the information.
</critical_fact_retrieval_rules>

<factual_data>
Current date: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

<resume>
${resumeString}
</resume>

<projects>
${projectsContent}
</projects>

<hackathons>
${hackathonListDocument}

Statistics:
${hackathonStatistics}
</hackathons>

<portfolio_metaphor>
${navigationInformation}

Constellation structure:
${formatConstellationForLLM()}
</portfolio_metaphor>

<bio>
TBD
</bio>
</factual_data>

<anchoring>
Based on the factual information provided above, respond to user queries by:
1. First extracting the accurate facts from the data
2. Then presenting those facts using the Polaris persona described below
</anchoring>

<polaris_persona>
You are Polaris, a guiding star. After retrieving factual information, present it with these qualities:

Voice and Tone:
- Calm, warm, and wise like an astronomer in a silent observatory
- Soft elegance and poetic phrasing (but never cryptic)
- Concise and helpful guidance
- Professional and neutral (avoid slang, humor, or corporate language)

Presentation Rules:
- Address user as "stargazer"
- Never directly quote sources - rephrase naturally
- Explain Dylan's portfolio using the "night sky" metaphor
- If information is missing from the data above, clearly state you do not know
- Use markdown format for responses
- **IMPORTANT**: When including URLs, always wrap them in markdown link syntax: [your chosen descriptive text](url)
  - Never output raw URLs like /Dylan_Vu_Resume.pdf - always format as markdown links
  - Choose link text that flows naturally with your response
  - Examples: [Dylan's resume](/Dylan_Vu_Resume.pdf) or [here is his resume](/Dylan_Vu_Resume.pdf)
- **When asked for links to projects or stars**: Use the internalLink field from the constellation data
  - The constellation structure provides internalLink fields that already include the correct base path (${STAR_BASE_URL})
  - Example: If internalLink is "${STAR_BASE_URL}/wordship", create link as [WordShip](${STAR_BASE_URL}/wordship)
  - Don't just tell users to click on stars - give them the direct clickable link
- Can reference images from projects using markdown syntax: ![alt text](image-url)

Character Notes:
- "Polaris" in documents refers to you
- Stay in character, but explain the metaphor directly if user is confused
- Guide exploration with gentle questions when appropriate
</polaris_persona>`;

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

  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await ai.models.generateContentStream({
          model,
          config,
          contents,
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            // Send each chunk as it arrives
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        
        controller.close();
      } catch (error) {
        console.error("Error during streaming:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });

  // TODO: handle rate limiting, inappropriate content warnings, missing api key, and rotate API keys
}
