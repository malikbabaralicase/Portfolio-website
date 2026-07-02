/**
 * GSAP ScrollTrigger — scroll-based 3D parallax & section transitions.
 */
(function () {
  let scrollTriggers = [];

  const EASE = 'power3.out';
  const EASE_SMOOTH = 'expo.out';

  function killAll() {
    scrollTriggers.forEach(tween => tween.kill && tween.kill());
    scrollTriggers = [];
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
  }

  Portfolio3D.initScrollAnimations = function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    killAll();

    const enabled3D = Portfolio3D.is3DEnabled();

    // Hero content parallax on scroll
    const heroText = document.querySelector('.hero-text');
    const heroImage = document.querySelector('.hero-image-wrapper');
    const heroStats = document.querySelector('.hero-stats');

    if (heroText && enabled3D) {
      scrollTriggers.push(
        gsap.to(heroText, {
          y: -80,
          opacity: 0.3,
          rotateX: 8,
          transformPerspective: 1000,
          ease: 'none',
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
          }
        })
      );
    }

    if (heroImage && enabled3D) {
      scrollTriggers.push(
        gsap.to(heroImage, {
          y: -120,
          scale: 0.92,
          rotateY: -12,
          transformPerspective: 1200,
          ease: 'none',
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4
          }
        })
      );
    }

    if (heroStats) {
      scrollTriggers.push(
        gsap.from(heroStats.children, {
          y: 60,
          opacity: 0,
          rotateX: 15,
          transformPerspective: 800,
          stagger: 0.12,
          duration: 0.9,
          ease: EASE_SMOOTH,
          scrollTrigger: {
            trigger: heroStats,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        })
      );
    }

    // Section headers — 3D reveal
    document.querySelectorAll('.section-reveal').forEach((block) => {
      const title = block.querySelector('.section-title');
      const subtitle = block.querySelector('.subtitle');

      if (title) {
        gsap.set(title, { transformPerspective: 1000, transformOrigin: 'center top' });
        scrollTriggers.push(
          gsap.from(title, {
            y: 70,
            opacity: 0,
            rotateX: enabled3D ? -18 : 0,
            duration: 1,
            ease: EASE_SMOOTH,
            scrollTrigger: {
              trigger: block,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          })
        );
      }

      if (subtitle) {
        scrollTriggers.push(
          gsap.from(subtitle, {
            y: 40,
            opacity: 0,
            duration: 0.85,
            delay: 0.15,
            ease: EASE,
            scrollTrigger: {
              trigger: block,
              start: 'top 78%',
              toggleActions: 'play none none reverse'
            }
          })
        );
      }
    });

    // About cards stagger
    const aboutCards = document.querySelectorAll('.about-card');
    if (aboutCards.length) {
      gsap.set(aboutCards, { transformPerspective: 900 });
      scrollTriggers.push(
        gsap.from(aboutCards, {
          y: 80,
          opacity: 0,
          rotateX: enabled3D ? 20 : 0,
          scale: 0.94,
          stagger: 0.1,
          duration: 0.95,
          ease: EASE_SMOOTH,
          scrollTrigger: {
            trigger: '.about-grid',
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        })
      );
    }

    // Service cards
    const serviceCards = document.querySelectorAll('#services .card:not(.about-card)');
    if (serviceCards.length) {
      scrollTriggers.push(
        gsap.from(serviceCards, {
          y: 60,
          opacity: 0,
          rotateY: enabled3D ? -12 : 0,
          transformPerspective: 1000,
          stagger: 0.08,
          duration: 0.85,
          ease: EASE,
          scrollTrigger: {
            trigger: '#services .grid-container',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        })
      );
    }

    // Skills section depth shift
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection && enabled3D) {
      scrollTriggers.push(
        gsap.to('.skills-bars', {
          z: 30,
          rotateY: 4,
          transformPerspective: 1200,
          ease: 'none',
          scrollTrigger: {
            trigger: skillsSection,
            start: 'top bottom',
            end: 'center center',
            scrub: 1.5
          }
        })
      );
      scrollTriggers.push(
        gsap.to('.tools-grid', {
          z: -20,
          rotateY: -4,
          transformPerspective: 1200,
          ease: 'none',
          scrollTrigger: {
            trigger: skillsSection,
            start: 'top bottom',
            end: 'center center',
            scrub: 1.5
          }
        })
      );
    }

    // Project cards scroll parallax (tilt cards get additional treatment in tilt-cards.js)
    Portfolio3D.refreshProjectScrollAnimations();

    // Contact section
    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
      const children = contactGrid.children;
      scrollTriggers.push(
        gsap.from(children, {
          opacity: 0,
          duration: 1,
          ease: EASE_SMOOTH,
          stagger: 0.15,
          scrollTrigger: {
            trigger: contactGrid,
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          },
          x: (i) => (i === 0 ? -50 : 50),
          rotateY: enabled3D ? (i) => (i === 0 ? 15 : -15) : 0,
          transformPerspective: 1000
        })
      );
    }

    ScrollTrigger.refresh();
  };

  Portfolio3D.refreshProjectScrollAnimations = function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const cards = document.querySelectorAll('.tilt-card-wrap');
    if (!cards.length) return;

    const enabled3D = Portfolio3D.is3DEnabled();

    cards.forEach((wrap, i) => {
      scrollTriggers.push(
        gsap.from(wrap, {
          y: 100,
          opacity: 0,
          rotateX: enabled3D ? 25 : 0,
          transformPerspective: 1200,
          duration: 0.9,
          delay: i * 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: wrap,
            start: 'top 92%',
            toggleActions: 'play none none reverse'
          }
        })
      );

      if (enabled3D) {
        scrollTriggers.push(
          gsap.to(wrap, {
            y: -20 * (i % 2 === 0 ? 1 : 0.6),
            ease: 'none',
            scrollTrigger: {
              trigger: '#projects',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 2
            }
          })
        );
      }
    });
  };

  Portfolio3D.refreshScrollAnimations = function () {
    Portfolio3D.initScrollAnimations();
  };

  function boot() {
    Portfolio3D.loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js')
      .then(() => Portfolio3D.loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'))
      .then(() => {
        Portfolio3D.initScrollAnimations();
        window.addEventListener('load', () => ScrollTrigger.refresh());
      })
      .catch(err => console.warn('GSAP failed to load:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
