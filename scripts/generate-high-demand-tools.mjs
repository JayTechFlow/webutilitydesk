import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ogImage = "https://webutilitydesk.com/assets/og-image.svg";
const commonNav = [
  { href: "../json-formatter/", label: "JSON" },
  { href: "../json-validator/", label: "Validate" },
  { href: "../regex-tester/", label: "Regex" },
  { href: "../sql-formatter/", label: "SQL" },
  { href: "../blog/", label: "Blog" },
  { href: "../guides/", label: "Guides" },
  { href: "../resources/", label: "Resources" },
];
const footerTools = [
  { href: "../json-formatter/", label: "JSON Formatter" },
  { href: "../json-validator/", label: "JSON Validator" },
  { href: "../csv-to-json-converter/", label: "CSV to JSON Converter" },
  { href: "../regex-tester/", label: "Regex Tester" },
  { href: "../regex-generator/", label: "Regex Generator" },
  { href: "../sql-formatter/", label: "SQL Formatter" },
  { href: "../json-compare-tool/", label: "JSON Compare Tool" },
  { href: "../html-minifier/", label: "HTML Minifier" },
  { href: "../css-minifier/", label: "CSS Minifier" },
  { href: "../javascript-minifier/", label: "JavaScript Minifier" },
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeFaqSchema(faq) {
  return faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  }));
}

function articleSection({ eyebrow, id, title, paragraphs }) {
  return `<section class="section-block article-section" aria-labelledby="${id}">
        <div class="section-heading">
          <div><p class="eyebrow">${eyebrow}</p></div>
          <h2 id="${id}">${title}</h2>
        </div>
        <div class="article-copy">
          ${paragraphs.map((p) => `<p>${p}</p>`).join("\n          ")}
        </div>
      </section>`;
}

function gridSection({ eyebrow, id, title, cards }) {
  return `<section class="section-block tool-content" aria-labelledby="${id}">
        <div class="section-heading">
          <div><p class="eyebrow">${eyebrow}</p></div>
          <h2 id="${id}">${title}</h2>
        </div>
        <div class="content-grid">
          ${cards
            .map((card) => `<article><h3>${card.title}</h3><p>${card.text}</p></article>`)
            .join("\n          ")}
        </div>
      </section>`;
}

function faqSection({ id, title, faq }) {
  return `<section class="section-block tool-content" aria-labelledby="${id}">
        <div class="section-heading">
          <div><p class="eyebrow">FAQ</p></div>
          <h2 id="${id}">${title}</h2>
        </div>
        <div class="content-grid">
          ${faq.map((item) => `<article><h3>${item.q}</h3><p>${item.a}</p></article>`).join("\n          ")}
        </div>
      </section>`;
}

function relatedSection(title, links) {
  return `<section class="section-block related-section" aria-labelledby="related-tools">
        <div class="section-heading">
          <div><p class="eyebrow">Related tools</p></div>
          <h2 id="related-tools">${title}</h2>
        </div>
        <div class="related-links">
          ${links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("\n          ")}
        </div>
      </section>`;
}

function footerHtml() {
  return `<div>
          <strong>Tools</strong>
          ${footerTools.map((item) => `<a href="${item.href}">${item.label}</a>`).join("\n          ")}
        </div>
        <div>
          <strong>Site</strong>
          <a href="../about/">About</a>
          <a href="../blog/">Blog</a>
          <a href="../guides/">Guides</a>
          <a href="../resources/">Resources</a>
          <a href="../contact/">Contact</a>
          <a href="../privacy-policy/">Privacy</a>
          <a href="../terms/">Terms</a>
        </div>`;
}

function buildPage(page) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: page.name,
        url: page.canonical,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        description: page.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://webutilitydesk.com/" },
          { "@type": "ListItem", position: 2, name: page.name, item: page.canonical },
        ],
      },
      { "@type": "FAQPage", mainEntity: makeFaqSchema(page.faq) },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${page.canonical}" />
    <meta property="og:title" content="${esc(page.ogTitle)}" />
    <meta property="og:description" content="${esc(page.ogDescription)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${page.canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.ogTitle)}" />
    <meta name="twitter:description" content="${esc(page.ogDescription)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="theme-color" content="#0f766e" />
    <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="../assets/apple-touch-icon.svg" />
    <link rel="manifest" href="../assets/site.webmanifest" />
    <link rel="stylesheet" href="../assets/styles.css" />
    <script src="../assets/analytics.js" defer></script>
    <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../" aria-label="Web Utility Desk home">
        <img src="../assets/brand-mark.svg" alt="" width="34" height="34" />
        <span>Web Utility Desk</span>
      </a>
      <nav class="top-nav" aria-label="Primary navigation">
        ${commonNav.map((item) => `<a href="${item.href}">${item.label}</a>`).join("\n        ")}
      </nav>
    </header>
    <main>
      <section class="tool-page">
        <div class="tool-hero">
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.heroTitle}</h1>
          <p class="summary">${page.heroSummary}</p>
        </div>
        <section class="tool-panel standalone-tool" aria-label="${page.name} workspace">
          <div class="tool-body">
            ${page.toolHtml}
          </div>
        </section>
      </section>
      ${page.sections.join("\n      ")}
    </main>
    ${page.script ? `<script>${page.script}</script>` : ""}
    <footer class="site-footer">
      <div>
        <span>Web Utility Desk</span>
        <p>Free web utility tools for everyday technical work.</p>
      </div>
      <nav class="footer-nav" aria-label="Footer navigation">
        ${footerHtml()}
      </nav>
    </footer>
  </body>
</html>`;
}

function writePage(slug, page) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), buildPage(page));
}

const pages = [
  {
    slug: "csv-to-json-converter",
    name: "CSV to JSON Converter",
    title: "CSV to JSON Converter | Web Utility Desk",
    description: "Convert CSV to JSON in your browser with header support, copy actions, and practical use cases.",
    canonical: "https://webutilitydesk.com/csv-to-json-converter/",
    ogTitle: "CSV to JSON Converter",
    ogDescription: "Convert CSV to JSON in your browser with header support and copy actions.",
    eyebrow: "Data conversion tool",
    heroTitle: "CSV to JSON Converter",
    heroSummary: "Turn comma-separated tables into JSON objects locally in the browser, then copy the result for APIs, test fixtures, or quick data cleanup.",
    toolHtml: `<div class="field-group">
              <label for="csv-input">CSV input</label>
              <textarea id="csv-input" spellcheck="false" rows="10">name,role,team
