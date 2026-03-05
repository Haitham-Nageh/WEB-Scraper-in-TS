import { crawlSiteAsync } from "./crawl";
import { writeJSONReport } from "./report";
function parsePositiveInt(value: string, name: string): number {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || Number.isNaN(n) || n <= 0) {
    console.error(`${name} must be a positive integer`);
    process.exit(1);
  }
  return n;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1 && args.length !== 3) {
    console.error("Usage: npm run start <URL> <maxConcurrency> <maxPages>");
    process.exit(1);
  }

  const baseURL = args[0];

  let maxConcurrency = 3;
  let maxPages = 10;

  if (args.length === 3) {
    maxConcurrency = parsePositiveInt(args[1], "maxConcurrency");
    maxPages = parsePositiveInt(args[2], "maxPages");
  }

  console.log(
    `Starting crawl at ${baseURL} (Limit: ${maxConcurrency} concurrent, ${maxPages} max pages)`
  );

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

console.log("Finished crawling.");
const firstPage = Object.values(pages)[0];
if (firstPage) {
  console.log(`First page record: ${firstPage["url"]} - ${firstPage["heading"]}`);
}
writeJSONReport(pages, "report.json");
  
}

main();
