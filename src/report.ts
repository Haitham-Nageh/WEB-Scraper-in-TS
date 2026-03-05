import fs from "fs";
import path from "path";
import { ExtractedPageData } from "./crawl";

export function writeJSONReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.json",
): void {

  // Convert object -> array and sort by URL
  const sorted = Object.values(pageData).sort((a, b) =>
    a.url.localeCompare(b.url)
  );

  // Convert to JSON with indentation
  const json = JSON.stringify(sorted, null, 2);

  // Resolve output path
  const outputPath = path.resolve(process.cwd(), filename);

  // Write file
  fs.writeFileSync(outputPath, json);

  console.log(`JSON report written to ${outputPath}`);
}
