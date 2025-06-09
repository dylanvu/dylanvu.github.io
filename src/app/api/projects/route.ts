import { NextResponse } from "next/server";
import path from "path";
import { readMarkdownFilesRecursively } from "@/app/api/util";

const ROOT_DIR = path.join(process.cwd(), "src/app/md/projects");

export async function GET() {
  try {
    const markdownFiles = await readMarkdownFilesRecursively(ROOT_DIR);
    return NextResponse.json(markdownFiles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read files", details: String(error) },
      { status: 500 }
    );
  }
}
