// Pre-load splash screen shown only on a real refresh/reload or the user's
// first page this session — never on normal internal link-to-link
// navigation. The overlay markup ships statically in each page's HTML so it
// paints immediately, before any script runs; the inline <script> right
// after #wh-splash in each page decides (via the Navigation Timing API +
// sessionStorage) whether this load should show it, hides it instantly if
// not, and stashes the decision on window.__whShowSplash.
//
// This file owns the timing for loads where the splash IS shown: it waits
// for whichever finishes last — a fixed 3s minimum or the page's load
// event — then fades the overlay out. It never delays real data fetching;
// the page loads normally underneath the overlay the whole time.
(function () {
  var splash = document.getElementById('wh-splash');
  if (!splash || !window.__whShowSplash) return;

  var minTime = new Promise(function (resolve) { setTimeout(resolve, 3000); });
  var pageReady = new Promise(function (resolve) {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });

  Promise.all([minTime, pageReady]).then(function () {
    splash.classList.add('wh-splash-hide');
    setTimeout(function () { splash.remove(); }, 500);
  });
})();