Ava,Designer,Content
Noah,Engineer,Platform
Maya,PM,Product</textarea>
            </div>
            <div class="field-group" style="margin-top: 14px;">
              <label><input id="use-headers" type="checkbox" checked /> Use first row as headers</label>
            </div>
            <div class="action-row" aria-label="CSV to JSON actions">
              <button class="primary-action" id="run-tool" type="button">Convert CSV</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy JSON</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">JSON output</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="12" readonly></textarea>
            </div>
            <div class="scan-status" id="csv-summary">Use the sample to see how rows become JSON objects.</div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "csv-guide",
        title: "Why CSV to JSON conversion matters in real projects.",
        paragraphs: [
          "CSV appears everywhere because it is easy to export from spreadsheets, dashboards, admin panels, and report tools. JSON, on the other hand, is the format most web APIs, frontend apps, and automation scripts actually want. A browser-side CSV to JSON converter removes the middle step when you need to move data from a tabular export into a structured payload or a test fixture.",
          "This tool uses the first row as headers by default, which matches how most CSV exports are intended to work. If your file is a simple value list, you can turn that option off and keep the raw rows instead. Either way, the conversion happens locally in the browser, so short-lived data does not need to be uploaded to a backend before you inspect or copy it.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "csv-examples",
        title: "Practical examples and common use cases.",
        cards: [
          { title: "API seed data", text: "Convert spreadsheet exports into JSON objects you can paste into fixtures, mock APIs, or local test data." },
          { title: "Support cleanup", text: "Turn CSV exports from admin tools into readable JSON for debugging and issue triage." },
          { title: "Quick import checks", text: "Verify column names and row values before you build an importer or migration script." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "csv-workflow",
        title: "How to avoid bad conversions.",
        paragraphs: [
          "Start by confirming the delimiter and the encoding. Most exports use commas, but some systems use semicolons or tabs. If fields can contain commas, they should be wrapped in quotes, and embedded quotes should be doubled. Those rules matter because a browser tool can only convert the data it actually receives.",
          "If your sheet has repeated values or optional columns, inspect the output for missing keys before you copy it. A structured converter preserves the data shape, but it cannot infer meaning that is not present in the file. When the output still looks off, validate the source CSV first and then use <a href=\"../json-formatter/\">JSON Formatter</a> or <a href=\"../json-validator/\">JSON Validator</a> to review the result.",
        ],
      }),
      faqSection({
        id: "csv-faq",
        title: "CSV to JSON Converter questions.",
        faq: [
          { q: "Does this converter handle quoted commas?", a: "Yes. The parser keeps quoted fields together so commas inside quotes stay inside the same value." },
          { q: "Can I convert CSV without headers?", a: "Yes. Turn off the first-row header option and the page will keep each row as an array." },
          { q: "Is the conversion browser-only?", a: "Yes. The CSV is parsed locally and the JSON is generated in your browser." },
          { q: "What should I do with a malformed row?", a: "Check the source CSV for broken quotes, inconsistent column counts, or the wrong delimiter before converting again." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../json-formatter/", label: "JSON Formatter" },
        { href: "../json-validator/", label: "JSON Validator" },
        { href: "../json-compare-tool/", label: "JSON Compare Tool" },
        { href: "../sql-formatter/", label: "SQL Formatter" },
      ]),
    ],
    faq: [
      { q: "Does this converter handle quoted commas?", a: "Yes. The parser keeps quoted fields together so commas inside quotes stay inside the same value." },
      { q: "Can I convert CSV without headers?", a: "Yes. Turn off the first-row header option and the page will keep each row as an array." },
      { q: "Is the conversion browser-only?", a: "Yes. The CSV is parsed locally and the JSON is generated in your browser." },
      { q: "What should I do with a malformed row?", a: "Check the source CSV for broken quotes, inconsistent column counts, or the wrong delimiter before converting again." },
    ],
    script: `const inputEl=document.querySelector("#csv-input"),outputEl=document.querySelector("#tool-output"),statusEl=document.querySelector("#tool-status"),summaryEl=document.querySelector("#csv-summary"),useHeadersEl=document.querySelector("#use-headers"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},run=()=>{try{const result=GrowthTools.csvToJson(inputEl.value,{useHeaders:useHeadersEl.checked});outputEl.value=result.json;summaryEl.textContent=useHeadersEl.checked?result.rowCount+" rows converted with "+result.columnCount+" columns.":result.rowCount+" raw rows converted as arrays.";setStatus("Converted")}catch(error){setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{inputEl.value="name,role,team\\nAva,Designer,Content\\nNoah,Engineer,Platform\\nMaya,PM,Product";useHeadersEl.checked=true;run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{inputEl.value="";outputEl.value="";summaryEl.textContent="Paste CSV rows or use the sample.";setStatus("Ready")});[inputEl,useHeadersEl].forEach((el)=>el.addEventListener(el.type==="checkbox"?"change":"input",run));run();`,
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    title: "Regex Tester | Web Utility Desk",
    description: "Test regular expressions against sample text, inspect matches, and copy the pattern without leaving your browser.",
    canonical: "https://webutilitydesk.com/regex-tester/",
    ogTitle: "Regex Tester",
    ogDescription: "Test regular expressions against sample text and inspect matches in the browser.",
    eyebrow: "Pattern testing tool",
    heroTitle: "Regex Tester",
    heroSummary: "Check patterns against sample text, inspect matched groups, and see exactly what your regex is doing before you ship it.",
    toolHtml: `<div class="tool-controls">
              <div class="field-group">
                <label for="regex-pattern">Regex pattern</label>
                <input id="regex-pattern" class="tool-select" type="text" value="Web Utility Desk" />
              </div>
              <div class="field-group">
                <label for="regex-flags">Flags</label>
                <input id="regex-flags" class="tool-select" type="text" value="gi" />
              </div>
            </div>
            <div class="field-group" style="margin-top: 14px;">
              <label for="regex-sample">Sample text</label>
              <textarea id="regex-sample" spellcheck="false" rows="10">Web Utility Desk helps developers test, format, and compare content.
The desk also keeps utility workflows simple for teams.</textarea>
            </div>
            <div class="action-row" aria-label="Regex tester actions">
              <button class="primary-action" id="run-tool" type="button">Test Regex</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy Result</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Match summary</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="10" readonly></textarea>
            </div>
            <div class="tool-preview" id="regex-preview" aria-label="Regex preview"></div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "regex-guide",
        title: "How to use a regex tester without guessing.",
        paragraphs: [
          "Regular expressions are powerful because they let you match patterns instead of single literal strings, but that power is also why small mistakes are easy to miss. A tester helps you see whether the engine matched the text you expected, whether your flags are correct, and whether the pattern is too broad or too narrow for the task.",
          "This page runs entirely in the browser, so you can iterate quickly on validation rules, search filters, text cleanup, and scraping rules. When you are done testing, move to the <a href=\"../regex-generator/\">Regex Generator</a> if you need a safer starting point, or compare the resulting text with the <a href=\"../text-diff-checker/\">Text Diff Checker</a>.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "regex-examples",
        title: "Common regex testing workflows.",
        cards: [
          { title: "Validation", text: "Check whether user names, emails, or slugs match the intended validation rule." },
          { title: "Search", text: "Confirm that your pattern captures the right text before you use it in code or a CMS filter." },
          { title: "Cleanup", text: "Test patterns that remove repeated spaces, tags, or noisy labels from text." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "regex-workflow",
        title: "What to inspect when a pattern fails.",
        paragraphs: [
          "If the pattern produces no matches, start by checking the flags and the anchors. A pattern that is missing the i flag may fail on case differences, while an overly strict ^ or $ anchor can prevent partial matches from appearing at all. The tester makes those issues visible without opening a code editor.",
          "If the pattern matches too much, reduce its scope by adding literal boundaries, escaping punctuation, or tightening the character classes. Use the preview area to confirm what the engine found in the sample text and copy the final pattern only after the output looks right.",
        ],
      }),
      faqSection({
        id: "regex-faq",
        title: "Regex Tester questions.",
        faq: [
          { q: "Does the tester support flags?", a: "Yes. You can edit the flags field to test case-insensitive, multiline, or global matching." },
          { q: "Can I see capture groups?", a: "Yes. The output includes the matches and any capture groups from the first match." },
          { q: "Is the matching done locally?", a: "Yes. The regex runs in your browser with no server round-trip." },
          { q: "What if my pattern is invalid?", a: "The page shows the JavaScript regex error so you can fix the syntax before testing again." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../regex-generator/", label: "Regex Generator" },
        { href: "../json-compare-tool/", label: "JSON Compare Tool" },
        { href: "../text-diff-checker/", label: "Text Diff Checker" },
        { href: "../slug-generator/", label: "Slug Generator" },
      ]),
    ],
    faq: [
      { q: "Does the tester support flags?", a: "Yes. You can edit the flags field to test case-insensitive, multiline, or global matching." },
      { q: "Can I see capture groups?", a: "Yes. The output includes the matches and any capture groups from the first match." },
      { q: "Is the matching done locally?", a: "Yes. The regex runs in your browser with no server round-trip." },
      { q: "What if my pattern is invalid?", a: "The page shows the JavaScript regex error so you can fix the syntax before testing again." },
    ],
    script: `const patternEl=document.querySelector("#regex-pattern"),flagsEl=document.querySelector("#regex-flags"),sampleEl=document.querySelector("#regex-sample"),outputEl=document.querySelector("#tool-output"),previewEl=document.querySelector("#regex-preview"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},renderPreview=(text,matches)=>{const escaped=GrowthTools.escapeHtml(text);if(!matches.length){previewEl.innerHTML='<div class="scan-status">No matches found.</div>';return}let html="";let lastIndex=0;matches.forEach(({index,match})=>{html+=GrowthTools.escapeHtml(text.slice(lastIndex,index))+"<mark>"+GrowthTools.escapeHtml(match)+"</mark>";lastIndex=index+match.length});html+=GrowthTools.escapeHtml(text.slice(lastIndex));previewEl.innerHTML=html};const run=()=>{try{const regex=new RegExp(patternEl.value,flagsEl.value);const text=sampleEl.value;const matches=[];if(regex.global){for(const match of text.matchAll(regex)){matches.push({index:match.index||0,match:match[0]})}}else{const match=regex.exec(text);if(match)matches.push({index:match.index||0,match:match[0]})}const first=matches[0];const summary=["Pattern: /"+patternEl.value+"/"+flagsEl.value,"Matches: "+matches.length];if(first){summary.push("First match: "+first.match)}if(regex.global&&matches.length){summary.push("Global matching enabled")}outputEl.value=summary.join("\\n");renderPreview(text,matches);setStatus("Tested")}catch(error){previewEl.innerHTML="";setStatus(error.message,true);outputEl.value=""}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{patternEl.value="Web Utility Desk";flagsEl.value="gi";sampleEl.value="Web Utility Desk helps developers test, format, and compare content.\\nThe desk also keeps utility workflows simple for teams.";run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{patternEl.value="";flagsEl.value="";sampleEl.value="";outputEl.value="";previewEl.innerHTML="";setStatus("Ready")});[patternEl,flagsEl,sampleEl].forEach((el)=>el.addEventListener(el.tagName==="TEXTAREA"?"input":"input",run));run();`,
  },
  {
    slug: "regex-generator",
    name: "Regex Generator",
    title: "Regex Generator | Web Utility Desk",
    description: "Generate useful regex patterns from plain text and common validation presets in your browser.",
    canonical: "https://webutilitydesk.com/regex-generator/",
    ogTitle: "Regex Generator",
    ogDescription: "Generate practical regex patterns from plain text and common validation presets.",
    eyebrow: "Pattern builder tool",
    heroTitle: "Regex Generator",
    heroSummary: "Turn plain text into a usable regex pattern, then copy the literal into your editor or validation rule.",
    toolHtml: `<div class="tool-controls">
              <div class="field-group">
                <label for="regex-input">Sample text</label>
                <input id="regex-input" class="tool-select" type="text" value="Web Utility Desk" />
              </div>
              <div class="field-group">
                <label for="regex-mode">Pattern mode</label>
                <select id="regex-mode" class="tool-select">
                  <option value="exact">Exact match</option>
                  <option value="contains">Contains text</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="wholeWord">Whole word</option>
                  <option value="digits">Digits only</option>
                  <option value="letters">Letters only</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="slug">Slug</option>
                </select>
              </div>
            </div>
            <div class="action-row" aria-label="Regex generator actions">
              <button class="primary-action" id="run-tool" type="button">Generate Regex</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy Pattern</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Generated regex</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="10" readonly></textarea>
            </div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "regex-generator-guide",
        title: "Generate a practical regex instead of starting from scratch.",
        paragraphs: [
          "A regex generator is useful when you know the kind of text you want to match but do not want to build the pattern character by character. This page helps you create a strong starting point for common tasks like exact matching, contains checks, whole-word validation, and common field formats such as emails, URLs, and slugs.",
          "The result is still a regex, which means you should test it before you rely on it in production. Use the generated output with the <a href=\"../regex-tester/\">Regex Tester</a> to verify the pattern against real sample text, and pair it with the <a href=\"../slug-generator/\">Slug Generator</a> when you are working with URL-friendly names.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "regex-generator-examples",
        title: "Common ways developers use generated patterns.",
        cards: [
          { title: "Validation rules", text: "Generate a quick pattern for slugs, numbers, email addresses, or simple text checks." },
          { title: "Search filters", text: "Create a safe literal match before you use a pattern in a text filter or admin search." },
          { title: "Clean-up tasks", text: "Start from a generated pattern and refine it for replacements or data cleanup." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "regex-generator-workflow",
        title: "How to keep generated patterns useful.",
        paragraphs: [
          "Keep the generated pattern as small as possible. If you only need to match a literal string, exact mode is usually better than a broad contains pattern because it reduces accidental matches. If you need a validation rule, start from the preset that is closest to your target format and then tighten the result in the tester.",
          "The browser tool makes it easy to move between generation and testing without leaving the page. That is useful when you are iterating on forms, search features, content rules, or support tooling where a small regex error can break a workflow or reject valid input.",
        ],
      }),
      faqSection({
        id: "regex-generator-faq",
        title: "Regex Generator questions.",
        faq: [
          { q: "Is the generated regex escaped?", a: "Yes. Literal text is escaped so special characters are treated as text unless the preset says otherwise." },
          { q: "Can I generate common validation patterns?", a: "Yes. The preset list includes digits, letters, email, URL, and slug patterns." },
          { q: "Should I still test the pattern?", a: "Yes. Always test generated output with real sample text before using it in production." },
          { q: "Is the generator browser-only?", a: "Yes. The pattern is built locally in the browser." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../regex-tester/", label: "Regex Tester" },
        { href: "../json-compare-tool/", label: "JSON Compare Tool" },
        { href: "../slug-generator/", label: "Slug Generator" },
        { href: "../url-encoder-decoder/", label: "URL Encoder/Decoder" },
      ]),
    ],
    faq: [
      { q: "Is the generated regex escaped?", a: "Yes. Literal text is escaped so special characters are treated as text unless the preset says otherwise." },
      { q: "Can I generate common validation patterns?", a: "Yes. The preset list includes digits, letters, email, URL, and slug patterns." },
      { q: "Should I still test the pattern?", a: "Yes. Always test generated output with real sample text before using it in production." },
      { q: "Is the generator browser-only?", a: "Yes. The pattern is built locally in the browser." },
    ],
    script: `const inputEl=document.querySelector("#regex-input"),modeEl=document.querySelector("#regex-mode"),outputEl=document.querySelector("#tool-output"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},run=()=>{try{const result=GrowthTools.buildRegexPattern({input:inputEl.value,mode:modeEl.value,ignoreCase:true,multiline:false,dotAll:false});outputEl.value="Literal: "+result.literal+"\\nPattern: /"+result.source+"/"+result.flags+"\\n"+result.explanation;setStatus("Generated")}catch(error){setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{inputEl.value="Web Utility Desk";modeEl.value="exact";run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{inputEl.value="";outputEl.value="";setStatus("Ready")});inputEl.addEventListener("input",run);modeEl.addEventListener("change",run);run();`,
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    title: "SQL Formatter | Web Utility Desk",
    description: "Format SQL queries into readable clauses and copy clean queries for reviews and debugging.",
    canonical: "https://webutilitydesk.com/sql-formatter/",
    ogTitle: "SQL Formatter",
    ogDescription: "Format SQL queries into readable clauses in your browser.",
    eyebrow: "Query formatting tool",
    heroTitle: "SQL Formatter",
    heroSummary: "Rewrite dense SQL into readable clauses, then copy a cleaner query for review, debugging, or documentation.",
    toolHtml: `<div class="field-group">
              <label for="sql-input">SQL input</label>
              <textarea id="sql-input" spellcheck="false" rows="12">select id, name, email, created_at from users where status = 'active' and created_at >= '2025-01-01' order by created_at desc;</textarea>
            </div>
            <div class="action-row" aria-label="SQL formatter actions">
              <button class="primary-action" id="run-tool" type="button">Format SQL</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy SQL</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Formatted SQL</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="12" readonly></textarea>
            </div>
            <div class="scan-status">This formatter is best for everyday SELECT, UPDATE, INSERT, and DELETE queries.</div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "sql-guide",
        title: "Why SQL formatting helps review and debugging.",
        paragraphs: [
          "Readable SQL is easier to review, easier to compare, and easier to explain to teammates. When a query is collapsed into one long line, it becomes harder to spot join conditions, filter clauses, and ordering rules. A formatter makes those parts visible and gives you a better starting point before you share or deploy the query.",
          "This browser-side tool is intentionally pragmatic. It focuses on common clauses and keeps the output readable without requiring a database connection or a backend parser. For more structured data review, pair it with the <a href=\"../json-compare-tool/\">JSON Compare Tool</a> or <a href=\"../json-formatter/\">JSON Formatter</a> when your SQL output is being compared with API payloads.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "sql-examples",
        title: "Common SQL formatting workflows.",
        cards: [
          { title: "Code review", text: "Format queries before you paste them into a pull request, ticket, or design note." },
          { title: "Debugging", text: "Make it easier to see WHERE, JOIN, GROUP BY, and ORDER BY clauses at a glance." },
          { title: "Documentation", text: "Turn compact query snippets into examples that are easier for beginners to read." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "sql-workflow",
        title: "Keep the formatter focused on common queries.",
        paragraphs: [
          "The page is designed for practical everyday SQL instead of exotic vendor-specific syntax. If your query contains nested subqueries or very advanced formatting rules, use the output as a cleaner starting point and then make manual edits if needed. That is usually faster than hand-formatting the entire statement from scratch.",
          "When you are working with exported data, keep SQL formatting separate from CSV cleanup and JSON review. Each tool should solve one problem well. That approach keeps your workflow fast and makes it easier to identify whether the issue is in the query, the export, or the downstream data format.",
        ],
      }),
      faqSection({
        id: "sql-faq",
        title: "SQL Formatter questions.",
        faq: [
          { q: "Does this handle common SELECT queries?", a: "Yes. It is built for everyday SELECT, INSERT, UPDATE, and DELETE statements." },
          { q: "Will it preserve quoted values?", a: "Yes. Quoted string values are preserved while the surrounding query is reformatted." },
          { q: "Is the formatting browser-only?", a: "Yes. The query is formatted locally in your browser." },
          { q: "Should I still review the output manually?", a: "Yes. Use the formatter as a readability pass, then make sure the query still means what you intended." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../csv-to-json-converter/", label: "CSV to JSON Converter" },
        { href: "../json-compare-tool/", label: "JSON Compare Tool" },
        { href: "../json-formatter/", label: "JSON Formatter" },
        { href: "../regex-tester/", label: "Regex Tester" },
      ]),
    ],
    faq: [
      { q: "Does this handle common SELECT queries?", a: "Yes. It is built for everyday SELECT, INSERT, UPDATE, and DELETE statements." },
      { q: "Will it preserve quoted values?", a: "Yes. Quoted string values are preserved while the surrounding query is reformatted." },
      { q: "Is the formatting browser-only?", a: "Yes. The query is formatted locally in your browser." },
      { q: "Should I still review the output manually?", a: "Yes. Use the formatter as a readability pass, then make sure the query still means what you intended." },
    ],
    script: `const inputEl=document.querySelector("#sql-input"),outputEl=document.querySelector("#tool-output"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},run=()=>{try{outputEl.value=GrowthTools.formatSql(inputEl.value);setStatus("Formatted")}catch(error){setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{inputEl.value="select id, name, email, created_at from users where status = 'active' and created_at >= '2025-01-01' order by created_at desc;";run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{inputEl.value="";outputEl.value="";setStatus("Ready")});inputEl.addEventListener("input",run);run();`,
  },
  {
    slug: "json-compare-tool",
    name: "JSON Compare Tool",
    title: "JSON Compare Tool | Web Utility Desk",
    description: "Compare two JSON documents, inspect structural differences, and copy a normalized diff summary.",
    canonical: "https://webutilitydesk.com/json-compare-tool/",
    ogTitle: "JSON Compare Tool",
    ogDescription: "Compare two JSON documents and inspect structural differences in the browser.",
    eyebrow: "Comparison tool",
    heroTitle: "JSON Compare Tool",
    heroSummary: "Compare two JSON documents side by side, inspect changed keys or values, and copy a summary without leaving your browser.",
    toolHtml: `<div class="tool-controls">
              <div class="field-group">
                <label for="json-left">JSON left</label>
                <textarea id="json-left" spellcheck="false" rows="10">{\n  \"name\": \"Web Utility Desk\",\n  \"status\": \"draft\",\n  \"features\": [\"json\", \"url\", \"uuid\"]\n}</textarea>
              </div>
              <div class="field-group">
                <label for="json-right">JSON right</label>
                <textarea id="json-right" spellcheck="false" rows="10">{\n  \"name\": \"Web Utility Desk\",\n  \"status\": \"published\",\n  \"features\": [\"json\", \"url\", \"uuid\", \"regex\"]\n}</textarea>
              </div>
            </div>
            <div class="action-row" aria-label="JSON compare actions">
              <button class="primary-action" id="run-tool" type="button">Compare JSON</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy Summary</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Comparison summary</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="10" readonly></textarea>
            </div>
            <div class="tool-preview" id="json-diff-preview"></div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "json-compare-guide",
        title: "Why JSON comparison is useful before you ship a change.",
        paragraphs: [
          "When an API response changes, it is not always obvious whether the structure changed in a meaningful way. A JSON compare tool shows which keys were added, removed, or updated so you can review the exact delta instead of reading both blobs line by line.",
          "This page is a good companion to the <a href=\"../json-formatter/\">JSON Formatter</a> and <a href=\"../json-validator/\">JSON Validator</a> because it expects structured JSON on both sides. If you are comparing exported data from a spreadsheet, use the <a href=\"../csv-to-json-converter/\">CSV to JSON Converter</a> first.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "json-compare-examples",
        title: "Common JSON comparison workflows.",
        cards: [
          { title: "API review", text: "Spot changed fields in a response before you merge a backend or frontend update." },
          { title: "Fixture checks", text: "Compare a saved test fixture with a new export to see what changed." },
          { title: "Content sync", text: "Review differences between CMS payloads, webhook bodies, or configuration files." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "json-compare-workflow",
        title: "Keep the comparison readable and focused.",
        paragraphs: [
          "Start by formatting or validating both inputs if they came from different systems. That removes noise from whitespace and helps the diff engine focus on the actual structural differences. Then look at whether the change is additive, destructive, or a simple value update.",
          "When a JSON object grows quickly, pay attention to nested arrays and repeated records. Those are the places where regressions hide. The tool reports those paths directly so you can decide whether the change is expected or whether a downstream page, API, or automation script needs to be updated.",
        ],
      }),
      faqSection({
        id: "json-compare-faq",
        title: "JSON Compare Tool questions.",
        faq: [
          { q: "Does the tool compare nested values?", a: "Yes. The diff output includes nested object and array paths." },
          { q: "Can I compare different key orders?", a: "Yes. The tool focuses on structure and value differences instead of formatting noise." },
          { q: "Is the comparison browser-only?", a: "Yes. The JSON is parsed locally in your browser." },
          { q: "What if one document is invalid JSON?", a: "The page shows the parsing error so you can fix the input before comparing again." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../json-formatter/", label: "JSON Formatter" },
        { href: "../json-validator/", label: "JSON Validator" },
        { href: "../csv-to-json-converter/", label: "CSV to JSON Converter" },
        { href: "../text-diff-checker/", label: "Text Diff Checker" },
      ]),
    ],
    faq: [
      { q: "Does the tool compare nested values?", a: "Yes. The diff output includes nested object and array paths." },
      { q: "Can I compare different key orders?", a: "Yes. The tool focuses on structure and value differences instead of formatting noise." },
      { q: "Is the comparison browser-only?", a: "Yes. The JSON is parsed locally in your browser." },
      { q: "What if one document is invalid JSON?", a: "The page shows the parsing error so you can fix the input before comparing again." },
    ],
    script: `const leftEl=document.querySelector("#json-left"),rightEl=document.querySelector("#json-right"),outputEl=document.querySelector("#tool-output"),previewEl=document.querySelector("#json-diff-preview"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},render=({differences,leftPretty,rightPretty,summary})=>{outputEl.value=[summary,"", "Left JSON:", leftPretty, "", "Right JSON:", rightPretty].join("\\n");previewEl.innerHTML=differences.length?'<div class="diff-lines">'+differences.map((item)=>'<div class="diff-line '+(item.type==="added"?"is-added":item.type==="removed"?"is-removed":"")+'"><strong>'+item.path+'</strong> · '+item.type+'<br />Left: '+GrowthTools.escapeHtml(JSON.stringify(item.left))+'<br />Right: '+GrowthTools.escapeHtml(JSON.stringify(item.right))+'</div>').join('')+'</div>':'<div class="scan-status">No differences found.</div>'};const run=()=>{try{const result=GrowthTools.compareJsonText(leftEl.value,rightEl.value);render(result);setStatus(result.summary)}catch(error){previewEl.innerHTML="";outputEl.value="";setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{leftEl.value='{\\n  \"name\": \"Web Utility Desk\",\\n  \"status\": \"draft\",\\n  \"features\": [\"json\", \"url\", \"uuid\"]\\n}';rightEl.value='{\\n  \"name\": \"Web Utility Desk\",\\n  \"status\": \"published\",\\n  \"features\": [\"json\", \"url\", \"uuid\", \"regex\"]\\n}';run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{leftEl.value='';rightEl.value='';outputEl.value='';previewEl.innerHTML='';setStatus('Ready')});[leftEl,rightEl].forEach((el)=>el.addEventListener("input",run));run();`,
  },
  {
    slug: "html-minifier",
    name: "HTML Minifier",
    title: "HTML Minifier | Web Utility Desk",
    description: "Minify HTML in the browser with examples, copy actions, and common minification caveats.",
    canonical: "https://webutilitydesk.com/html-minifier/",
    ogTitle: "HTML Minifier",
    ogDescription: "Minify HTML in the browser and copy compact markup.",
    eyebrow: "Markup optimization tool",
    heroTitle: "HTML Minifier",
    heroSummary: "Shrink HTML markup locally, keep the browser workflow fast, and copy compact output for deployment or templates.",
    toolHtml: `<div class="field-group">
              <label for="html-input">HTML input</label>
              <textarea id="html-input" spellcheck="false" rows="12"><div class="card">\n  <h2>Web Utility Desk</h2>\n  <p>Fast browser tools for developers.</p>\n</div></textarea>
            </div>
            <div class="action-row" aria-label="HTML minifier actions">
              <button class="primary-action" id="run-tool" type="button">Minify HTML</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy HTML</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Minified HTML</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="12" readonly></textarea>
            </div>
            <div class="scan-status">Good for landing pages, snippets, and small templates. Keep complex documents readable first.</div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "html-minify-guide",
        title: "When HTML minification is worth doing.",
        paragraphs: [
          "HTML minification removes comments and unnecessary whitespace so the markup becomes smaller and easier to ship. That can be useful for landing pages, templates, and static files where every byte still matters, even when you are not using a build pipeline.",
          "The page keeps the workflow browser-side. That means you can test how compact your markup becomes before you decide whether to paste it into a deployment bundle, a CMS, or a static export. For related cleanup tasks, pair this page with the <a href=\"../css-minifier/\">CSS Minifier</a> and <a href=\"../javascript-minifier/\">JavaScript Minifier</a>.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "html-minify-examples",
        title: "Practical minification workflows.",
        cards: [
          { title: "Landing pages", text: "Shrink simple marketing markup before you ship static pages or emails." },
          { title: "Templates", text: "Prepare compact fragments for CMS, snippet, or server-side template workflows." },
          { title: "Debugging", text: "Compare readable source with compact output when you are checking a deployment issue." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "html-minify-workflow",
        title: "Minify carefully when the markup contains code.",
        paragraphs: [
          "The safest minification workflow starts with a readable source document. If the page contains script, style, or preformatted code blocks, review the output before you rely on it. Minification is most useful when the markup is simple and the content is already validated.",
          "If the HTML page is paired with CSS and JavaScript bundles, use the dedicated minifiers for those assets too. Keeping each asset type separate makes it easier to see what changed and keeps your deploy workflow predictable.",
        ],
      }),
      faqSection({
        id: "html-minify-faq",
        title: "HTML Minifier questions.",
        faq: [
          { q: "Does the minifier remove comments?", a: "Yes. It strips normal HTML comments before compacting whitespace." },
          { q: "Does it preserve browser-side code blocks?", a: "Yes. Script, style, pre, textarea, and code blocks are preserved as blocks." },
          { q: "Is the minification browser-only?", a: "Yes. The markup is compacted locally in your browser." },
          { q: "Should I minify every HTML file?", a: "No. Minify the files where the size or deployment workflow benefits from it." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../css-minifier/", label: "CSS Minifier" },
        { href: "../javascript-minifier/", label: "JavaScript Minifier" },
        { href: "../html-encoder-decoder/", label: "HTML Encoder/Decoder" },
        { href: "../text-reverser/", label: "Text Reverser" },
      ]),
    ],
    faq: [
      { q: "Does the minifier remove comments?", a: "Yes. It strips normal HTML comments before compacting whitespace." },
      { q: "Does it preserve browser-side code blocks?", a: "Yes. Script, style, pre, textarea, and code blocks are preserved as blocks." },
      { q: "Is the minification browser-only?", a: "Yes. The markup is compacted locally in your browser." },
      { q: "Should I minify every HTML file?", a: "No. Minify the files where the size or deployment workflow benefits from it." },
    ],
    script: `const inputEl=document.querySelector("#html-input"),outputEl=document.querySelector("#tool-output"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},run=()=>{try{outputEl.value=GrowthTools.minifyHtml(inputEl.value);setStatus("Minified")}catch(error){setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{inputEl.value='<div class="card">\\n  <h2>Web Utility Desk</h2>\\n  <p>Fast browser tools for developers.</p>\\n</div>';run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{inputEl.value='';outputEl.value='';setStatus('Ready')});inputEl.addEventListener("input",run);run();`,
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    title: "CSS Minifier | Web Utility Desk",
    description: "Minify CSS locally, keep your workflow browser-side, and copy compact styles for deployment.",
    canonical: "https://webutilitydesk.com/css-minifier/",
    ogTitle: "CSS Minifier",
    ogDescription: "Minify CSS locally in the browser and copy compact styles.",
    eyebrow: "Stylesheet optimization tool",
    heroTitle: "CSS Minifier",
    heroSummary: "Turn readable CSS into compact output locally, then copy it into your build, template, or deployment workflow.",
    toolHtml: `<div class="field-group">
              <label for="css-input">CSS input</label>
              <textarea id="css-input" spellcheck="false" rows="12">.card {\n  padding: 1rem;\n  border: 1px solid #d9e4df;\n  color: #17211f;\n}\n\n.card h2 {\n  margin: 0 0 0.75rem;\n}</textarea>
            </div>
            <div class="action-row" aria-label="CSS minifier actions">
              <button class="primary-action" id="run-tool" type="button">Minify CSS</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy CSS</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Minified CSS</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="12" readonly></textarea>
            </div>
            <div class="scan-status">This minifier works best for standard stylesheet rules and small component styles.</div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "css-minify-guide",
        title: "Why CSS minification still matters for static sites.",
        paragraphs: [
          "CSS minification removes comments and extra whitespace so the stylesheet becomes lighter and quicker to ship. For static sites, that is a straightforward win because the asset is smaller without changing the visual output. It also makes build output cleaner when you are comparing versions or moving toward a more automated pipeline.",
          "The browser-based workflow is useful when you want to check the result quickly before you commit it. If you are cleaning up related content assets too, use the <a href=\"../html-minifier/\">HTML Minifier</a> for markup and the <a href=\"../javascript-minifier/\">JavaScript Minifier</a> for scripts.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "css-minify-examples",
        title: "Typical CSS optimization workflows.",
        cards: [
          { title: "Component styles", text: "Compact card, button, and layout rules before you publish them." },
          { title: "Landing pages", text: "Shrink a static page stylesheet without touching the design intent." },
          { title: "Code review", text: "Review readable CSS first, then minify it for the production bundle." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "css-minify-workflow",
        title: "Keep your stylesheet simple before minifying it.",
        paragraphs: [
          "If your CSS depends on complex preprocessing or build-time transforms, minify the compiled output rather than the source partials. That keeps the browser tool aligned with what actually ships. It is also a good practice when you want to compare the compact stylesheet with your HTML or JavaScript assets during a release review.",
          "Use the minifier as a final pass, not as a substitute for organized source files. Good selector names, sensible grouping, and a stable order are still important. The tool only reduces the extra space around the code you already wrote.",
        ],
      }),
      faqSection({
        id: "css-minify-faq",
        title: "CSS Minifier questions.",
        faq: [
          { q: "Does the minifier remove comments?", a: "Yes. Standard CSS comments are removed before the compact output is returned." },
          { q: "Does it keep quoted strings intact?", a: "Yes. The minifier keeps quoted string values intact while removing extra whitespace around them." },
          { q: "Is the minification browser-only?", a: "Yes. The stylesheet is minified locally in your browser." },
          { q: "Should I minify vendor-specific generated CSS?", a: "Use the tool on the compiled stylesheet you actually ship, not on source partials that still need preprocessing." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../html-minifier/", label: "HTML Minifier" },
        { href: "../javascript-minifier/", label: "JavaScript Minifier" },
        { href: "../color-converter/", label: "Color Converter" },
        { href: "../case-converter/", label: "Case Converter" },
      ]),
    ],
    faq: [
      { q: "Does the minifier remove comments?", a: "Yes. Standard CSS comments are removed before the compact output is returned." },
      { q: "Does it keep quoted strings intact?", a: "Yes. The minifier keeps quoted string values intact while removing extra whitespace around them." },
      { q: "Is the minification browser-only?", a: "Yes. The stylesheet is minified locally in your browser." },
      { q: "Should I minify vendor-specific generated CSS?", a: "Use the tool on the compiled stylesheet you actually ship, not on source partials that still need preprocessing." },
    ],
    script: `const inputEl=document.querySelector("#css-input"),outputEl=document.querySelector("#tool-output"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},run=()=>{try{outputEl.value=GrowthTools.minifyCss(inputEl.value);setStatus("Minified")}catch(error){setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{inputEl.value='.card {\\n  padding: 1rem;\\n  border: 1px solid #d9e4df;\\n  color: #17211f;\\n}\\n\\n.card h2 {\\n  margin: 0 0 0.75rem;\\n}';run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{inputEl.value='';outputEl.value='';setStatus('Ready')});inputEl.addEventListener("input",run);run();`,
  },
  {
    slug: "javascript-minifier",
    name: "JavaScript Minifier",
    title: "JavaScript Minifier | Web Utility Desk",
    description: "Shrink simple JavaScript snippets in the browser with a practical minification workflow and examples.",
    canonical: "https://webutilitydesk.com/javascript-minifier/",
    ogTitle: "JavaScript Minifier",
    ogDescription: "Minify simple JavaScript snippets in the browser and copy compact output.",
    eyebrow: "Script optimization tool",
    heroTitle: "JavaScript Minifier",
    heroSummary: "Shrink simple JavaScript snippets locally before you paste them into a bundle, template, or deployment step.",
    toolHtml: `<div class="field-group">
              <label for="js-input">JavaScript input</label>
              <textarea id="js-input" spellcheck="false" rows="12">const greet = (name) => {\n  // Keep the greeting readable\n  return ` + "`Hello, ${name}!`" + `;\n};\n\nconsole.log(greet("Web Utility Desk"));</textarea>
            </div>
            <div class="action-row" aria-label="JavaScript minifier actions">
              <button class="primary-action" id="run-tool" type="button">Minify JS</button>
              <button class="secondary-action" id="secondary-tool" type="button">Use Sample</button>
              <button class="secondary-action" id="copy-output" type="button">Copy JS</button>
              <button class="ghost-action" id="clear-tool" type="button">Clear</button>
            </div>
            <div class="field-group output-group">
              <div class="output-header">
                <label for="tool-output">Minified JavaScript</label>
                <span id="tool-status" role="status" aria-live="polite">Ready</span>
              </div>
              <textarea id="tool-output" spellcheck="false" rows="12" readonly></textarea>
            </div>
            <div class="scan-status">Best for simple browser snippets, small utility functions, and quick deployment checks.</div>`,
    sections: [
      articleSection({
        eyebrow: "Guide",
        id: "js-minify-guide",
        title: "Why a browser-side JavaScript minifier still helps.",
        paragraphs: [
          "JavaScript minification is usually handled by a build tool, but there are still plenty of cases where a quick browser-side minifier is useful. You might be cleaning up a small snippet, checking a script before you paste it into a template, or comparing the compact version with a readable one during a static-site workflow.",
          "This tool is intentionally conservative. It is best for simple functions, snippets, and helper code. For related cleanup, pair it with the <a href=\"../html-minifier/\">HTML Minifier</a> and <a href=\"../css-minifier/\">CSS Minifier</a> so the whole page bundle stays tidy.",
        ],
      }),
      gridSection({
        eyebrow: "Examples",
        id: "js-minify-examples",
        title: "Common JavaScript minification workflows.",
        cards: [
          { title: "Snippets", text: "Compact quick utility functions before you paste them into a CMS or template." },
          { title: "Small widgets", text: "Shrink helper code for static forms, banners, and embed scripts." },
          { title: "Comparison", text: "See the readable source and the compact output side by side during review." },
        ],
      }),
      articleSection({
        eyebrow: "Workflow",
        id: "js-minify-workflow",
        title: "Use the output carefully for production scripts.",
        paragraphs: [
          "The page is designed to help with small, understandable snippets rather than complex frameworks or code that relies on advanced parsing. If you are minifying application bundles, let your build pipeline handle the final pass. The browser tool is most useful as a quick check or an educational utility.",
          "When the script needs to work alongside HTML and CSS, treat all three asset types as a coordinated set. The cleaner the surrounding markup and styles, the easier it is to see whether a script change is worth shipping or whether you should simplify the feature first.",
        ],
      }),
      faqSection({
        id: "js-minify-faq",
        title: "JavaScript Minifier questions.",
        faq: [
          { q: "Is this a full build-tool replacement?", a: "No. It is a practical browser-side minifier for small scripts and snippets." },
          { q: "Does it remove comments?", a: "Yes. It removes standard comments while keeping strings and template literals intact." },
          { q: "Is the minification browser-only?", a: "Yes. The snippet is minified locally in your browser." },
          { q: "What should I use for large bundles?", a: "Use your normal build pipeline for large or framework-generated bundles." },
        ],
      }),
      relatedSection("Continue with another developer utility.", [
        { href: "../html-minifier/", label: "HTML Minifier" },
        { href: "../css-minifier/", label: "CSS Minifier" },
        { href: "../regex-tester/", label: "Regex Tester" },
        { href: "../json-formatter/", label: "JSON Formatter" },
      ]),
    ],
    faq: [
      { q: "Is this a full build-tool replacement?", a: "No. It is a practical browser-side minifier for small scripts and snippets." },
      { q: "Does it remove comments?", a: "Yes. It removes standard comments while keeping strings and template literals intact." },
      { q: "Is the minification browser-only?", a: "Yes. The snippet is minified locally in your browser." },
      { q: "What should I use for large bundles?", a: "Use your normal build pipeline for large or framework-generated bundles." },
    ],
    script: `const inputEl=document.querySelector("#js-input"),outputEl=document.querySelector("#tool-output"),statusEl=document.querySelector("#tool-status"),setStatus=(message,isError=false)=>{statusEl.textContent=message;statusEl.classList.toggle("is-error",isError)},run=()=>{try{outputEl.value=GrowthTools.minifyJs(inputEl.value);setStatus("Minified")}catch(error){setStatus(error.message,true)}};document.querySelector("#run-tool").addEventListener("click",run);document.querySelector("#secondary-tool").addEventListener("click",()=>{inputEl.value='const greet = (name) => {\\n  // Keep the greeting readable\\n  return "Hello, " + name + "!";\\n};\\n\\nconsole.log(greet("Web Utility Desk"));';run()});document.querySelector("#copy-output").addEventListener("click",()=>GrowthTools.copyText(outputEl.value).then(()=>setStatus("Copied to clipboard")));document.querySelector("#clear-tool").addEventListener("click",()=>{inputEl.value='';outputEl.value='';setStatus('Ready')});inputEl.addEventListener("input",run);run();`,
  },
];
for (const page of pages) {
  writePage(page.slug, page);
}
