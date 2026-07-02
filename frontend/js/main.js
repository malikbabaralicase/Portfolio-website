const API_BASE = '';

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
    projectsContainer.innerHTML = filtered.map((project, idx) => `
      <div class="project-card fade-in-up visible" data-category="${getProjectCategory(project)}" style="transition-delay: ${idx * 0.1}s">
        <div class="project-img-wrap">
           ${project.image_url ? `
             <img src="${project.image_url}" alt="${project.title}" class="project-img" loading="lazy" />
           ` : `
             <div class="project-img-placeholder">
               <i data-lucide="image"></i>
             </div>
           `}
        </div>

        <div class="project-content">
          <h3 class="card-title project-title">${project.title}</h3>
          <p class="card-desc">${project.description}</p>

          ${(project.problem || project.solution) ? `
            <div class="project-details">
              ${project.problem ? `
                <div class="project-detail-block">
                  <span class="detail-label detail-problem">Problem</span>
                  <p>${project.problem}</p>
                </div>
              ` : ''}
              ${project.solution ? `
                <div class="project-detail-block">
                  <span class="detail-label detail-solution">Solution</span>
                  <p>${project.solution}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="skill-tags">
            ${(project.tech_stack || '').split(',').filter(t => t.trim()).map(tech => `
              <span class="skill-tag">${tech.trim()}</span>
            `).join('')}
          </div>

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
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Hardcoded projects — edit this array directly to add/remove/update projects
  const allProjectsData = [
    {
      id: 1,
      title: "AI Content Generator",
      description: "An intelligent content generation platform built with Next.js and OpenAI API.",
      problem: "Writers needed a fast way to generate drafts and outlines.",
      solution: "Built a seamless UI that interfaces with LLMs to generate high-quality text based on prompts.",
      tech_stack: "React, Next.js, OpenAI, TailwindCSS",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
      github_link: "#",
      live_link: "#"
    },
    {
      id: 2,
      title: "E-Commerce Dashboard",
      description: "A comprehensive analytics dashboard for modern online stores.",
      problem: "Store owners lacked real-time visibility into their sales metrics.",
      solution: "Developed a real-time data visualization dashboard using modern web technologies.",
      tech_stack: "Vue.js, Node.js, Express, Chart.js",
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      github_link: "#",
      live_link: "#"
    }
  ];

  if (projectsContainer) {
    projectsLoading.style.display = 'none';
    allProjects = allProjectsData;

    if (allProjects.length === 0) {
      projectsEmpty.style.display = 'block';
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
        message: `Service: ${service}\nBudget: ${budget}\n\nDetails:\n${baseMessage}`
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
