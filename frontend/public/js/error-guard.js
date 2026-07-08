window.addEventListener("error", function (e) {
    if (
        e.error instanceof DOMException &&
        e.error.name === "DataCloneError" &&
        e.message &&
        e.message.includes("PerformanceServerTiming")
    ) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
}, true);

// CSP-safe replacement for the inline onload="this.media='all'" Google Fonts
// swap (inline event handlers are blocked by the hardened production CSP).
(function () {
    var link = document.querySelector(
        'link[rel="stylesheet"][media="print"][href*="fonts.googleapis.com"]',
    );
    if (!link) return;
    var swap = function () {
        link.media = "all";
    };
    if (link.sheet) swap();
    else link.addEventListener("load", swap);
})();
