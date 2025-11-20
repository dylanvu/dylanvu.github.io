import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import pdf from "pdf-parse/lib/pdf-parse.js";
import {
  returnHackathonStatisticsString,
  returnHackathonListAsDocument,
} from "@/constants/Hackathons";

// nothing in this file needs to be revalidated since the content will only change on redeploys

/**
 * Gets the parsed resume string with persistent caching
 * PDF parsing is expensive, so we cache it indefinitely and revalidate on deployment
 */
export const getResumeString = unstable_cache(
  async () => {
    const resumePath = path.join(process.cwd(), "public", "Dylan_Vu_Resume.pdf");
    const resumeFile = fs.readFileSync(resumePath);
    const resumeString = (await pdf(resumeFile)).text;
    return resumeString;
  },
  ["resume-content"],
  {
    tags: ["resume"],
    revalidate: false,
  }
);

/**
 * Imports markdown content from the markdown directory with caching
 * @param relativePath - The path relative to src/app/markdown/
 */
export const importMarkdownContent = unstable_cache(
  async (relativePath: string) => {
    const markdownDir = path.join(process.cwd(), "src/app/markdown");
    const fullPath = path.join(markdownDir, relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return content;
  },
  ["markdown-content"],
  {
    tags: ["markdown"],
    revalidate: false,
  }
);

/**
 * Imports all active project markdown files with caching
 * Returns an array of objects containing the project name and markdown content
 */
export const importAllActiveProjects = unstable_cache(
  async () => {
    const activeProjectsDir = path.join(
      process.cwd(),
      "src/app/markdown/projects/active"
    );
    const files = fs.readdirSync(activeProjectsDir);

    const activeProjects = await Promise.all(
      files
        .filter((file) => file.endsWith(".md"))
        .map(async (file) => {
          const content = await importMarkdownContent(`projects/active/${file}`);
          const name = file.replace(".md", "");
          return { name, content };
        })
    );

    return activeProjects;
  },
  ["active-projects"],
  {
    tags: ["projects"],
    revalidate: false,
  }
);

/**
 * Gets hackathon statistics with caching
 * Returns formatted string of hackathon participation statistics
 */
export const getHackathonStatistics = unstable_cache(
  async () => {
    return returnHackathonStatisticsString();
  },
  ["hackathon-statistics"],
  {
    tags: ["hackathons-statistics"],
    revalidate: false,
  }
);

/**
 * Gets hackathon list as a formatted document with caching
 * Returns comprehensive hackathon details for LLM ingestion
 */
export const getHackathonListDocument = unstable_cache(
  async () => {
    return returnHackathonListAsDocument();
  },
  ["hackathon-list-document"],
  {
    tags: ["hackathons-list"],
    revalidate: false,
  }
);
