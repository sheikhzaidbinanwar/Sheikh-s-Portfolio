/* ============================================================
   SHEIKH'S PORTFOLIO — Interactions
   Preloader, navigation, scroll reveals, horizontal portfolio
   gallery, and contact form handling.
   ============================================================ */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Preloader ---------------- */
  const preloader = document.getElementById('preloader');
  const preloaderBar = preloader ? preloader.querySelector('.preloader-bar span') : null;
  const preloaderPct = preloader ? preloader.querySelector('.preloader-pct') : null;

  function hidePreloader() {
    if (!preloader) { initHeroReveal(); return; }
    preloader.classList.add('is-hidden');
    setTimeout(() => { preloader.style.display = 'none'; }, 850);
    initHeroReveal();
  }

  if (preloader) {
    let progress = 0;
    const tick = () => {
      progress += (100 - progress) * 0.12 + 1;
      progress = Math.min(progress, 100);
      if (preloaderBar) preloaderBar.style.width = progress + '%';
      if (preloaderPct) preloaderPct.textContent = Math.floor(progress) + '%';
      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(hidePreloader, 220);
      }
    };
    if (document.readyState === 'complete') {
      requestAnimationFrame(tick);
    } else {
      window.addEventListener('load', () => requestAnimationFrame(tick));
      // Safety net in case load takes too long
      setTimeout(() => requestAnimationFrame(tick), 2200);
    }
  } else {
    initHeroReveal();
  }

  /* ---------------- Hero entrance reveal ---------------- */
  function initHeroReveal() {
    if (!hasGSAP) {
      document.querySelectorAll('.hero .reveal-up, .hero .reveal-line span').forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      initScrollReveals();
      initRestOfApp();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-title .reveal-line span', {
      y: 0,
      duration: prefersReducedMotion ? 0.01 : 1.1,
      stagger: prefersReducedMotion ? 0 : 0.12
    }, 0.1);
    tl.to('.hero .reveal-up', {
      opacity: 1,
      y: 0,
      duration: prefersReducedMotion ? 0.01 : 0.9,
      stagger: prefersReducedMotion ? 0 : 0.1
    }, 0.3);

    initScrollReveals();
    initRestOfApp();
  }

  /* ---------------- Scroll-triggered reveals (rest of page) ---------------- */
  function initScrollReveals() {
    const revealUps = document.querySelectorAll('.section:not(.hero) .reveal-up');
    if (!hasGSAP) {
      revealUps.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }
    revealUps.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: prefersReducedMotion ? 0.01 : 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  /* ---------------- Everything else ---------------- */
  function initRestOfApp() {
    initNav();
    initMobileMenu();
    initActiveLinkTracking();
    initPortfolioScroll();
    initContactForm();
    if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
    syncCarPath();
  }

  /* Re-sync the 3D car's authored path to real section offsets — needed
     because pinning the portfolio gallery changes total document height. */
  function syncCarPath() {
    if (typeof window.__recomputeCarStageBounds === 'function') {
      window.__recomputeCarStageBounds();
    } else {
      // car.js (a module script) may still be loading — try again shortly.
      setTimeout(syncCarPath, 150);
    }
  }

  /* ---------------- Nav background on scroll ---------------- */
  function initNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    const toggleState = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    toggleState();
    window.addEventListener('scroll', toggleState, { passive: true });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------------- Active nav link tracking ---------------- */
  function initActiveLinkTracking() {
    const navLinks = document.querySelectorAll('[data-nav]');
    const sectionIds = ['home', 'about', 'services', 'skills', 'portfolio', 'experience', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------------- Portfolio horizontal scroll ---------------- */
  function initPortfolioScroll() {
    const wrap = document.querySelector('.portfolio-track-wrap');
    const track = document.getElementById('portfolio-track');
    const progressBar = document.getElementById('portfolio-progress-bar');
    if (!wrap || !track) return;

    if (!hasGSAP || !window.ScrollTrigger || prefersReducedMotion) {
      // Fallback: native horizontal scroll with manual progress tracking
      wrap.addEventListener('scroll', () => {
        const max = track.scrollWidth - wrap.clientWidth;
        const pct = max > 0 ? (wrap.scrollLeft / max) * 100 : 0;
        if (progressBar) progressBar.style.width = pct + '%';
      }, { passive: true });
      return;
    }

    wrap.classList.add('is-pinned');

    const section = document.querySelector('.portfolio');

    function getScrollAmount() {
      return track.scrollWidth - wrap.clientWidth;
    }

    const tween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + getScrollAmount(),
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressBar) progressBar.style.width = (self.progress * 100) + '%';
        }
      }
    });
  }

  /* ---------------- Contact form ---------------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        if (status) status.textContent = 'Please fill in every field before sending.';
        return;
      }

      // No backend is wired up yet — open the user's mail client as a
      // functional fallback, pre-filled with the message details.
      const subject = encodeURIComponent(`Project inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      const mailLink = document.querySelector('.contact-email');
      const address = mailLink ? mailLink.textContent.trim() : 'hello@example.com';

      window.location.href = `mailto:${address}?subject=${subject}&body=${body}`;

      if (status) status.textContent = 'Opening your email client to send this message…';
      form.reset();
    });
  }

  /* ---------------- Recompute layout after full load (fonts/images) ---------------- */
  window.addEventListener('load', () => {
    if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
    setTimeout(syncCarPath, 300);
  });
})();
