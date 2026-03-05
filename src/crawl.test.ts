import { expect, test } from 'vitest'
import { normalizeURL,
getHeadingFromHTML,
getFirstParagraphFromHTML,
getURLsFromHTML, 
getImagesFromHTML,
extractPageData } from './crawl'

test('normalizeURL strip protocol', () => {
    const input = 'https://blog.boot.dev/path'
    const actual = normalizeURL(input)
    const expected = 'blog.boot.dev/path'
    expect(actual).toEqual(expected)
})

test('normalizeURL strip trailing slash', () => {
    const input = 'https://blog.boot.dev/path/'
    const actual = normalizeURL(input)
    const expected = 'blog.boot.dev/path'
    expect(actual).toEqual(expected)
})

test('normalizeURL capitals', () => {
    const input = 'https://BLOG.boot.dev/path'
    const actual = normalizeURL(input)
    const expected = 'blog.boot.dev/path'
    expect(actual).toEqual(expected)
})

test('normalizeURL strip http', () => {
    const input = 'http://blog.boot.dev/path'
    const actual = normalizeURL(input)
    const expected = 'blog.boot.dev/path'
    expect(actual).toEqual(expected)
})
//=================================
test('getHeadingFromHTML h1 priority', () => {
    const input = '<html><body><h1>Primary</h1><h2>Secondary</h2></body></html>'
    expect(getHeadingFromHTML(input)).toBe('Primary')
})

test('getHeadingFromHTML h2 fallback', () => {
    const input = '<html><body><h2>Only Secondary</h2></body></html>'
    expect(getHeadingFromHTML(input)).toBe('Only Secondary')
})

test('getHeadingFromHTML empty', () => {
    const input = '<html><body></body></html>'
    expect(getHeadingFromHTML(input)).toBe('')
})
//=======================================
test('getFirstParagraphFromHTML main priority', () => {
    const input = '<html><body><p>Outside</p><main><p>Inside Main</p></main></body></html>'
    expect(getFirstParagraphFromHTML(input)).toBe('Inside Main')
})

test('getFirstParagraphFromHTML no main fallback', () => {
    const input = '<html><body><p>Just a paragraph</p></body></html>'
    expect(getFirstParagraphFromHTML(input)).toBe('Just a paragraph')
})

test('getFirstParagraphFromHTML empty', () => {
    const input = '<html><body></body></html>'
    expect(getFirstParagraphFromHTML(input)).toBe('')
})
//=======================================================
test('getURLsFromHTML absolute and relative', () => {
    const baseURL = 'https://blog.boot.dev'
    const html = `
    <html>
        <body>
            <a href="https://other.com/external">External</a>
            <a href="/internal/">Internal</a>
        </body>
    </html>`
    const actual = getURLsFromHTML(html, baseURL)
    const expected = ['https://other.com/external', 'https://blog.boot.dev/internal/']
    expect(actual).toEqual(expected)
})
//================================================
test('getImagesFromHTML relative to absolute', () => {
    const baseURL = 'https://blog.boot.dev'
    const html = `<html><body><img src="/path/to/img.png"></body></html>`
    const actual = getImagesFromHTML(html, baseURL)
    const expected = ['https://blog.boot.dev/path/to/img.png']
    expect(actual).toEqual(expected)
})

test('getImagesFromHTML handles missing src', () => {
    const baseURL = 'https://blog.boot.dev'
    const html = `<html><body><img></body></html>`
    const actual = getImagesFromHTML(html, baseURL)
    expect(actual).toEqual([])
})
//======================================
test("extractPageData basic", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});
