(function () {
  const GA4_MEASUREMENT_ID = "G-SNHJ9F5044";
  const GA4_SCRIPT_ID = "wud-ga4-loader";
  const ANALYTICS_FLAG = "__wudAnalyticsInitialized";

  if (window[ANALYTICS_FLAG]) {
    return;
  }
  window[ANALYTICS_FLAG] = true;

  if (!GA4_MEASUREMENT_ID) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (!document.getElementById(GA4_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = GA4_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  });
  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
})();
