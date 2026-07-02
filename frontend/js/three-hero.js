/**
 * Lazy-loaded Three.js hero: particle field + wireframe geometry with mouse/scroll parallax.
 */
(function () {
  let renderer, scene, camera, animationId;
  let particles, coreMesh, ringMesh;
  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  let scrollY = 0;
  let isRunning = false;
  let container = null;

  const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';

  function onMouseMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    mouseX = nx;
    mouseY = ny;
    targetRotY = nx * 0.35;
    targetRotX = ny * 0.25;
  }

  function onScroll() {
    scrollY = window.scrollY;
  }

  function createScene(THREE) {
    container = document.getElementById('hero-canvas-wrap');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0c10, 0.035);

    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 14;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const particleCount = Portfolio3D.isLite3D() ? 400 : 900;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x66fcf1,
        size: 0.06,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(particles);

    const coreGeo = new THREE.IcosahedronGeometry(2.2, 1);
    coreMesh = new THREE.Mesh(
      coreGeo,
      new THREE.MeshBasicMaterial({
        color: 0x66fcf1,
        wireframe: true,
        transparent: true,
        opacity: 0.55
      })
    );
    coreMesh.position.set(3.5, 0.5, -2);
    scene.add(coreMesh);

    const ringGeo = new THREE.TorusGeometry(3.8, 0.04, 8, 64);
    ringMesh = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({
        color: 0x45a29e,
        transparent: true,
        opacity: 0.45
      })
    );
    ringMesh.position.set(3.5, 0.5, -2);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    const innerRing = ringMesh.clone();
    innerRing.scale.set(0.72, 0.72, 0.72);
    innerRing.rotation.z = Math.PI / 4;
    scene.add(innerRing);
    ringMesh.userData.innerRing = innerRing;

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    isRunning = true;
    animate();
  }

  function onResize() {
    if (!renderer || !camera || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function onVisibility() {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      isRunning = false;
    } else if (!isRunning && renderer) {
      isRunning = true;
      animate();
    }
  }

  function animate() {
    if (!isRunning || !renderer) return;
    animationId = requestAnimationFrame(animate);

    const t = performance.now() * 0.0004;
    const scrollFactor = Math.min(scrollY * 0.002, 1.5);

    if (particles) {
      particles.rotation.y = t * 0.15 + mouseX * 0.08;
      particles.rotation.x = mouseY * 0.05;
      particles.position.y = -scrollFactor * 0.8;
    }

    if (coreMesh) {
      coreMesh.rotation.x += 0.004 + targetRotX * 0.002;
      coreMesh.rotation.y += 0.006 + targetRotY * 0.002;
      coreMesh.position.y = 0.5 + Math.sin(t * 2) * 0.25 - scrollFactor * 0.3;
    }

    if (ringMesh) {
      ringMesh.rotation.z += 0.003;
      ringMesh.rotation.y = targetRotY * 0.5;
      if (ringMesh.userData.innerRing) {
        ringMesh.userData.innerRing.rotation.z -= 0.005;
      }
    }

    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(2, 0, 0);

    renderer.render(scene, camera);
  }

  function destroy() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    if (renderer) {
      renderer.dispose();
      renderer.domElement?.remove();
    }
    renderer = scene = camera = particles = coreMesh = ringMesh = null;
  }

  Portfolio3D.initHero3D = async function () {
    if (!Portfolio3D.is3DEnabled()) return;

    const hero = document.getElementById('home');
    if (!hero) return;

    const observer = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      try {
        await Portfolio3D.loadScript(THREE_CDN);
        if (typeof THREE === 'undefined') return;
        createScene(THREE);
        hero.classList.add('hero-3d-ready');
      } catch (err) {
        console.warn('Three.js hero failed to load:', err);
      }
    }, { rootMargin: '100px' });

    observer.observe(hero);
  };

  Portfolio3D.destroyHero3D = destroy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Portfolio3D.initHero3D());
  } else {
    Portfolio3D.initHero3D();
  }
})();
