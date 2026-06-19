const tools = {
  json: {
    inputLabel: "JSON input",
    outputLabel: "Formatted JSON",
    primary: "Format JSON",
    secondary: "Minify",
    placeholder: '{ "name": "Web Utility Desk", "type": "utility platform" }',
    run(input) {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    },
    secondaryRun(input) {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    },
  },
  "json-validator": {
    inputLabel: "JSON input",
    outputLabel: "Validation result",
    primary: "Validate JSON",
    secondary: "Format Valid JSON",
    placeholder: '{ "status": "ready", "items": [1, 2, 3] }',
    run(input) {
      const parsed = JSON.parse(input);
      return describeJson(parsed);
    },
    secondaryRun(input) {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    },
  },
  base64: {
    inputLabel: "Text input",
    outputLabel: "Base64 result",
    primary: "Encode",
    secondary: "Decode",
    placeholder: "Web Utility Desk",
    run(input) {
      return encodeBase64(input);
    },
    secondaryRun(input) {
      return decodeBase64(input);
    },
  },
  url: {
    inputLabel: "URL or text input",
    outputLabel: "URL result",
    primary: "Encode URL",
    secondary: "Decode URL",
    placeholder: "https://webutilitydesk.com/tools?q=json formatter",
    run(input) {
      return encodeURIComponent(input);
    },
    secondaryRun(input) {
      return decodeURIComponent(input);
    },
  },
  uuid: {
    inputLabel: "Number of UUIDs",
    outputLabel: "Generated UUIDs",
    primary: "Generate UUID",
    secondary: "Generate 5",
    placeholder: "1",
    run(input) {
      const count = normalizeCount(input, 1);
      return Array.from({ length: count }, createUuid).join("\n");
    },
    secondaryRun() {
      return Array.from({ length: 5 }, createUuid).join("\n");
    },
  },
  password: {
    inputLabel: "Password length",
    outputLabel: "Generated password",
    primary: "Generate Password",
    secondary: "Generate 5",
    placeholder: "20",
    run(input) {
      return createPassword(normalizePasswordLength(input, 20));
    },
    secondaryRun(input) {
      const length = normalizePasswordLength(input, 20);
      return Array.from({ length: 5 }, () => createPassword(length)).join("\n");
    },
  },
  hash: {
    inputLabel: "Text input",
    outputLabel: "Hash result",
    primary: "Generate SHA-256",
    secondary: "Generate SHA-512",
    placeholder: "Web Utility Desk",
    run(input) {
      return createHash(input, "SHA-256");
    },
    secondaryRun(input) {
      return createHash(input, "SHA-512");
    },
  },
  jwt: {
    inputLabel: "JWT input",
    outputLabel: "Decoded JWT",
    primary: "Decode JWT",
    secondary: "Decode Payload Only",
    placeholder:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldlYiBVdGlsaXR5IERlc2siLCJpYXQiOjE3MTg3MTIwMDB9.signature",
    run(input) {
      return decodeJwt(input);
    },
    secondaryRun(input) {
      return decodeJwt(input, true);
    },
  },
  timestamp: {
    inputLabel: "Unix timestamp or date",
    outputLabel: "Converted time",
    primary: "Convert",
    secondary: "Use Current Time",
    placeholder: "1718712000",
    run(input) {
      const value = input.trim();
      const numeric = Number(value);
      const date = Number.isFinite(numeric)
        ? new Date(numeric.toString().length <= 10 ? numeric * 1000 : numeric)
        : new Date(value);

      if (Number.isNaN(date.getTime())) {
        throw new Error("Enter a valid Unix timestamp or date.");
      }

      return [
        `Local: ${date.toString()}`,
        `UTC: ${date.toUTCString()}`,
        `ISO: ${date.toISOString()}`,
        `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
        `Unix milliseconds: ${date.getTime()}`,
      ].join("\n");
    },
    secondaryRun() {
      return this.run(String(Date.now()));
    },
  },
  qr: {
    inputLabel: "Text or URL",
    outputLabel: "QR code SVG",
    primary: "Generate QR Code",
    secondary: "Use Current Page",
    placeholder: "https://webutilitydesk.com",
    run(input) {
      return createQrSvg(input);
    },
    secondaryRun() {
      return createQrSvg(window.location.href);
    },
  },
  slug: {
    inputLabel: "Title or phrase",
    outputLabel: "URL slug",
    primary: "Generate Slug",
    secondary: "Lowercase Text",
    placeholder: "Free Web Utility Tools for Developers",
    run(input) {
      return input
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },
    secondaryRun(input) {
      return input.toLowerCase();
    },
  },
};

const toolPanel = document.querySelector("[data-default-tool]");
const input = document.querySelector("#tool-input");
const output = document.querySelector("#tool-output");
const inputLabel = document.querySelector("#input-label");
const outputLabel = document.querySelector("#output-label");
const runButton = document.querySelector("#run-tool");
const secondaryButton = document.querySelector("#secondary-tool");
const copyButton = document.querySelector("#copy-output");
const clearButton = document.querySelector("#clear-tool");
const statusText = document.querySelector("#tool-status");
const tabs = Array.from(document.querySelectorAll(".tool-tab"));
const searchInput = document.querySelector("#tool-search");
const toolCards = Array.from(document.querySelectorAll(".tool-card"));

let activeTool = toolPanel?.dataset.defaultTool || "json";

function normalizeCount(value, fallback) {
  const count = Number.parseInt(value, 10);
  if (!Number.isFinite(count)) return fallback;
  return Math.min(Math.max(count, 1), 50);
}

function normalizePasswordLength(value, fallback) {
  const length = Number.parseInt(value, 10);
  if (!Number.isFinite(length)) return fallback;
  return Math.min(Math.max(length, 8), 128);
}

function createUuid() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) => {
    const random = window.crypto.getRandomValues(new Uint8Array(1))[0];
    return (Number(char) ^ (random & (15 >> (Number(char) / 4)))).toString(16);
  });
}

function createPassword(length) {
  const normalizedLength = Math.min(Math.max(length, 8), 128);
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%^&*()-_=+[]{};:,.?",
  ];
  const allCharacters = groups.join("");
  const required = groups.map((group) => randomCharacter(group));
  const remaining = Array.from({ length: normalizedLength - required.length }, () =>
    randomCharacter(allCharacters),
  );

  return shuffleCharacters([...required, ...remaining]).join("");
}

function randomCharacter(characters) {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return characters[values[0] % characters.length];
}

function shuffleCharacters(characters) {
  const values = new Uint32Array(characters.length);
  window.crypto.getRandomValues(values);

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const randomIndex = values[index] % (index + 1);
    [characters[index], characters[randomIndex]] = [characters[randomIndex], characters[index]];
  }

  return characters;
}

function describeJson(parsed) {
  const type = Array.isArray(parsed) ? "array" : parsed === null ? "null" : typeof parsed;
  const details = [`Valid JSON`, `Type: ${type}`];

  if (Array.isArray(parsed)) {
    details.push(`Items: ${parsed.length}`);
  }

  if (type === "object") {
    details.push(`Keys: ${Object.keys(parsed).length}`);
  }

  return details.join("\n");
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function createHash(value, algorithm) {
  if (!window.crypto?.subtle) {
    throw new Error("Hashing requires a secure browser context.");
  }

  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest(algorithm, bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");

  return [`Algorithm: ${algorithm}`, `Input bytes: ${bytes.length}`, "", hex].join("\n");
}

function decodeBase64(value) {
  try {
    const binary = atob(value.trim().replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new Error("Enter valid Base64 text.");
  }
}

function decodeJwt(value, payloadOnly = false) {
  const parts = value.trim().split(".");

  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error("Enter a JWT with header and payload sections.");
  }

  const header = parseJsonText(decodeBase64Url(parts[0]), "JWT header");
  const payload = parseJsonText(decodeBase64Url(parts[1]), "JWT payload");

  if (payloadOnly) {
    return JSON.stringify(payload, null, 2);
  }

  return [
    "Header:",
    JSON.stringify(header, null, 2),
    "",
    "Payload:",
    JSON.stringify(payload, null, 2),
    "",
    "Signature verification: not performed by this decoder.",
  ].join("\n");
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseJsonText(value, label) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`);
  }
}

function createQrSvg(value) {
  const text = value.trim();

  if (!text) {
    throw new Error("Enter text or a URL to generate a QR code.");
  }

  const matrix = createQrMatrix(text);
  const margin = 4;
  const size = matrix.length + margin * 2;
  const paths = [];

  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        paths.push(`M${x + margin} ${y + margin}h1v1h-1z`);
      }
    });
  });

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Generated QR code">`,
    `<rect width="${size}" height="${size}" fill="#ffffff"/>`,
    `<path fill="#17211f" d="${paths.join("")}"/>`,
    `</svg>`,
  ].join("");

  renderQrPreview(svg);
  return svg;
}

