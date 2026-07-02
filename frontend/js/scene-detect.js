/**
 * Shared 3D capability detection — mobile & reduced-motion fall back to 2D.
 */
window.Portfolio3D = window.Portfolio3D || {};

Portfolio3D.is3DEnabled = function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 768px)').matches) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
  return true;
};

Portfolio3D.isLite3D = function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return window.matchMedia('(max-width: 1024px)').matches;
};

(function applyBodyClass() {
  function update() {
    document.body.classList.toggle('no-3d', !Portfolio3D.is3DEnabled());
    document.body.classList.toggle('lite-3d', Portfolio3D.isLite3D() && Portfolio3D.is3DEnabled());
  }
  update();
  window.addEventListener('resize', update, { passive: true });
})();

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

Portfolio3D.loadScript = loadScript;
