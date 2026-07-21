// src/utils/streamParser.ts
export interface ParsedFile {
  path: string;
  content: string;
}

export function parseBoltArtifacts(text: string): { title: string; files: ParsedFile[] } {
  // Extract artifact title
  const titleMatch = text.match(/<boltArtifact[^>]*title="([^"]*)"/);
  const title = titleMatch ? titleMatch[1] : "Project Files";

  // Extract all file actions
  const fileActionRegex = /<boltAction\s+type="file"\s+filePath="([^"]+)">([\s\S]*?)<\/boltAction>/g;
  
  const files: ParsedFile[] = [];
  let match;

  while ((match = fileActionRegex.exec(text)) !== null) {
    files.push({
      path: match[1],
      content: match[2].trim(), // Trim leading/trailing whitespace
    });
  }

  return { title, files };
}