function createQrMatrix(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const versions = [
    { version: 1, size: 21, dataCodewords: 19, eccCodewords: 7, alignment: [] },
    { version: 2, size: 25, dataCodewords: 34, eccCodewords: 10, alignment: [6, 18] },
    { version: 3, size: 29, dataCodewords: 55, eccCodewords: 15, alignment: [6, 22] },
    { version: 4, size: 33, dataCodewords: 80, eccCodewords: 20, alignment: [6, 26] },
  ];
  const config = versions.find((item) => bytes.length <= item.dataCodewords - 2);

  if (!config) {
    throw new Error("QR input is too long. Use 78 bytes or less.");
  }

  const data = buildQrData(bytes, config.dataCodewords);
  const ecc = createReedSolomonRemainder(data, config.eccCodewords);
  const codewords = [...data, ...ecc];
  const base = createBaseQrMatrix(config);
  const bitStream = codewords.flatMap((codeword) =>
    Array.from({ length: 8 }, (_, index) => ((codeword >>> (7 - index)) & 1) === 1),
  );
  const candidates = Array.from({ length: 8 }, (_, mask) => {
    const matrix = base.modules.map((row) => [...row]);
    placeQrData(matrix, base.reserved, bitStream, mask);
    drawFormatBits(matrix, base.reserved, mask);
    return { matrix, penalty: calculateQrPenalty(matrix) };
  });

  return candidates.reduce((best, item) => (item.penalty < best.penalty ? item : best)).matrix;
}

