const API_BASE = '';

window.addEventListener('load', () => {
  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    setTimeout(() => {
      pageLoader.classList.add('loader-hidden');
      setTimeout(() => pageLoader.remove(), 600);
    }, 400);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up, .scale-in').forEach(el => observer.observe(el));

  const aboutGrid = document.querySelector('.about-grid');
  if (aboutGrid) observer.observe(aboutGrid);

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('scroll-top-btn')?.classList.toggle('visible', window.scrollY > 400);
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  // Mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    menuToggle?.classList.remove('open');
    mobileNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  mobileNav?.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Scroll to top
  document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Typewriter effect
  const typewriterPhrases = [
    "Hi, I'm Malik Babar Ali",
    "I design & develop beautiful websites...",
    "I build high-performance mobile apps...",
    "I optimize sites for search engines (SEO)..."
  ];

  let text = "";
  let phraseIndex = 0;
  let isDeleting = false;
  const typewriterElement = document.getElementById('typewriter-text');

  if (typewriterElement) {
    function type() {
      const currentPhrase = typewriterPhrases[phraseIndex];
      let delay = 50;

      if (!isDeleting && text.length < currentPhrase.length) {
        text = currentPhrase.substring(0, text.length + 1);
      } else if (isDeleting && text.length > 0) {
        text = currentPhrase.substring(0, text.length - 1);
        delay = 30;
      } else if (!isDeleting && text.length === currentPhrase.length) {
        isDeleting = true;
        delay = 2000;
      } else if (isDeleting && text.length === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      }

      typewriterElement.textContent = text;
      setTimeout(type, delay);
    }
    setTimeout(type, 1000);
  }

  // Animated stat counters
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1500;
      const start = performance.now();

      function animate(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = target;
      }
      requestAnimationFrame(animate);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));

  // Animated skill bars
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  skillBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0';
    bar.dataset.targetWidth = width;
  });

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.width = entry.target.dataset.targetWidth;
      skillsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => skillsObserver.observe(bar));

  // Project category helper
  function getProjectCategory(project) {
    const stack = (project.tech_stack || '').toLowerCase();
    const title = (project.title || '').toLowerCase();
    const combined = `${stack} ${title}`;
    if (/react native|flutter|mobile|ios|android/.test(combined)) return 'mobile';
    if (/openai|ai|ml|machine|gpt|llm/.test(combined)) return 'ai';
    return 'web';
  }

  const categoryLabels = { web: 'Web App', mobile: 'Mobile', ai: 'AI / Data' };

  let allProjects = [];

  const projectsContainer = document.getElementById('projects-container');
  const projectsLoading = document.getElementById('projects-loading');
  const projectsEmpty = document.getElementById('projects-empty');
  const projectsFilter = document.getElementById('projects-filter');

  function renderProjects(filter = 'all') {
    const filtered = filter === 'all'
      ? allProjects
      : allProjects.filter(p => getProjectCategory(p) === filter);

    if (filtered.length === 0) {
      projectsContainer.innerHTML = '';
      projectsEmpty.style.display = 'block';
      projectsEmpty.textContent = filter === 'all'
        ? 'No projects available at the moment.'
        : 'No projects in this category yet.';
      return;
    }

    projectsEmpty.style.display = 'none';
    projectsContainer.innerHTML = filtered.map((project, idx) => {
      const imagesList = project.images || [project.image_url || ''];
      const hasSlider = imagesList.length > 1;
      const category = getProjectCategory(project);
      const techTags = (project.tech_stack || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      return `
        <div class="project-card fade-in-up visible" data-category="${category}" style="transition-delay: ${idx * 0.1}s">
          <div class="project-img-wrap">
             <span class="project-index">0${idx + 1}</span>
             <span class="project-category-badge">${categoryLabels[category]}</span>
             ${hasSlider ? `
               <div class="project-slider">
                 <div class="slides-container">
                   ${imagesList.map((img, sIdx) => `
                     <img src="${img}" alt="${project.title} slide ${sIdx + 1}" class="slide ${sIdx === 0 ? 'active' : ''}" loading="lazy" />
                   `).join('')}
                 </div>
                 <button type="button" class="slider-arrow slider-arrow-prev" aria-label="Previous image">
                   <i data-lucide="chevron-left"></i>
                 </button>
                 <button type="button" class="slider-arrow slider-arrow-next" aria-label="Next image">
                   <i data-lucide="chevron-right"></i>
                 </button>
                 <div class="slider-dots">
                   ${imagesList.map((_, sIdx) => `
                     <button type="button" class="slider-dot ${sIdx === 0 ? 'active' : ''}" data-index="${sIdx}" aria-label="Go to image ${sIdx + 1}"></button>
                   `).join('')}
                 </div>
               </div>
             ` : `
               ${project.image_url ? `
                 <img src="${project.image_url}" alt="${project.title}" class="project-img" loading="lazy" />
               ` : `
                 <div class="project-img-placeholder">
                   <i data-lucide="image"></i>
                 </div>
               `}
             `}
             <div class="project-img-overlay"></div>
          </div>

          <div class="project-content">
            <h3 class="card-title project-title">${project.title}</h3>
            <div class="project-languages">
              ${techTags.map(tag => `<span class="tech-pill">${tag}</span>`).join('')}
            </div>
            <div class="project-description-box">
              ${project.description}
            </div>

            ${(project.problem || project.solution) ? `
              <div class="project-details">
                ${project.problem ? `
                  <div class="project-detail-block detail-block-problem">
                    <span class="detail-label detail-problem"><i data-lucide="alert-triangle"></i>Problem</span>
                    <p>${project.problem}</p>
                  </div>
                ` : ''}
                ${project.solution ? `
                  <div class="project-detail-block detail-block-solution">
                    <span class="detail-label detail-solution"><i data-lucide="lightbulb"></i>Solution</span>
                    <p>${project.solution}</p>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <div class="project-links">
               ${project.live_link && project.live_link !== '#' ? `
                 <a href="${project.live_link}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
                   <button class="btn btn-primary">Live Demo</button>
                 </a>
               ` : ''}
               ${project.github_link && project.github_link !== '#' ? `
                 <a href="${project.github_link}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
                   <button class="btn btn-secondary">Code</button>
                 </a>
               ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    initProjectSliders();
  }

  function initProjectSliders() {
    const sliders = document.querySelectorAll('.project-slider');
    sliders.forEach(slider => {
      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelectorAll('.slider-dot');
      if (slides.length <= 1) return;

      let currentIndex = 0;
      let slideInterval;

      function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        currentIndex = (index + slides.length) % slides.length;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
      }

      function nextSlide() {
        showSlide(currentIndex + 1);
      }

      function prevSlide() {
        showSlide(currentIndex - 1);
      }

      function startAutoplay() {
        stopAutoplay();
        slideInterval = setInterval(nextSlide, 3500);
      }

      function stopAutoplay() {
        if (slideInterval) clearInterval(slideInterval);
      }

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          showSlide(idx);
          startAutoplay();
        });
      });

      const prevBtn = slider.querySelector('.slider-arrow-prev');
      const nextBtn = slider.querySelector('.slider-arrow-next');

      prevBtn?.addEventListener('click', () => {
        prevSlide();
        startAutoplay();
      });

      nextBtn?.addEventListener('click', () => {
        nextSlide();
        startAutoplay();
      });

      startAutoplay();

      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
    });
  }

  // ── Projects data ────────────────────────────────────────────────────────────
  const allProjectsData = [
    {
      id: 1,
      title: "buildyoucv",
      description: "A full-stack, interactive 3D CV Builder and Portfolio Generator with real-time responsive template rendering and one-click PDF export.",
      problem: "Building a polished resume is painful — text editors break formatting on every edit, and most online builders are paywalled, outdated, or offer zero real-time feedback.",
      solution: "buildyourcv.io separates data from styling: structured entry, live template rendering, high-fidelity PDF export, and an immersive 3D building experience.",
      tech_stack: "three.js , React.js , vite , Node.js , Expres.js",
      images: [
        "./images/projects/buildyourcv/first.jpg",
        "./images/projects/buildyourcv/second.jpg",
        "./images/projects/buildyourcv/third.jpg",
      ],
      github_link: "https://github.com/malikbabaralicase/buildyourcv.io",
      live_link: "https://buildyourcvio.vercel.app/"
    },
    {
      id: 2,
      title: "MBA's Gym SaaS Solution",
      description: "A full-stack gym management SaaS that replaces spreadsheets and paper logs with one real-time dashboard for members, plans, attendance, and staff.",
      problem: "Independent gyms run on scattered tools — spreadsheets, notebooks, WhatsApp reminders — with no clear record of staff actions, expiring memberships, or traffic trends.",
      solution: "MBA'S GYM CENTER is a role-based SaaS dashboard for member onboarding, QR check-ins, renewal tracking, activity logs, and automated Zapier reminders.",
      tech_stack: "Next.js , React.js , supabase , Zapier , Recharts",
      images: [
        "./images/projects/mbagymsaas/loginpage.PNG",
        "./images/projects/mbagymsaas/dashboard.PNG",
        "./images/projects/mbagymsaas/memberprofile.PNG",
        "./images/projects/mbagymsaas/members.PNG",
      ],
      github_link: "https://github.com/malikbabaralicase/mbas-gym-center",
      live_link: "https://mbas-gym-center.vercel.app/"
    }
  ];

  if (projectsContainer) {
    projectsLoading.style.display = 'none';
    allProjects = allProjectsData;

    if (allProjects.length === 0) {
      // Show animated "coming soon" banner instead of plain empty text
      projectsEmpty.style.display = 'none';
      projectsFilter.style.display = 'none';
      projectsContainer.innerHTML = `
        <div class="projects-coming-soon">
          <div class="coming-soon-orbs">
            <span class="orb orb-1"></span>
            <span class="orb orb-2"></span>
            <span class="orb orb-3"></span>
          </div>
          <div class="coming-soon-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 class="coming-soon-title">Projects Loading Soon</h3>
          <p class="coming-soon-desc">Exciting projects are currently being crafted and documented.<br/>Check back shortly — great things are on the way!</p>
          <div class="coming-soon-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
    } else {
      if (projectsFilter) projectsFilter.style.display = 'flex';
      renderProjects('all');

      projectsFilter?.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          projectsFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderProjects(btn.dataset.filter);
        });
      });
    }
  }

  // Contact Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('contact-btn');
      const errEl = document.getElementById('contact-error');
      const sucEl = document.getElementById('contact-success');

      btn.disabled = true;
      btn.innerHTML = 'Sending...';
      errEl.style.display = 'none';
      sucEl.style.display = 'none';

      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const email = document.getElementById('email').value;
      const service = document.getElementById('service').value;
      const budget = document.getElementById('budget').value;
      const baseMessage = document.getElementById('message').value;

      const data = {
        name: `${firstName} ${lastName}`,
        email: email,
        message: `Service: ${service}\nBudget: ${budget}\n\nDetails:\n${baseMessage}`,
        website: document.getElementById('hp-field')?.value || ''
      };

      try {
        const res = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          sucEl.style.display = 'block';
          contactForm.reset();
        } else {
          errEl.style.display = 'block';
          errEl.textContent = 'Failed to send message.';
        }
      } catch (err) {
        errEl.style.display = 'block';
        errEl.textContent = 'Network error. Is the backend running?';
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Send Message &nbsp; <i data-lucide="send" width="18" height="18"></i>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }
});
