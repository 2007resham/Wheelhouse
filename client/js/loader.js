// Reusable brand-styled loading indicator: a hand-drawn bike-wheel SVG that
// spins via a CSS transform animation (GPU-composited, no per-frame JS needed).
// Used everywhere the app shows a loading state: bike grids, page details,
// buttons mid-submit, and a full-page overlay for longer blocking actions.
// Included on every page alongside loader.css.

function wheelSvgMarkup() {
  return `
    <svg viewBox="0 0 64 64" class="wh-loader-svg" role="img" aria-label="Loading">
      <circle cx="32" cy="32" r="26" class="wh-loader-rim" />
      <g class="wh-loader-spokes">
        <line x1="32" y1="8" x2="32" y2="56" />
        <line x1="8" y1="32" x2="56" y2="32" />
        <line x1="14" y1="14" x2="50" y2="50" />
        <line x1="50" y1="14" x2="14" y2="50" />
      </g>
      <circle cx="32" cy="32" r="5" class="wh-loader-hub" />
    </svg>
  `;
}

// size: 'sm' (inline with text/buttons), 'md', 'lg' (grid/card slots), 'xl' (overlay)
function inlineHTML(size = 'sm') {
  return `<span class="wh-loader wh-loader-${size}">${wheelSvgMarkup()}</span>`;
}

function createWheel(size = 'md') {
  const el = document.createElement('span');
  el.className = `wh-loader wh-loader-${size}`;
  el.innerHTML = wheelSvgMarkup();
  return el;
}

// Drop-in replacement for a grid's contents while its data loads
// (spans the full grid width, same slot the empty-state markup uses).
function gridLoaderHTML(label = 'Loading...') {
  return `
    <div class="wh-loader-slot" style="grid-column: 1 / -1;">
      ${inlineHTML('lg')}
      <p>${label}</p>
    </div>
  `;
}

// Drop-in replacement for a table's <tbody> while its rows load.
function rowLoaderHTML(colspan, label = 'Loading...') {
  return `<tr><td colspan="${colspan}"><div class="wh-loader-row">${inlineHTML('sm')} ${label}</div></td></tr>`;
}

let overlayEl = null;

// Full-page overlay for actions that block the whole UI (e.g. confirming a booking).
// Returns a handle so the caller can hide it once the action settles.
function showOverlay(label = 'Loading...') {
  hideOverlay();
  overlayEl = document.createElement('div');
  overlayEl.className = 'wh-loader-overlay';
  overlayEl.innerHTML = `${inlineHTML('xl')}<p>${label}</p>`;
  document.body.appendChild(overlayEl);
  return { hide: hideOverlay };
}

function hideOverlay() {
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
}

window.WheelHouseLoader = { inlineHTML, createWheel, gridLoaderHTML, rowLoaderHTML, showOverlay, hideOverlay };
