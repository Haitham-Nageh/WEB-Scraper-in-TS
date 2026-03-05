import { JSDOM } from "jsdom";
import pLimit from "p-limit";

/* ---------------- Types + Page Data Helpers ---------------- */

export type ExtractedPageData = {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function normalizeURL(urlString: string): string {
  const urlObj = new URL(urlString);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;

  if (fullPath.length > 1 && fullPath.endsWith("/")) {
    fullPath = fullPath.slice(0, -1);
  }

  return fullPath.toLowerCase();
}

export function getHeadingFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const h1 = doc.querySelector("h1");
  if (h1?.textContent) return h1.textContent.trim();

  const h2 = doc.querySelector("h2");
  if (h2?.textContent) return h2.textContent.trim();

  return "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const main = doc.querySelector("main");
  if (main) {
    const pInMain = main.querySelector("p");
    if (pInMain?.textContent) return pInMain.textContent.trim();
  }

  const firstP = doc.querySelector("p");
  if (firstP?.textContent) return firstP.textContent.trim();

  return "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = [];
  const dom = new JSDOM(html);
  const linkElements = dom.window.document.querySelectorAll("a");

  for (const linkElement of linkElements) {
    const href = linkElement.getAttribute("href");
    if (!href) continue;

    try {
      const urlObj = new URL(href, baseURL);
      urls.push(urlObj.href);
    } catch {
      // ignore invalid URLs
    }
  }

  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = [];
  const dom = new JSDOM(html);
  const imgElements = dom.window.document.querySelectorAll("img");

  for (const img of imgElements) {
    const src = img.getAttribute("src");
    if (!src) continue;

    try {
      const urlObj = new URL(src, baseURL);
      urls.push(urlObj.href);
    } catch {
      // ignore invalid URLs
    }
  }

  return urls;
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
  const heading = getHeadingFromHTML(html);
  const firstParagraph = getFirstParagraphFromHTML(html);
  const links = getURLsFromHTML(html, pageURL);
  const images = getImagesFromHTML(html, pageURL);

  return {
    url: pageURL,
    heading,
    first_paragraph: firstParagraph,
    outgoing_links: links,
    image_urls: images,
  };
}

/* ---------------- ConcurrentCrawler ---------------- */

export class ConcurrentCrawler {
  baseURL: string;
  pages: Record<string, ExtractedPageData>;
  limit: ReturnType<typeof pLimit>;

  maxPages: number;
  shouldStop: boolean;
  allTasks: Set<Promise<void>>;

  constructor(baseURL: string, maxConcurrency: number, maxPages: number) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);

    this.maxPages = maxPages;
    this.shouldStop = false;
    this.allTasks = new Set();
  }

  // Returns true if it's the first time seeing this page (and allowed to crawl it)
  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) return false;

    // already have data for this page => don't crawl again
    if (this.pages[normalizedURL] !== undefined) {
      return false;
    }

    // enforce max unique pages
    const uniqueCount = Object.keys(this.pages).length;
    if (uniqueCount >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      return false;
    }

    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    return await this.limit(async () => {
      if (this.shouldStop) return "";

      try {
        const response = await fetch(currentURL, {
          method: "GET",
          headers: { "User-Agent": "BootCrawler/1.0" },
        });

        if (response.status >= 400) {
          console.error(
            `error fetching page: ${response.status} ${response.statusText} (${currentURL})`
          );
          return "";
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("text/html")) {
          console.error(`non-html content: ${contentType ?? "unknown"} (${currentURL})`);
          return "";
        }

        return await response.text();
      } catch (err) {
        console.error(`error fetching HTML (${currentURL}):`, err);
        return "";
      }
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    if (this.shouldStop) return;

    let baseObj: URL;
    let currentObj: URL;

    try {
      baseObj = new URL(this.baseURL);
      currentObj = new URL(currentURL);
    } catch {
      return;
    }

    // only crawl same domain
    if (baseObj.hostname !== currentObj.hostname) return;

    const normalized = normalizeURL(currentURL);

    const isAllowedAndNew = this.addPageVisit(normalized);
    if (!isAllowedAndNew) return;

    // Print each time we crawl a page
    console.log(`crawling: ${currentURL}`);

    const html = await this.getHTML(currentURL);
    if (!html) return;

    const data = extractPageData(html, currentURL);

    // Save the page data (this is the key change!)
    this.pages[normalized] = data;

    for (const nextURL of data.outgoing_links) {
      if (this.shouldStop) break;

      const task = this.crawlPage(nextURL).finally(() => {
        this.allTasks.delete(task);
      });

      this.allTasks.add(task);
    }
  }

  public async crawl(): Promise<Record<string, ExtractedPageData>> {
    const firstTask = this.crawlPage(this.baseURL).finally(() => {
      this.allTasks.delete(firstTask);
    });

    this.allTasks.add(firstTask);

    await Promise.all(Array.from(this.allTasks));
    return this.pages;
  }
}

/* ---------------- Public API ---------------- */

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number,
  maxPages: number
): Promise<Record<string, ExtractedPageData>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  return await crawler.crawl();
}
