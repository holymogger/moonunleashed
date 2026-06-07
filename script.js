/**
 * Moon Unleashed 2.0 — Scripts
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ═══ PRELOADER ═══ */
function initPreloader() {
  const preloader = $('#preloader');
  const fill = $('.preloader-fill');

  if (!preloader || !fill) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;

    fill.style.width = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('is-hidden');
        document.body.style.overflow = '';
        setTimeout(() => preloader.remove(), 800);
        // Trigger reveal for elements in viewport after load
        triggerReveal();
      }, 500);
    }
  }, 100);
}

/* ═══ CURSOR GLOW ═══ */
function initCursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow) return;

  // Disable on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    // Use requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
      glow.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    });
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}

/* ═══ SCROLL PROGRESS & HEADER ═══ */
function initScrollEffects() {
  const header = $('.site-header');
  const progressBar = $('#scrollProgress');

  window.addEventListener('scroll', () => {
    // Header background
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll progress bar
    if (progressBar) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = `${scrolled}%`;
    }
  }, { passive: true });
}

/* ═══ MOBILE NAV ═══ */
function initNav() {
  const toggle = $('#navToggle');
  const nav = $('#siteNav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('is-open');
    document.body.style.overflow = isExpanded ? '' : 'hidden';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

/* ═══ REVEAL ANIMATIONS & STAT COUNTERS ═══ */
const revealElements = new Set();
let revealObserver;

function initReveal() {
  const elements = $$('[data-reveal]');

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        // Handle counters if present
        const counters = $$('[data-count]', entry.target);
        if (entry.target.hasAttribute('data-count')) {
          counters.push(entry.target);
        }

        counters.forEach(counter => {
          if (!counter.dataset.animated) {
            animateCount(counter);
            counter.dataset.animated = 'true';
          }
        });

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => {
    revealElements.add(el);
    revealObserver.observe(el);
  });
}

function triggerReveal() {
  // Manually check elements if preloader finishes after they are in viewport
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible');
      const counters = $$('[data-count]', el);
      if (el.hasAttribute('data-count')) {
        counters.push(el);
      }
      counters.forEach(counter => {
        if (!counter.dataset.animated) {
          animateCount(counter);
          counter.dataset.animated = 'true';
        }
      });
      revealObserver.unobserve(el);
    }
  });
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 2000; // ms
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Easing out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeProgress * target);

    el.textContent = current >= 100 ? `${current}+` : current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target >= 100 ? `${target}+` : target;
    }
  }

  requestAnimationFrame(update);
}

/* ═══ TABS ═══ */
function initTabs(tabSelector, panelSelector, dataAttr) {
  const tabs = $$(tabSelector);
  const panels = $$(panelSelector);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('is-active'));

      // Activate clicked
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const targetId = tab.dataset[dataAttr];
      const targetPanel = panels.find(p =>
        p.dataset[dataAttr === 'class' ? 'panel' : 'arsenalPanel'] === targetId
      );

      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }
    });
  });
}

/* ═══ 3D TILT EFFECT ═══ */
function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const elements = $$('[data-tilt]');

  elements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // max 10deg
      const rotateY = ((x - centerX) / centerX) * 10;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      el.style.zIndex = 10;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      el.style.zIndex = 1;
      setTimeout(() => {
        el.style.transition = 'all var(--transition-base)';
      }, 50);
    });

    el.addEventListener('mouseenter', () => {
      el.style.transition = 'none'; // Remove transition during mousemove for instant feedback
    });
  });
}