function buildQrData(bytes, dataCodewords) {
  const bits = [0, 1, 0, 0];
  pushBits(bits, bytes.length, 8);
  bytes.forEach((byte) => pushBits(bits, byte, 8));

  const maxBits = dataCodewords * 8;
  const terminatorLength = Math.min(4, maxBits - bits.length);
  pushBits(bits, 0, terminatorLength);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords = [];
  for (let index = 0; index < bits.length; index += 8) {
    codewords.push(Number.parseInt(bits.slice(index, index + 8).join(""), 2));
  }

  for (let pad = 0; codewords.length < dataCodewords; pad += 1) {
    codewords.push(pad % 2 === 0 ? 0xec : 0x11);
  }

  return codewords;
}

function pushBits(bits, value, length) {
  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push(((value >>> index) & 1) === 1 ? 1 : 0);
  }
}

function createBaseQrMatrix(config) {
  const modules = Array.from({ length: config.size }, () => Array(config.size).fill(false));
  const reserved = Array.from({ length: config.size }, () => Array(config.size).fill(false));

  drawFinderPattern(modules, reserved, 0, 0);
  drawFinderPattern(modules, reserved, config.size - 7, 0);
  drawFinderPattern(modules, reserved, 0, config.size - 7);
  drawTimingPatterns(modules, reserved);
  drawAlignmentPatterns(modules, reserved, config.alignment);
  setQrModule(modules, reserved, 8, config.size - 8, true);
  reserveFormatAreas(reserved, config.size);

  return { modules, reserved };
}

function drawFinderPattern(modules, reserved, x, y) {
  for (let row = -1; row <= 7; row += 1) {
    for (let col = -1; col <= 7; col += 1) {
      const targetX = x + col;
      const targetY = y + row;
      if (!isInsideQr(modules, targetX, targetY)) continue;

      const isFinder =
        col >= 0 &&
        col <= 6 &&
        row >= 0 &&
        row <= 6 &&
        (col === 0 || col === 6 || row === 0 || row === 6 || (col >= 2 && col <= 4 && row >= 2 && row <= 4));
      setQrModule(modules, reserved, targetX, targetY, isFinder);
    }
  }
}

