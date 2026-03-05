# 🕷️ TypeScript Web Crawler

A fast and concurrent **web crawler built with TypeScript and Node.js**.  
This project crawls a website, extracts useful page data, and generates a structured **JSON report**.

The crawler supports **concurrency**, **page limits**, and **HTML parsing** to collect meaningful information from each page.

---

# 🚀 Features

- Crawl websites starting from a base URL
- Concurrent crawling using **p-limit**
- Limit the number of pages crawled
- Extract useful page data:
  - Page URL
  - Page heading (`<h1>` or `<h2>`)
  - First paragraph
  - Outgoing links
  - Images on the page
- Generates a **sorted JSON report**
- Avoids crawling pages outside the target domain
- Prevents infinite crawling loops

---

# 🧠 How It Works

1. Start crawling from a **base URL**
2. Fetch the HTML of the page
3. Extract page data using HTML parsing
4. Store page data in memory
5. Extract all internal links
6. Recursively crawl each link
7. Stop when:
   - All pages are visited
   - The **maxPages limit** is reached
8. Generate a **JSON report**

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Usage

Run the crawler using:

```bash
npm run start <URL> <maxConcurrency> <maxPages>
```

Example:

```bash
npm run start https://crawler-test.com 3 25
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| URL | The starting page to crawl |
| maxConcurrency | Maximum concurrent requests |
| maxPages | Maximum number of pages to crawl |

---

# 📄 Output

After crawling finishes, the program generates:

```
report.json
```

Example output:

```json
[
  {
    "url": "https://crawler-test.com",
    "heading": "Crawler Test Site",
    "first_paragraph": "Welcome to the crawler test website.",
    "outgoing_links": [
      "https://crawler-test.com/page1"
    ],
    "image_urls": []
  }
]
```

---

# 🛠 Technologies Used

- **TypeScript**
- **Node.js**
- **JSDOM** – HTML parsing
- **p-limit** – concurrency control
- **Vitest** – testing
- **Node Fetch API**

---

# 📂 Project Structure

```
src/
 ├── crawl.ts        # crawler logic
 ├── report.ts       # JSON report generator
 ├── index.ts        # CLI entry point
```

---

# 🧪 Testing

Run tests with:

```bash
npm run test
```

---

# 💡 Future Improvements

Some ideas for extending this project:

- Detect **broken links**
- Separate **external vs internal links**
- Generate **site graph visualization**
- Schedule automatic crawling
- Email reports periodically
- Store results in a database

---

# 👨‍💻 Author

Created as part of the **Boot.dev Backend Development Course**.

If you found this project helpful or interesting, feel free to ⭐ the repository!
