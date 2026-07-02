/**
 * Interactive 3D tilt cards — mouse-follow perspective with depth shadow.
 */
(function () {
  const tiltState = new WeakMap();
  let globalListenerAttached = false;

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function applyTilt(card, e) {
    const state = tiltState.get(card);
    if (!state) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;

    const maxTilt = Portfolio3D.isLite3D() ? 8 : 14;
    const rotateY = px * maxTilt;
    const rotateX = -py * maxTilt;

    state.currentX = rotateX;
    state.currentY = rotateY;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    const shine = card.querySelector('.tilt-card-shine');
    if (shine) {
      shine.style.opacity = '1';
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(102,252,241,0.18) 0%, transparent 55%)`;
    }

    const inner = card.querySelector('.tilt-card-inner');
    if (inner) {
      inner.style.transform = `translateZ(30px) translateX(${px * -6}px) translateY(${py * -6}px)`;
    }

    const reveal = card.querySelector('.tilt-card-reveal');
    if (reveal) {
      reveal.style.opacity = '1';
      reveal.style.transform = 'translateZ(40px)';
    }
  }

  function resetTilt(card) {
    const state = tiltState.get(card);
    if (!state) return;

    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    const shine = card.querySelector('.tilt-card-shine');
    if (shine) shine.style.opacity = '0';

    const inner = card.querySelector('.tilt-card-inner');
    if (inner) inner.style.transform = 'translateZ(0)';

    const reveal = card.querySelector('.tilt-card-reveal');
    if (reveal) {
      reveal.style.opacity = '0';
      reveal.style.transform = 'translateZ(0)';
    }
  }

  function bindCard(card) {
    if (tiltState.has(card)) return;

    tiltState.set(card, { currentX: 0, currentY: 0 });

    card.addEventListener('mouseenter', () => card.classList.add('is-tilting'));
    card.addEventListener('mousemove', (e) => applyTilt(card, e));
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-tilting');
      resetTilt(card);
    });
  }

  Portfolio3D.initTiltCards = function (root) {
    if (!Portfolio3D.is3DEnabled()) return;

    const scope = root || document;
    scope.querySelectorAll('.tilt-card').forEach(bindCard);

    if (!globalListenerAttached) {
      globalListenerAttached = true;
      document.querySelectorAll('.tilt-card-wrap').forEach(wrap => {
        wrap.style.transformStyle = 'preserve-3d';
      });
    }
  };

  Portfolio3D.destroyTiltCards = function (root) {
    const scope = root || document;
    scope.querySelectorAll('.tilt-card').forEach(card => {
      resetTilt(card);
      tiltState.delete(card);
    });
  };

})();
