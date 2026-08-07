// Pre-load splash screen shown once per browser session on a fresh site
// load. The overlay markup ships statically in each page's HTML (so it
// paints immediately, before any script runs) and an inline snippet right
// after it hides the overlay instantly on repeat views within the session
// (see the inline <script> next to #wh-splash in each page).
//
// This file owns the "first view" timing: it waits for whichever finishes
// last — a fixed 3s minimum or the page's load event — then fades the
// overlay out. It never delays real data fetching; the page loads normally
// underneath the overlay the whole time.
(function () {
  var splash = document.getElementById('wh-splash');
  if (!splash || sessionStorage.getItem('wh_splash_shown')) return;
  sessionStorage.setItem('wh_splash_shown', '1');

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
