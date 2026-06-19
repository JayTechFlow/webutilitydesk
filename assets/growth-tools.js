(function () {
  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function countWords(text) {
    const trimmed = String(text).trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }

  function countCharacters(text) {
    return [...String(text)].length;
  }

  function reverseText(text, mode) {
    const value = String(text);
    if (mode === "words") {
      return value.split(/(\s+)/).reverse().join("").trim();
    }
    if (mode === "lines") {
      return value.split(/\r?\n/).reverse().join("\n");
    }
    return [...value].reverse().join("");
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function parseDelimitedRows(text, delimiter = ",") {
    const source = String(text).replace(/\r\n?/g, "\n");
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];

      if (inQuotes) {
        if (char === '"') {
          if (next === '"') {
            cell += '"';
            index += 1;
          } else {
            inQuotes = false;
          }
        } else {
          cell += char;
        }
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        continue;
      }

      if (char === delimiter) {
        row.push(cell);
        cell = "";
        continue;
      }

      if (char === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
        continue;
      }

      cell += char;
    }

    row.push(cell);
    rows.push(row);

    return rows.filter((currentRow) => currentRow.length > 1 || currentRow[0].trim() !== "");
  }

  function csvToJson(text, options = {}) {
    const useHeaders = options.useHeaders !== false;
    const rows = parseDelimitedRows(text);

    if (!rows.length) {
      throw new Error("Paste CSV data first.");
    }

    if (!useHeaders) {
      return {
        records: rows,
        json: JSON.stringify(rows, null, 2),
        rowCount: rows.length,
        columnCount: Math.max(...rows.map((row) => row.length)),
      };
    }

    const headers = rows.shift().map((header, index) => header.trim() || `column_${index + 1}`);
    const records = rows.map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? "";
      });
      return record;
    });

    return {
      headers,
      records,
      json: JSON.stringify(records, null, 2),
      rowCount: records.length,
      columnCount: headers.length,
    };
  }

  function buildRegexPattern({ input, mode, ignoreCase = true, multiline = false, dotAll = false }) {
    const value = String(input).trim();
    const escaped = escapeRegex(value);
    const presets = {
      exact: `^${escaped}$`,
      contains: escaped,
      startsWith: `^${escaped}`,
      endsWith: `${escaped}$`,
      wholeWord: `\\b${escaped}\\b`,
      digits: "^\\d+$",
      letters: "^[A-Za-z]+$",
      email: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      url: "^(https?:\\/\\/)?[\\w.-]+(?:\\.[\\w.-]+)+(?:[\\/?#][^\\s]*)?$",
      slug: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    };

    const source = presets[mode] || escaped;
    const flags = `${ignoreCase ? "i" : ""}${multiline ? "m" : ""}${dotAll ? "s" : ""}${mode === "contains" ? "g" : ""}`;

    return {
      source,
      flags,
      literal: `/${source}/${flags || "g"}`,
      explanation:
        mode === "digits"
          ? "Matches only digits from start to finish."
          : mode === "letters"
            ? "Matches only letters from start to finish."
            : mode === "email"
              ? "Matches a common email shape."
              : mode === "url"
                ? "Matches a common URL shape."
                : mode === "slug"
                  ? "Matches a simple SEO-friendly slug."
                  : mode === "wholeWord"
                    ? "Wraps the sample in word boundaries."
                    : `Builds a ${mode.replace(/([A-Z])/g, " $1").toLowerCase()} regex from the sample text.`,
    };
  }

  function compareJsonValues(left, right, path, differences) {
    if (Array.isArray(left) && Array.isArray(right)) {
      const maxLength = Math.max(left.length, right.length);
      for (let index = 0; index < maxLength; index += 1) {
        const nextPath = `${path}[${index}]`;
        if (index >= left.length) {
          differences.push({ path: nextPath, type: "added", left: undefined, right: right[index] });
          continue;
        }
        if (index >= right.length) {
          differences.push({ path: nextPath, type: "removed", left: left[index], right: undefined });
          continue;
        }
        compareJsonValues(left[index], right[index], nextPath, differences);
      }
      return;
    }

    if (isPlainObject(left) && isPlainObject(right)) {
      const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
      keys.forEach((key) => {
        const nextPath = path === "$" ? `$.${key}` : `${path}.${key}`;
        if (!(key in left)) {
          differences.push({ path: nextPath, type: "added", left: undefined, right: right[key] });
          return;
        }
        if (!(key in right)) {
          differences.push({ path: nextPath, type: "removed", left: left[key], right: undefined });
          return;
        }
        compareJsonValues(left[key], right[key], nextPath, differences);
      });
      return;
    }

    if (!isDeepEqual(left, right)) {
      differences.push({ path, type: "changed", left, right });
    }
  }

  function compareJsonText(leftText, rightText) {
    const left = JSON.parse(leftText);
    const right = JSON.parse(rightText);
    const differences = [];
    compareJsonValues(left, right, "$", differences);

    return {
      left,
      right,
      leftPretty: JSON.stringify(left, null, 2),
      rightPretty: JSON.stringify(right, null, 2),
      differences,
      summary:
        differences.length === 0
          ? "The JSON documents match."
          : `${differences.length} difference${differences.length === 1 ? "" : "s"} found.`,
    };
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isDeepEqual(left, right) {
    if (Object.is(left, right)) {
      return true;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      return left.length === right.length && left.every((item, index) => isDeepEqual(item, right[index]));
    }

    if (isPlainObject(left) && isPlainObject(right)) {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      return (
        leftKeys.length === rightKeys.length &&
        leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && isDeepEqual(left[key], right[key]))
      );
    }

    return false;
  }

  function maskTokens(text, pattern) {
    const values = [];
    const masked = String(text).replace(pattern, (match) => {
      values.push(match);
      return `__MASK_${values.length - 1}__`;
    });
    return {
      masked,
      restore(value) {
        return values.reduce((result, token, index) => result.replaceAll(`__MASK_${index}__`, token), value);
      },
    };
  }

  function formatSql(sql) {
    const source = String(sql).replace(/\r\n?/g, "\n").trim();
    if (!source) {
      return "";
    }

    const preserved = maskTokens(
      source,
      /'(?:''|[^'])*'|"(?:["]|[^"])*"|`(?:``|[^`])*`|\[(?:[^\]]|\]\])*\]|--[^\n]*|\/\*[\s\S]*?\*\//g,
    );

    const keywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "GROUP BY",
      "HAVING",
      "ORDER BY",
      "LIMIT",
      "OFFSET",
      "JOIN",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "CROSS JOIN",
      "OUTER JOIN",
      "ON",
      "UNION ALL",
      "UNION",
      "INSERT INTO",
      "VALUES",
      "UPDATE",
      "SET",
      "DELETE FROM",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
      "AND",
      "OR",
      "AS",
    ];

    let text = preserved.masked.replace(/\s+/g, " ").trim();
    text = text.replace(/\b(group by|order by|inner join|left join|right join|full join|cross join|outer join|union all|insert into|delete from)\b/gi, (match) => match.toUpperCase());
    keywords
      .slice()
      .sort((a, b) => b.length - a.length)
      .forEach((keyword) => {
        const pattern = new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "gi");
        text = text.replace(pattern, (match) => `\n${match.toUpperCase()}`);
      });

    text = text.replace(/,\s*/g, ",\n  ");
    text = text.replace(/\s*\(\s*/g, " (\n  ");
    text = text.replace(/\s*\)\s*/g, "\n)");

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let indent = 0;
    const formatted = lines.map((line) => {
      if (/^\)/.test(line) || /^(ELSE|WHEN|THEN|AND|OR|ON)\b/i.test(line)) {
        indent = Math.max(indent - 1, 0);
      }

      const current = `${"  ".repeat(indent)}${line}`;

      if (/\($/.test(line) || /^(SELECT|CASE|WHEN|THEN|ELSE|UNION(?: ALL)?|INSERT INTO|UPDATE|DELETE FROM)\b/i.test(line)) {
        indent += 1;
      }

      if (/^END\b/i.test(line)) {
        indent = Math.max(indent - 1, 0);
      }

      return current;
    });

    return preserved.restore(
      formatted
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\s+([,;])/g, "$1"),
    );
  }

  function minifyHtml(html) {
    const source = String(html).replace(/\r\n?/g, "\n").trim();
    if (!source) {
      return "";
    }

    const preserved = maskTokens(source, /<(script|style|pre|textarea|code)\b[\s\S]*?<\/\1>/gi);
    const minified = preserved.masked
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .replace(/\n+/g, "")
      .trim();

    return preserved.restore(minified);
  }

  function minifyCss(css) {
    const source = String(css).replace(/\r\n?/g, "\n");
    let output = "";
    let inString = null;
    let escaped = false;
    let inComment = false;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];

      if (inComment) {
        if (char === "*" && next === "/") {
          inComment = false;
          index += 1;
        }
        continue;
      }

      if (inString) {
        output += char;
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === inString) {
          inString = null;
        }
        continue;
      }

      if (char === "/" && next === "*") {
        inComment = true;
        index += 1;
        continue;
      }

      if (char === "'" || char === '"') {
        inString = char;
        output += char;
        continue;
      }

      if (/\s/.test(char)) {
        const last = output[output.length - 1];
        const remaining = source.slice(index + 1).match(/\S/);
        const nextChar = remaining ? remaining[0] : "";
        if (last && /[A-Za-z0-9_\)\]]/.test(last) && nextChar && /[A-Za-z0-9_\(\[#.]/.test(nextChar)) {
          output += " ";
        }
        continue;
      }

      if ("{}:;,>+~".includes(char)) {
        output = output.replace(/\s+$/g, "");
        output += char;
        while (source[index + 1] && /\s/.test(source[index + 1])) {
          index += 1;
        }
        continue;
      }

      output += char;
    }

    return output
      .replace(/;}/g, "}")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function minifyJs(js) {
    const source = String(js).replace(/\r\n?/g, "\n");
    let output = "";
    let inString = null;
    let inTemplate = false;
    let escaped = false;
    let inBlockComment = false;
    let inLineComment = false;
    let previousNonSpace = "";

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];

      if (inBlockComment) {
        if (char === "*" && next === "/") {
          inBlockComment = false;
          index += 1;
        }
        continue;
      }

      if (inLineComment) {
        if (char === "\n") {
          inLineComment = false;
          output += "\n";
        }
        continue;
      }

      if (inString) {
        output += char;
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === inString) {
          inString = null;
        }
        continue;
      }

      if (inTemplate) {
        output += char;
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === "`") {
          inTemplate = false;
        }
        continue;
      }

      if (char === "/" && next === "*") {
        inBlockComment = true;
        index += 1;
        continue;
      }

      if (char === "/" && next === "/" && /[\s({[;,=:+\-*!?]/.test(previousNonSpace || " ")) {
        inLineComment = true;
        index += 1;
        continue;
      }

      if (char === "'" || char === '"') {
        inString = char;
        output += char;
        previousNonSpace = char;
        continue;
      }

      if (char === "`") {
        inTemplate = true;
        output += char;
        previousNonSpace = char;
        continue;
      }

      if (/\s/.test(char)) {
        const last = output[output.length - 1];
        const nextNonSpace = source.slice(index + 1).match(/\S/);
        if (last && /[A-Za-z0-9_$)\]]/.test(last) && nextNonSpace && /[A-Za-z0-9_$([{]/.test(nextNonSpace[0])) {
          output += " ";
        }
        continue;
      }

      output += char;
      previousNonSpace = char;
    }

    return output
      .replace(/\s*([=+\-*/%<>?:;,{}()[\]])\s*/g, "$1")
      .replace(/;}/g, "}")
      .replace(/\n{2,}/g, "\n")
      .trim();
  }

  function generateRandomNumbers({ min, max, count, integerOnly = true }) {
    const start = Number(min);
    const end = Number(max);
    const total = Number(count);

    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(total)) {
      throw new Error("Enter valid numeric values.");
    }

    if (end < start) {
      throw new Error("Max must be greater than or equal to min.");
    }

    const values = [];
    for (let index = 0; index < Math.min(Math.max(total, 1), 100); index += 1) {
      const value = start + Math.random() * (end - start);
      values.push(integerOnly ? Math.floor(value) : Number(value.toFixed(4)));
    }

    return values.join("\n");
  }

  function encodeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  function decodeHtml(text) {
    const div = document.createElement("div");
    div.innerHTML = String(text);
    return div.textContent || "";
  }

  function parseColorInput(input) {
    const value = String(input).trim();
    if (!value) return null;

    const probe = document.createElement("span");
    probe.style.color = value;
    probe.style.display = "none";
    document.body.appendChild(probe);

    const computed = getComputedStyle(probe).color;
    probe.remove();

    const match = computed.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
    if (!match) return null;

    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    const a = match[4] ? Number(match[4]) : 1;

    const hex = `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let hue = 0;
    let saturation = 0;
    const lightness = (max + min) / 2 / 255;

    if (delta !== 0) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1) || 1);
      if (max === r) hue = ((g - b) / delta) % 6;
      else if (max === g) hue = (b - r) / delta + 2;
      else hue = (r - g) / delta + 4;
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;
    }

    return {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
      hsl: `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`,
    };
  }

  function parseUrlInput(input) {
    const value = String(input).trim();
    if (!value) return null;

    const target = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value) ? value : `https://${value}`;
    const url = new URL(target);

    return {
      href: url.href,
      origin: url.origin,
      protocol: url.protocol,
      username: url.username,
      password: url.password,
      host: url.host,
      hostname: url.hostname,
      port: url.port || "(default)",
      pathname: url.pathname,
      search: url.search || "(none)",
      hash: url.hash || "(none)",
      params: Array.from(url.searchParams.entries()),
    };
  }

  function advancedQrSvg(text, options = {}) {
    if (typeof window.createQrSvg !== "function") {
      throw new Error("QR generation is not available.");
    }

    const size = Math.min(Math.max(Number(options.size) || 360, 220), 1200);
    const fg = options.foreground || "#17211f";
    const bg = options.background || "#ffffff";
    return window
      .createQrSvg(String(text))
      .replaceAll('fill="#ffffff"', `fill="${bg}"`)
      .replaceAll('fill="#17211f"', `fill="${fg}"`)
      .replace(
        /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 ([0-9]+) ([0-9]+)" role="img" aria-label="Generated QR code">/,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 $1 $2" width="${size}" height="${size}" role="img" aria-label="Generated QR code">`,
      );
  }

  function md5Hex(str) {
    const input = new TextEncoder().encode(String(str));
    const words = [];
    for (let index = 0; index < input.length; index += 1) {
      words[index >> 2] |= input[index] << ((index % 4) * 8);
    }
    words[input.length >> 2] |= 0x80 << ((input.length % 4) * 8);
    const bitLength = input.length * 8;
    words[((input.length + 8) >> 6) * 16 + 14] = bitLength & 0xffffffff;
    words[((input.length + 8) >> 6) * 16 + 15] = Math.floor(bitLength / 0x100000000);

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    function add(x, y) {
      return (x + y) & 0xffffffff;
    }
    function rotate(x, s) {
      return (x << s) | (x >>> (32 - s));
    }
    function cmn(q, a1, b1, x, s, t) {
      return add(rotate(add(add(a1, q), add(x, t)), s), b1);
    }
    function ff(a1, b1, c1, d1, x, s, t) {
      return cmn((b1 & c1) | (~b1 & d1), a1, b1, x, s, t);
    }
    function gg(a1, b1, c1, d1, x, s, t) {
      return cmn((b1 & d1) | (c1 & ~d1), a1, b1, x, s, t);
    }
    function hh(a1, b1, c1, d1, x, s, t) {
      return cmn(b1 ^ c1 ^ d1, a1, b1, x, s, t);
    }
    function ii(a1, b1, c1, d1, x, s, t) {
      return cmn(c1 ^ (b1 | ~d1), a1, b1, x, s, t);
    }

    for (let index = 0; index < words.length; index += 16) {
      const oa = a;
      const ob = b;
      const oc = c;
      const od = d;

      a = ff(a, b, c, d, words[index + 0] || 0, 7, -680876936);
      d = ff(d, a, b, c, words[index + 1] || 0, 12, -389564586);
      c = ff(c, d, a, b, words[index + 2] || 0, 17, 606105819);
      b = ff(b, c, d, a, words[index + 3] || 0, 22, -1044525330);
      a = ff(a, b, c, d, words[index + 4] || 0, 7, -176418897);
      d = ff(d, a, b, c, words[index + 5] || 0, 12, 1200080426);
      c = ff(c, d, a, b, words[index + 6] || 0, 17, -1473231341);
      b = ff(b, c, d, a, words[index + 7] || 0, 22, -45705983);
      a = ff(a, b, c, d, words[index + 8] || 0, 7, 1770035416);
      d = ff(d, a, b, c, words[index + 9] || 0, 12, -1958414417);
      c = ff(c, d, a, b, words[index + 10] || 0, 17, -42063);
      b = ff(b, c, d, a, words[index + 11] || 0, 22, -1990404162);
      a = ff(a, b, c, d, words[index + 12] || 0, 7, 1804603682);
      d = ff(d, a, b, c, words[index + 13] || 0, 12, -40341101);
      c = ff(c, d, a, b, words[index + 14] || 0, 17, -1502002290);
      b = ff(b, c, d, a, words[index + 15] || 0, 22, 1236535329);

      a = gg(a, b, c, d, words[index + 1] || 0, 5, -165796510);
      d = gg(d, a, b, c, words[index + 6] || 0, 9, -1069501632);
      c = gg(c, d, a, b, words[index + 11] || 0, 14, 643717713);
      b = gg(b, c, d, a, words[index + 0] || 0, 20, -373897302);
      a = gg(a, b, c, d, words[index + 5] || 0, 5, -701558691);
      d = gg(d, a, b, c, words[index + 10] || 0, 9, 38016083);
      c = gg(c, d, a, b, words[index + 15] || 0, 14, -660478335);
      b = gg(b, c, d, a, words[index + 4] || 0, 20, -405537848);
      a = gg(a, b, c, d, words[index + 9] || 0, 5, 568446438);
      d = gg(d, a, b, c, words[index + 14] || 0, 9, -1019803690);
      c = gg(c, d, a, b, words[index + 3] || 0, 14, -187363961);
      b = gg(b, c, d, a, words[index + 8] || 0, 20, 1163531501);
      a = gg(a, b, c, d, words[index + 13] || 0, 5, -1444681467);
      d = gg(d, a, b, c, words[index + 2] || 0, 9, -51403784);
      c = gg(c, d, a, b, words[index + 7] || 0, 14, 1735328473);
      b = gg(b, c, d, a, words[index + 12] || 0, 20, -1926607734);

      a = hh(a, b, c, d, words[index + 5] || 0, 4, -378558);
      d = hh(d, a, b, c, words[index + 8] || 0, 11, -2022574463);
      c = hh(c, d, a, b, words[index + 11] || 0, 16, 1839030562);
      b = hh(b, c, d, a, words[index + 14] || 0, 23, -35309556);
      a = hh(a, b, c, d, words[index + 1] || 0, 4, -1530992060);
      d = hh(d, a, b, c, words[index + 4] || 0, 11, 1272893353);
      c = hh(c, d, a, b, words[index + 7] || 0, 16, -155497632);
      b = hh(b, c, d, a, words[index + 10] || 0, 23, -1094730640);
      a = hh(a, b, c, d, words[index + 13] || 0, 4, 681279174);
      d = hh(d, a, b, c, words[index + 0] || 0, 11, -358537222);
      c = hh(c, d, a, b, words[index + 3] || 0, 16, -722521979);
      b = hh(b, c, d, a, words[index + 6] || 0, 23, 76029189);
      a = hh(a, b, c, d, words[index + 9] || 0, 4, -640364487);
      d = hh(d, a, b, c, words[index + 12] || 0, 11, -421815835);
      c = hh(c, d, a, b, words[index + 15] || 0, 16, 530742520);
      b = hh(b, c, d, a, words[index + 2] || 0, 23, -995338651);

      a = ii(a, b, c, d, words[index + 0] || 0, 6, -198630844);
      d = ii(d, a, b, c, words[index + 7] || 0, 10, 1126891415);
      c = ii(c, d, a, b, words[index + 14] || 0, 15, -1416354905);
      b = ii(b, c, d, a, words[index + 5] || 0, 21, -57434055);
      a = ii(a, b, c, d, words[index + 12] || 0, 6, 1700485571);
      d = ii(d, a, b, c, words[index + 3] || 0, 10, -1894986606);
      c = ii(c, d, a, b, words[index + 10] || 0, 15, -1051523);
      b = ii(b, c, d, a, words[index + 1] || 0, 21, -2054922799);
      a = ii(a, b, c, d, words[index + 8] || 0, 6, 1873313359);
      d = ii(d, a, b, c, words[index + 15] || 0, 10, -30611744);
      c = ii(c, d, a, b, words[index + 6] || 0, 15, -1560198380);
      b = ii(b, c, d, a, words[index + 13] || 0, 21, 1309151649);
      a = ii(a, b, c, d, words[index + 4] || 0, 6, -145523070);
      d = ii(d, a, b, c, words[index + 11] || 0, 10, -1120210379);
      c = ii(c, d, a, b, words[index + 2] || 0, 15, 718787259);
      b = ii(b, c, d, a, words[index + 9] || 0, 21, -343485551);

      a = add(a, oa);
      b = add(b, ob);
      c = add(c, oc);
      d = add(d, od);
    }

    function toHex(value) {
      const unsigned = value >>> 0;
      return [0, 8, 16, 24]
        .map((shift) => ((unsigned >>> shift) & 0xff).toString(16).padStart(2, "0"))
        .join("");
    }

    return `${toHex(a)}${toHex(b)}${toHex(c)}${toHex(d)}`;
  }

  async function sha256Hex(str) {
    const bytes = new TextEncoder().encode(String(str));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  window.GrowthTools = {
    copyText,
    escapeHtml,
    countWords,
    countCharacters,
    reverseText,
    escapeRegex,
    parseDelimitedRows,
    csvToJson,
    buildRegexPattern,
    compareJsonText,
    formatSql,
    minifyHtml,
    minifyCss,
    minifyJs,
    generateRandomNumbers,
    encodeHtml,
    decodeHtml,
    parseColorInput,
    parseUrlInput,
    advancedQrSvg,
    md5Hex,
    sha256Hex,
  };
})();
