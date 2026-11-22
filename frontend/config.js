/*
 * API configuration:
 * - Local Live Server: connect to the Node API on port 5000.
 * - Deployed app: frontend and API are served by the same Render web service.
 */
(function () {
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    && window.location.port !== "5000";
  window.CANTEEN_API_BASE = isLocalPreview
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;
})();