/* ═══ LIGHTBOX ═══ */
function initLightbox() {
  const lightbox = $('#lightbox');
  const img = $('#lightboxImg');
  const caption = $('#lightboxCaption');
  const counter = $('#lightboxCounter');
  const items = $$('.gallery-zoom');

  if (!lightbox || items.length === 0) return;

  let currentIndex = 0;
  const galleryData = items.map(btn => {
    const imageEl = btn.querySelector('img');
    const figcaption = btn.closest('figure').querySelector('figcaption');
    return {
      src: imageEl.src,
      alt: imageEl.alt,
      caption: figcaption ? figcaption.textContent : imageEl.alt
    };
  });

  function open(index) {
    currentIndex = index;
    update();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function update() {
    const data = galleryData[currentIndex];
    img.src = data.src;
    img.alt = data.alt;
    caption.textContent = data.caption;
    counter.textContent = `${currentIndex + 1} / ${galleryData.length}`;
  }

  function next() {
    currentIndex = (currentIndex + 1) % galleryData.length;
    update();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    update();
  }

  items.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open(index);
    });
  });

  $('#lightboxNext')?.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  $('#lightboxPrev')?.addEventListener('click', (e) => { e.stopPropagation(); prev(); });

  $$('[data-lightbox-close]').forEach(btn => btn.addEventListener('click', close));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
}

/* ═══ PARTICLES ═══ */
function initParticles() {
  const canvas = $('#particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Responsive particle count
  const getParticleCount = () => window.innerWidth < 768 ? 40 : 100;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * -0.5 - 0.1; // Drift upward slightly
      this.opacity = Math.random() * 0.5 + 0.1;

      // Teal/Mint color variations
      const colors = [
        [0, 255, 170], // Mint
        [44, 181, 168], // Teal
        [51, 255, 255]  // Cyan
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.y < 0) {
        this.y = height;
        this.x = Math.random() * width;
      }

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connections if close
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 170, ${0.1 * (1 - dist / 100)})`;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    init(); // Reinitialize to adjust counts
  });

  resize();
  init();
  animate();
}

/* ═══ DOWNLOAD LÓGICA ═══ */
function initDownload() {
  const container = $('#downloadPlatforms');
  if (!container) return;

  // Configure o nome do seu arquivo aqui em 'url' (ex: 'downloads/MoonUnleashed.zip')
  const platforms = [
    { id: 'windows', name: 'Windows', icon: '🪟', size: '1.4 GB', url: 'downloads/MoonUnleashed_BETA1.5.zip', available: true },
    { id: 'linux', name: 'Linux', icon: '🐧', size: 'Em breve', url: null, available: false },
    { id: 'mac', name: 'macOS', icon: '🍎', size: 'Em breve', url: null, available: false }
  ];

  platforms.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'platform-btn';
    btn.disabled = !p.available;
    btn.innerHTML = `
      <span class="platform-icon">${p.icon}</span>
      <span class="platform-name">${p.name}</span>
      <span class="platform-size">${p.size}</span>
    `;

    if (p.available && p.url) {
      btn.addEventListener('click', () => {
        showToast(`Iniciando download para ${p.name}...`);

        // Lógica real de download
        const link = document.createElement("a");
        link.href = p.url;
        link.download = "";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
    }

    container.appendChild(btn);
  });

  $('#heroDownload')?.addEventListener('click', (e) => {
    e.preventDefault();

    // Auto-detecta a primeira plataforma disponível
    const availablePlatform = platforms.find(p => p.available && p.url);

    if (availablePlatform) {
      showToast(`Iniciando download para ${availablePlatform.name}...`);
      const link = document.createElement("a");
      link.href = availablePlatform.url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      document.querySelector('#download').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        showToast('Nenhuma versão disponível no momento.');
      }, 800);
    }
  });
}

function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3000);
}

/* ═══ INITIALIZATION ═══ */
document.addEventListener('DOMContentLoaded', () => {
  // Lock scroll initially for preloader
  document.body.style.overflow = 'hidden';

  // Set current year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize all modules
  initPreloader();
  initCursorGlow();
  initScrollEffects();
  initNav();
  initReveal();
  initTabs('.class-tab', '.class-panel', 'class');
  initTabs('.arsenal-tab', '.arsenal-panel', 'arsenal');
  initTilt();
  initLightbox();
  initParticles();
  initDownload();
});
