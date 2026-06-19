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
