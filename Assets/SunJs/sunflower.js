/**
 * sunflower.js — Shared JavaScript for Sunflower Laundry Soap website
 * Covers: scroll-shrink header · scroll-reveal animations ·
 *         active nav link · back-to-top · lazy-load fallback
 */

/* ============================================================
   1. HEADER — shrinks on scroll, shows shadow
   ============================================================ */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;

    // Add scrolled class for subtle size reduction
    header.classList.toggle('scrolled', y > 40);

    // Hide header when scrolling down fast, reveal on up
    if (y > lastY + 8 && y > 120) {
      header.classList.add('header-hidden');
    } else if (y < lastY - 4) {
      header.classList.remove('header-hidden');
    }

    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Inject the CSS rules for these states once
  const style = document.createElement('style');
  style.textContent = `
    .site-header {
      transition: transform 0.35s ease, box-shadow 0.25s ease, padding 0.25s ease;
    }
    .site-header.scrolled {
      box-shadow: 0 4px 24px rgba(0,0,0,.10);
    }
    .site-header.header-hidden {
      transform: translateY(-100%);
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   2. SCROLL-REVEAL — fade elements up as they enter viewport
   ============================================================ */
(function initScrollReveal() {
  // Add the base CSS once
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    /* Stagger children inside a reveal-group */
    .reveal-group > * {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal-group.visible > * {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-group.visible > *:nth-child(1) { transition-delay: 0.05s; }
    .reveal-group.visible > *:nth-child(2) { transition-delay: 0.15s; }
    .reveal-group.visible > *:nth-child(3) { transition-delay: 0.25s; }
    .reveal-group.visible > *:nth-child(4) { transition-delay: 0.35s; }
    .reveal-group.visible > *:nth-child(5) { transition-delay: 0.42s; }
    .reveal-group.visible > *:nth-child(6) { transition-delay: 0.49s; }
  `;
  document.head.appendChild(style);

  // Auto-mark sections, cards, and headings for reveal
  const autoRevealSelectors = [
    'section > .container > h2',
    'section > .container > .section-label',
    '.service-card',
    '.svc-card',
    '.product-card',
    '.value-card',
    '.faq-item',
    '.ingredient-card',
    '.timeline-item',
    '.why-item',
    '.process-step',
    '.step-item',
    '.hero-product',
    '.featured-service',
    '.about-preview-inner',
    '.mission-grid',
    '.how-to-grid',
    '.founder-grid',
  ];

  autoRevealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      // Don't double-mark
      if (!el.classList.contains('reveal') && !el.closest('.reveal-group')) {
        el.classList.add('reveal');
      }
    });
  });

  // Auto-mark grids for staggered children reveal
  const autoGroupSelectors = [
    '.services-grid',
    '.services-grid-full',
    '.product-grid',
    '.values-grid',
    '.why-strip-inner',
    '.faq-grid',
    '.ingredients-grid',
    '.process-steps',
    '.footer-grid',
  ];

  autoGroupSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('reveal-group');
      // Remove individual reveal from children since group handles it
      el.querySelectorAll('.reveal').forEach(child => child.classList.remove('reveal'));
    });
  });

  // Set up IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal, .reveal-group').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-group').forEach(el => observer.observe(el));
})();


/* ============================================================
   3. ACTIVE NAV LINK — highlight current page in nav
   ============================================================ */
(function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-panel a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();


/* ============================================================
   4. BACK-TO-TOP BUTTON — appears after 400px scroll
   ============================================================ */
(function initBackToTop() {
  // Create button
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
  document.body.appendChild(btn);

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #backToTop {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--white);
      color: var(--green);
      border: 1.5px solid var(--border);
      box-shadow: 0 4px 16px rgba(0,0,0,.10);
      cursor: pointer;
      display: grid;
      place-items: center;
      font-size: 0.85rem;
      z-index: 89;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
      pointer-events: none;
    }
    #backToTop.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    #backToTop:hover {
      background: var(--green);
      color: var(--white);
      border-color: var(--green);
    }
    @media (max-width: 700px) {
      #backToTop { bottom: 76px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   5. SMOOTH ANCHOR SCROLLING — offset for sticky header
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = document.querySelector('.site-header')?.offsetHeight || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
   6. IMAGE LAZY-LOAD FALLBACK — swap broken images gracefully
   ============================================================ */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function () {
    // Replace with a soft green placeholder
    this.style.background = 'var(--gold-light)';
    this.removeAttribute('src');
    this.alt = '';
  });
});