function drawTimingPatterns(modules, reserved) {
  for (let index = 8; index < modules.length - 8; index += 1) {
    setQrModule(modules, reserved, index, 6, index % 2 === 0);
    setQrModule(modules, reserved, 6, index, index % 2 === 0);
  }
}

function drawAlignmentPatterns(modules, reserved, centers) {
  centers.forEach((centerY) => {
    centers.forEach((centerX) => {
      if (reserved[centerY][centerX]) return;

      for (let row = -2; row <= 2; row += 1) {
        for (let col = -2; col <= 2; col += 1) {
          setQrModule(modules, reserved, centerX + col, centerY + row, Math.max(Math.abs(row), Math.abs(col)) !== 1);
        }
      }
    });
  });
}

function reserveFormatAreas(reserved, size) {
  for (let index = 0; index <= 8; index += 1) {
    if (index !== 6) {
      reserved[8][index] = true;
      reserved[index][8] = true;
    }
  }

  for (let index = 0; index < 8; index += 1) {
    reserved[8][size - 1 - index] = true;
    reserved[size - 1 - index][8] = true;
  }
}

function placeQrData(matrix, reserved, bits, mask) {
  let bitIndex = 0;
  let upward = true;

  for (let right = matrix.length - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;

    for (let rowOffset = 0; rowOffset < matrix.length; rowOffset += 1) {
      const y = upward ? matrix.length - 1 - rowOffset : rowOffset;

      for (let colOffset = 0; colOffset < 2; colOffset += 1) {
        const x = right - colOffset;
        if (reserved[y][x]) continue;

        const bit = bitIndex < bits.length ? bits[bitIndex] : 0;
        matrix[y][x] = Boolean(bit) !== getQrMask(mask, x, y);
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
}

function drawFormatBits(matrix, reserved, mask) {
  const size = matrix.length;
  const data = (1 << 3) | mask;
  let bits = data << 10;

  for (let index = 14; index >= 10; index -= 1) {
    if (((bits >>> index) & 1) !== 0) {
      bits ^= 0x537 << (index - 10);
    }
  }

  bits = (((data << 10) | bits) ^ 0x5412) & 0x7fff;

  for (let index = 0; index <= 5; index += 1) setFormatModule(matrix, reserved, index, 8, bits, index);
  setFormatModule(matrix, reserved, 7, 8, bits, 6);
  setFormatModule(matrix, reserved, 8, 8, bits, 7);
  setFormatModule(matrix, reserved, 8, 7, bits, 8);
  for (let index = 9; index < 15; index += 1) setFormatModule(matrix, reserved, 8, 14 - index, bits, index);
  for (let index = 0; index < 8; index += 1) setFormatModule(matrix, reserved, size - 1 - index, 8, bits, index);
  for (let index = 8; index < 15; index += 1) setFormatModule(matrix, reserved, 8, size - 15 + index, bits, index);
}

function setFormatModule(matrix, reserved, x, y, bits, index) {
  matrix[y][x] = ((bits >>> index) & 1) !== 0;
  reserved[y][x] = true;
}

function getQrMask(mask, x, y) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function calculateQrPenalty(matrix) {
  let penalty = 0;
  const size = matrix.length;

  for (let y = 0; y < size; y += 1) {
    penalty += calculateRunPenalty(matrix[y]);
  }

  for (let x = 0; x < size; x += 1) {
    penalty += calculateRunPenalty(matrix.map((row) => row[x]));
  }

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const value = matrix[y][x];
      if (matrix[y][x + 1] === value && matrix[y + 1][x] === value && matrix[y + 1][x + 1] === value) {
        penalty += 3;
      }
    }
  }

  const darkCount = matrix.flat().filter(Boolean).length;
  penalty += Math.floor(Math.abs((darkCount * 20) / (size * size) - 10)) * 10;

  return penalty;
}

function calculateRunPenalty(values) {
  let penalty = 0;
  let runValue = values[0];
  let runLength = 1;

  for (let index = 1; index <= values.length; index += 1) {
    if (values[index] === runValue) {
      runLength += 1;
      continue;
    }

    if (runLength >= 5) {
      penalty += 3 + runLength - 5;
    }

    runValue = values[index];
    runLength = 1;
  }

  return penalty;
}

function createReedSolomonRemainder(data, degree) {
  const generator = createReedSolomonGenerator(degree);
  const result = Array(degree).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);

    generator.forEach((coefficient, index) => {
      result[index] ^= multiplyQrGalois(coefficient, factor);
    });
  });

  return result;
}

