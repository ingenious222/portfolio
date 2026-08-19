/* ================================================
   main.js — Portfolio interactions
================================================ */

// ── INTRO LOADER ──────────────────────────────────
(function () {
  const intro  = document.getElementById('intro');
  const bar    = document.getElementById('introBar');
  const pct    = document.getElementById('introPct');
  let current  = 0;
  const target = 100;
  const step   = () => {
    const increment = Math.random() * 6 + 1;
    current = Math.min(current + increment, target);
    const v = Math.round(current);
    if (bar) bar.style.width = v + '%';
    if (pct) pct.textContent = v + '%';
    if (current < target) {
      setTimeout(step, 40 + Math.random() * 60);
    } else {
      // Slide intro up
      setTimeout(() => {
        if (intro) {
          intro.style.transition = 'transform .8s cubic-bezier(.76,0,.24,1), opacity .8s ease';
          intro.style.transform  = 'translateY(-100%)';
          intro.style.opacity    = '0';
          setTimeout(() => { intro.style.display = 'none'; }, 900);
        }
        revealPage();
      }, 400);
    }
  };
  step();
})();

// ── PAGE REVEAL ──────────────────────────────────
function revealPage() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero headline letters stagger
  const hl1 = document.getElementById('hl1');
  const hl2 = document.getElementById('hl2');
  if (hl1 && hl2) {
    gsap.from([hl1, hl2], {
      y: 60, opacity: 0, duration: .9,
      stagger: .12, ease: 'power4.out', delay: .1,
    });
  }

  // Hero meta row
  gsap.from('.hero-meta-item', {
    y: 20, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .3,
  });

  // Hero left content
  gsap.from('.hero-tags, .hero-desc, .hero-ctas', {
    y: 24, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', delay: .4,
  });

  // Operator card
  gsap.from('.operator-card', {
    x: 30, opacity: 0, duration: .8, ease: 'power3.out', delay: .55,
  });

  // Stats
  gsap.from('.stat-item', {
    y: 20, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out',
    scrollTrigger: { trigger: '.stats-strip', start: 'top 90%' },
  });
}

// ── STAT COUNTERS ────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target._counted) return;
      entry.target._counted = true;
      const target   = parseInt(entry.target.dataset.target, 10);
      const duration = 1200;
      const start    = performance.now();
      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        entry.target.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else entry.target.textContent = target;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── NAV SCROLL ───────────────────────────────────
function initNav() {
  const nav = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

// ── HAMBURGER MENU ───────────────────────────────
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display  = open ? '' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'fixed';
    links.style.top      = 'var(--nav-h)';
    links.style.left     = '0';
    links.style.right    = '0';
    links.style.padding  = '16px 24px';
    links.style.background = 'var(--bg)';
    links.style.borderBottom = '1px solid var(--line-hard)';
    links.style.zIndex   = '199';
  });
}

// ── PROJECT FILTERS ──────────────────────────────
function initFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card[data-cat]');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ── CONTACT FORM (Formspree) ──────────────────────
function initForm() {
  const form     = document.getElementById('contactForm');
  const btn      = document.getElementById('submitBtn');
  const feedback = document.getElementById('formFeedback');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check endpoint is configured
    const action = form.getAttribute('action') || '';
    if (action.includes('YOUR_CODE')) {
      feedback.textContent = '⚠ Set up your Formspree endpoint first (see README).';
      feedback.style.color = '#cc1111';
      return;
    }

    // Loading state
    const origText = btn.textContent;
    btn.textContent = 'SENDING…';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    feedback.textContent = '';

    try {
      const data = new FormData(form);
      const res  = await fetch(action, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        // Success
        btn.textContent   = 'MESSAGE SENT ✓';
        btn.style.background   = '#16a34a';
        btn.style.borderColor  = '#16a34a';
        btn.style.opacity = '1';
        feedback.textContent   = 'Thanks! I\'ll get back to you soon.';
        feedback.style.color   = '#16a34a';
        form.reset();
        setTimeout(() => {
          btn.textContent = origText;
          btn.style.background  = '';
          btn.style.borderColor = '';
          feedback.textContent  = '';
        }, 5000);
      } else {
        const json = await res.json();
        throw new Error(json.error || 'Submission failed.');
      }
    } catch (err) {
      btn.textContent  = origText;
      btn.style.opacity = '1';
      feedback.textContent = '✗ ' + (err.message || 'Something went wrong. Try again.');
      feedback.style.color = '#cc1111';
    } finally {
      btn.disabled = false;
    }
  });
}

// ── SCROLL REVEAL (fallback without GSAP) ─────────
function initReveal() {
  const els = document.querySelectorAll('.section-title, .cert-card, .ctf-card, .stag, .domain-card');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => {
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(16px)';
    io.observe(el);
  });
}

// ── GSAP SCROLL ANIMS ────────────────────────────
function initScrollAnims() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const animateSection = (trigger, targets, vars = {}) => {
    gsap.from(targets, {
      y: 30, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out',
      ...vars,
      scrollTrigger: { trigger, start: 'top 82%' },
    });
  };

  animateSection('#work',        '.card');
  animateSection('#skills',      '.skill-group');
  animateSection('#credentials', '.cert-card');
  animateSection('#contact',     '.social-link, .form-field');
}

// ── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initNav();
  initHamburger();
  initFilters();
  initForm();
  // Delay scroll anims until GSAP loads
  if (typeof gsap !== 'undefined') {
    initScrollAnims();
  } else {
    initReveal();
    document.addEventListener('gsap:loaded', initScrollAnims);
  }
});
