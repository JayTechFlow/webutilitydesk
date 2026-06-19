(function () {
  function readMeta(name) {
    const element = document.querySelector(`meta[name="${name}"]`);
    return element?.content?.trim() || "";
  }

  const ga4Id = readMeta("wud-ga4-id");
  const clarityId = readMeta("wud-clarity-id");

  if (ga4Id) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = window.gtag || gtag;
    window.gtag("js", new Date());
    window.gtag("config", ga4Id, { anonymize_ip: true });
  }

  if (clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = true;
      t.src = `https://www.clarity.ms/tag/${encodeURIComponent(i)}`;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", clarityId);
  }
})();
