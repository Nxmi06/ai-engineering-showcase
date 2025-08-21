// Main JS for the portfolio

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const safely = (fn) => {
    try { fn(); } catch (error) { console.error(error); }
  };

document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js loaded');

    // Header background toggle on scroll
    safely(() => {
      const headerElement = document.querySelector('header');
      if (!headerElement) return;
      const onScroll = () => {
        if (window.scrollY > 8) headerElement.classList.add('is-scrolled');
        else headerElement.classList.remove('is-scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    });

    // Create mobile menu toggle button (if not present)
    safely(() => {
      const nav = document.querySelector('header nav');
      const menu = nav?.querySelector('.nav-menu');
      if (!nav || !menu) return;

      if (!menu.id) menu.id = 'primary-menu';

      let toggle = nav.querySelector('.nav-toggle');
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation');
        toggle.setAttribute('aria-controls', menu.id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '☰';
        nav.insertBefore(toggle, nav.firstChild);
      }
      toggle.addEventListener('click', () => {
        const isActive = menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(isActive));
      });
    });

    // Smooth scrolling for in-page nav links
    safely(() => {
      const headerHeightOffset = 80; // approximate sticky header height
      const menu = document.querySelector('.nav-menu');
      const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
      navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          const targetId = link.getAttribute('href');
          if (!targetId || targetId === '#') return;
          const targetEl = document.querySelector(targetId);
          if (!targetEl) return;
          event.preventDefault();
          const top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeightOffset;
          window.scrollTo({ top, behavior: 'smooth' });
          // Close mobile menu if open
          if (menu && menu.classList.contains('active')) menu.classList.remove('active');
        });
      });
    });

    // Active nav link highlighting using IntersectionObserver
    safely(() => {
      const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
      const sectionTargets = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

      const setActive = (id) => {
        navLinks.forEach((link) => {
          const target = link.getAttribute('href');
          if (target === `#${id}`) link.classList.add('active');
          else link.classList.remove('active');
        });
      };

      if (sectionTargets.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
      );

      sectionTargets.forEach((section) => observer.observe(section));
    });

    // Intersection-triggered animations (skills progress + project cards)
    safely(() => {
      // Prepare skill progress bars to animate from 0 to target width
      const progressBars = Array.from(document.querySelectorAll('.progress'));
      progressBars.forEach((bar) => {
        const currentWidth = bar.style.width || '';
        if (currentWidth) {
          bar.dataset.targetWidth = currentWidth;
          bar.style.width = '0%';
        }
      });

      const projectCards = Array.from(document.querySelectorAll('.project-card'));

      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            // Animate progress bar to target width
            if (el.classList.contains('progress')) {
              const target = el.dataset.targetWidth || '0%';
              el.style.width = target;
            }

            // Fade-in project cards
            if (el.classList.contains('project-card')) {
              if (!prefersReducedMotion) {
                el.style.animation = 'fadeInUp 700ms ease-out both';
              }
            }

            obs.unobserve(el);
          });
        },
        { threshold: 0.1 }
      );

      progressBars.forEach((bar) => revealObserver.observe(bar));
      projectCards.forEach((card, idx) => {
        // Staggered delay for a nicer effect
        if (!prefersReducedMotion) card.style.animationDelay = `${idx * 80}ms`;
        revealObserver.observe(card);
      });
    });

    // Optional typing animation for hero subtext
    safely(() => {
      if (prefersReducedMotion) return;
      const heroText = document.querySelector('.hero p');
      if (!heroText) return;
      const fullText = heroText.textContent?.trim() || '';
      if (!fullText) return;
      heroText.textContent = '';
      let index = 0;
      const step = () => {
        if (index <= fullText.length) {
          heroText.textContent = fullText.slice(0, index);
          index += 1;
          setTimeout(step, 35);
        }
      };
      step();
    });

    // Contact form validation + submission handling
    safely(() => {
      const form = document.getElementById('contactForm');
      if (!form || form.dataset.enhanced === '1') return;
      form.dataset.enhanced = '1';

      const nameInput = form.querySelector('#name');
      const emailInput = form.querySelector('#email');
      const messageInput = form.querySelector('#message');
      const nameError = form.querySelector('#nameError');
      const emailError = form.querySelector('#emailError');
      const messageError = form.querySelector('#messageError');
      const formSuccess = form.querySelector('#formSuccess');

      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      const validate = () => {
        let valid = true;
        if (nameInput.value.trim() === '') {
          if (nameError) nameError.textContent = 'Please enter your name.';
          valid = false;
        } else if (nameError) nameError.textContent = '';

        if (emailInput.value.trim() === '') {
          if (emailError) emailError.textContent = 'Please enter your email.';
          valid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
          if (emailError) emailError.textContent = 'Please enter a valid email address.';
          valid = false;
        } else if (emailError) emailError.textContent = '';

        if (messageInput.value.trim() === '') {
          if (messageError) messageError.textContent = 'Please enter your message.';
          valid = false;
        } else if (messageError) messageError.textContent = '';

        return valid;
      };

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validate()) return;

        try {
          // Simulate async submission
          await new Promise((resolve) => setTimeout(resolve, 450));
          form.reset();
          if (formSuccess) {
            formSuccess.style.display = 'block';
            setTimeout(() => { formSuccess.style.display = 'none'; }, 4000);
          }
        } catch (error) {
          console.error('Failed to submit form:', error);
        }
      });
    });

    // Project filter functionality (if filters exist)
    safely(() => {
      const filterContainer = document.querySelector('.projects-filters');
      const cards = Array.from(document.querySelectorAll('.project-card'));
      if (!filterContainer || cards.length === 0) return;

      filterContainer.addEventListener('click', (event) => {
        const button = event.target.closest('[data-filter]');
        if (!button) return;
        const filter = button.dataset.filter;
        cards.forEach((card) => {
          const tags = Array.from(card.querySelectorAll('.project-tags li')).map((li) => li.textContent?.trim().toLowerCase());
          const matches = filter === 'all' || tags.includes(filter?.toLowerCase());
          card.style.display = matches ? '' : 'none';
        });
        // Update active filter button state
        Array.from(filterContainer.querySelectorAll('[data-filter]')).forEach((el) => el.classList.remove('active'));
        button.classList.add('active');
      });
    });

    // Scroll-to-top button
    safely(() => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scroll-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.textContent = '↑';
      // Minimal inline styles to ensure visibility if CSS missing
      btn.style.position = 'fixed';
      btn.style.right = '16px';
      btn.style.bottom = '16px';
      btn.style.width = '40px';
      btn.style.height = '40px';
      btn.style.borderRadius = '999px';
      btn.style.border = '1px solid #e5e7eb';
      btn.style.background = '#ffffff';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      btn.style.cursor = 'pointer';
      btn.style.display = 'none';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';

      document.body.appendChild(btn);

      const updateVis = () => {
        btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
      };
      window.addEventListener('scroll', updateVis, { passive: true });
      updateVis();

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  });
})();

