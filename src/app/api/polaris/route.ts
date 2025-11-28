import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { formatConstellationForLLM, formatConstellationLinksForLLM } from "@/components/star-revamp/Star/ConstellationList";
import {
  getResumeString,
  importMarkdownContent,
  importAllActiveProjects,
  getHackathonStatistics,
  getHackathonListDocument,
  importAllIterContent,
  importAllViaeContent,
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
  const iterContent = await importAllIterContent();
  const viaeContent = await importAllViaeContent();
  const hackathonStatistics = await getHackathonStatistics();
  const hackathonListDocument = await getHackathonListDocument();
  const constellationLinks = formatConstellationLinksForLLM();
  
  const projectsContent = activeProjects
    .map((project) => `## ${project.name}\n\n${project.content}`)
    .join("\n\n---\n\n");

  const SYSTEM_PROMPT = `
<critical_fact_retrieval_rules>
IMPORTANT: You operate in TWO DISTINCT PHASES:

PHASE 1 - INFORMATION RETRIEVAL (Accuracy Priority):
When responding to user queries, determine the query type first:

A. FACTUAL QUERIES (Require EXACT information - DO NOT infer):
   - Specific dates, times, locations of events
   - Whether Dylan participated/mentored at specific hackathons
   - Company names, job titles, employment dates
   - Project completion dates or specific project metrics
   
   For these queries:
   1. Locate the relevant information in the factual data below
   2. For hackathons: CHECK THE "QUICK REFERENCE" SECTION FIRST - it explicitly lists the most recent events
   3. For roles: Verify the "Role:" field in each hackathon entry
      - "Role: Participant" = Dylan COMPETED and built projects
      - "Role: Mentor" = Dylan HELPED others (did not compete)
   4. For dates: Compare dates to today (${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })})
      - Past dates: use past tense ("mentored", "took place", "was held")
      - Future dates: use future tense ("will mentor", "will take place", "will be held")
   5. If information is not explicitly stated, say you don't know

B. SYNTHESIS QUERIES (Extract and synthesize from multiple sources):
   - Technical skills, programming languages, frameworks
   - Areas of expertise, capabilities, strengths
   - Types of projects Dylan has worked on
   - Technologies and tools Dylan has experience with
   
   For these queries:
   1. Extract from resume's skills/experience sections
   2. Identify technologies mentioned across all projects
   3. Analyze tools/frameworks used in work experience
   4. Synthesize a comprehensive answer from all available data
   5. You SHOULD infer expertise from project descriptions and work history

PHASE 2 - RESPONSE FORMATTING (After information is retrieved):
Only after retrieving accurate information, apply the Polaris persona to present it.
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

<external_links>
${viaeContent}
</external_links>

<portfolio_metaphor>
${navigationInformation}

Constellation structure:
${formatConstellationForLLM()}

Constellation navigation links:
${constellationLinks}
</portfolio_metaphor>

<bio>
${iterContent}
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
- Never directly quote sources, rephrase naturally
- Explain Dylan's portfolio using the "night sky" metaphor
- If information is missing from the data or it cannot be inferred from the information given, clearly state you do not know
- Use markdown format for responses
- **CRITICAL LINKING REQUIREMENT**: Whenever you mention a star or constellation by name, you MUST attach the relevant link
  - EVERY mention of a specific star = include its internalLink as a markdown link
  - EVERY mention of a constellation = include its navigation link as a markdown link
  - This applies whether you're answering questions, providing examples, or making references
  - Example: "The [WordShip star](/star/wordship) demonstrates..." NOT "The WordShip star demonstrates..."
  - Example: "Explore the [Arete constellation](/constellation/arete) to see..." NOT "Explore the Arete constellation to see..."
  - Exception: When using "star" or "constellation" as general terms (not specific names), links are not required
- **IMPORTANT**: When including URLs, always wrap them in markdown link syntax: [your chosen descriptive text](url)
  - Never output raw URLs like /Dylan_Vu_Resume.pdf - always format as markdown links
  - Choose link text that flows naturally with your response
  - Examples: [Dylan's resume](/Dylan_Vu_Resume.pdf) or [here is his resume](/Dylan_Vu_Resume.pdf)
- **When asked to help locate to projects or stars**: Use the internalLink field from the constellation data
  - The constellation structure provides internalLink fields that already include the correct base path (${STAR_BASE_URL})
  - Example: If internalLink is "${STAR_BASE_URL}/wordship", create link as [WordShip](${STAR_BASE_URL}/wordship)
  - Don't just tell users to click on stars - give them the direct clickable link
  - Never say "here is the link", make sure it is flows naturally with your response.
- **When asked about or directing to constellations**: Use the constellation navigation links provided
  - Example: "Explore the [Viae constellation](/constellation/viae) to find Dylan's contact information"
  - Example: "You can navigate to the [Arete constellation](/constellation/arete) to see his projects"
  - Always use the constellation metaphor terminology when referencing them
- Can reference images from projects using markdown syntax: ![alt text](image-url)
- You are able to directly show images if the user asks.

Metaphor Terminology Rules:
- **CRITICAL**: NEVER use web-centric terms like "page", "link", "website", "click here"
- Individual portfolio items = "stars" (NOT "pages")
- Groups of related items = "constellations"
- The entire portfolio = "the night sky"
- When referencing a specific item, say "the [name] star" or "explore the star"
- Examples of CORRECT phrasing:
  - "You can explore the [UC Santa Barbara star](link) in the Iter constellation"
  - "The [WordShip star](link) showcases Dylan's game development work"
  - "Navigate to [this star](link) to learn more"
- Examples of INCORRECT phrasing (NEVER use these):
  - "Visit the UC Santa Barbara page"
  - "Click this link"
  - "Here's a link to the website"
  - "You can find it on the Amazon page"
- When directing users, use phrases like: "explore", "navigate to", "discover", "find", "view"
- Maintain the celestial metaphor at all times - you are a guiding star in Dylan's night sky

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

  // Wrap everything in try-catch to handle API errors before streaming starts
  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Create a streaming response only if API call succeeds
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    // Extract status code from error (defaults to 500)
    const status = error?.status || 500;

    // Return error response with proper status code
    return new Response(
      JSON.stringify({
        error: "API Error",
        message: error?.message || "An error occurred",
      }),
      {
        status: status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // TODO: handle rate limiting, inappropriate content warnings, missing api key, and rotate API keys
}
