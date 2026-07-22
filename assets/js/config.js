// Global Frontend Configuration
(() => {
  const hostname = window.location.hostname;
  const isLocal = !hostname || hostname === "localhost" || hostname === "127.0.0.1" || window.location.protocol === "file:";

  window.API_BASE_URL = isLocal ? "http://localhost:5050" : "https://api.sharpkode.com";
  window.SHARPAI_DEBUG = isLocal;
})();