function createReedSolomonGenerator(degree) {
  const result = Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let index = 0; index < degree; index += 1) {
    for (let coefficientIndex = 0; coefficientIndex < degree; coefficientIndex += 1) {
      result[coefficientIndex] = multiplyQrGalois(result[coefficientIndex], root);

      if (coefficientIndex + 1 < degree) {
        result[coefficientIndex] ^= result[coefficientIndex + 1];
      }
    }

    root = multiplyQrGalois(root, 0x02);
  }

  return result;
}

function multiplyQrGalois(left, right) {
  let result = 0;

  for (; right > 0; right >>>= 1) {
    if ((right & 1) !== 0) result ^= left;
    left <<= 1;
    if ((left & 0x100) !== 0) left ^= 0x11d;
  }

  return result;
}

function setQrModule(modules, reserved, x, y, value) {
  if (!isInsideQr(modules, x, y)) return;
  modules[y][x] = value;
  reserved[y][x] = true;
}

function isInsideQr(modules, x, y) {
  return y >= 0 && y < modules.length && x >= 0 && x < modules.length;
}

function renderQrPreview(svg) {
  const preview = document.querySelector("#qr-preview");
  if (preview) {
    preview.innerHTML = svg;
  }
}

function setStatus(message, type = "normal") {
  if (!statusText) return;
  statusText.textContent = message;
  statusText.classList.toggle("is-error", type === "error");
}

function selectTool(toolName) {
  if (!tools[toolName] || !input || !output || !inputLabel || !outputLabel || !runButton || !secondaryButton) {
    return;
  }

  activeTool = toolName;
  const tool = tools[toolName];

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tool === toolName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  inputLabel.textContent = tool.inputLabel;
  outputLabel.textContent = tool.outputLabel;
  runButton.textContent = tool.primary;
  secondaryButton.textContent = tool.secondary;
  input.value = tool.placeholder;
  output.value = "";
  renderQrPreview("");
  setStatus("Ready");
}

async function runTool(mode = "primary") {
  if (!input || !output) return;

  const tool = tools[activeTool];
  try {
    setStatus("Working");
    output.value = mode === "secondary" ? await tool.secondaryRun(input.value) : await tool.run(input.value);
    setStatus("Done");
  } catch (error) {
    output.value = "";
    renderQrPreview("");
    setStatus(error.message || "Unable to process input.", "error");
  }
}

function copyOutput() {
  if (!output) return;

  if (!output.value) {
    setStatus("Nothing to copy", "error");
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(output.value)
      .then(() => setStatus("Copied"))
      .catch(copyOutputFallback);
    return;
  }

  copyOutputFallback();
}

function copyOutputFallback() {
  if (!output) return;

  output.focus();
  output.select();
  const copied = document.execCommand("copy");
  setStatus(copied ? "Copied" : "Copy failed", copied ? "normal" : "error");
}

function filterTools(query) {
  const normalized = query.trim().toLowerCase();

  toolCards.forEach((card) => {
    const text = `${card.textContent} ${card.dataset.keywords}`.toLowerCase();
    card.classList.toggle("is-hidden", normalized.length > 0 && !text.includes(normalized));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectTool(tab.dataset.tool));
});

runButton?.addEventListener("click", () => runTool("primary"));
secondaryButton?.addEventListener("click", () => runTool("secondary"));
copyButton?.addEventListener("click", copyOutput);
clearButton?.addEventListener("click", () => {
  if (!input || !output) return;
  input.value = "";
  output.value = "";
  renderQrPreview("");
  setStatus("Cleared");
});

searchInput?.addEventListener("input", (event) => {
  filterTools(event.target.value);
});

selectTool(activeTool);
