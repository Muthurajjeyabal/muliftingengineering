/* MU Lifting Engineering — Main JS v2 */
(function () {
  'use strict';

  // Loader
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (loader) {
      setTimeout(function () {
        loader.classList.add('hidden');
      }, 600);
    }
  });

  // Theme
  var html = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // Mobile menu
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Header scroll + back to top
  var header = document.getElementById('header');
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active nav
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link');
  function updateActive() {
    var y = window.scrollY + 100;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var h = sec.offsetHeight;
      var id = sec.getAttribute('id');
      if (y >= top && y < top + h) {
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // Animated counters
  var countersAnimated = false;
  function animateCounters() {
    if (countersAnimated) return;
    var stats = document.getElementById('stats');
    if (!stats) return;
    var rect = stats.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      countersAnimated = true;
      document.querySelectorAll('.stat-card__number').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10) || 0;
        var duration = 1600;
        var start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
  }
  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();

  // Testimonials slider
  var cards = document.querySelectorAll('.testimonial-card');
  var dotsContainer = document.getElementById('testimonialDots');
  var currentSlide = 0;
  var slideTimer;

  if (cards.length && dotsContainer) {
    cards.forEach(function (_, i) {
      var btn = document.createElement('button');
      btn.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      if (i === 0) btn.classList.add('active');
      btn.addEventListener('click', function () { goToSlide(i); });
      dotsContainer.appendChild(btn);
    });

    function goToSlide(n) {
      cards[currentSlide].classList.remove('active');
      dotsContainer.children[currentSlide].classList.remove('active');
      currentSlide = n;
      cards[currentSlide].classList.add('active');
      dotsContainer.children[currentSlide].classList.add('active');
      resetTimer();
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % cards.length);
    }

    function resetTimer() {
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 5500);
    }
    resetTimer();
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Contact form
  var form = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', function (e) {
      // If Formspree action is still placeholder, prevent and show success demo
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        e.preventDefault();
        var name = form.name.value.trim();
        var email = form.email.value.trim();
        var message = form.message.value.trim();
        if (!name || !email || !message) {
          alert('Please fill in all required fields.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Please enter a valid email address.');
          return;
        }
        var btn = document.getElementById('submitBtn');
        if (btn) {
          btn.disabled = true;
          btn.querySelector('.btn-text').textContent = 'Sending...';
        }
        setTimeout(function () {
          form.reset();
          if (formSuccess) formSuccess.hidden = false;
          if (btn) {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Send Enquiry';
          }
          setTimeout(function () {
            if (formSuccess) formSuccess.hidden = true;
          }, 6000);
        }, 700);
      }
      // else: let Formspree handle real submission
    });
  }

  // Year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }
})();
