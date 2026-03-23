// Hamburger menu toggle
(function () {
  var burger = document.querySelector('.nav-burger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      links.classList.toggle('open');
      burger.setAttribute('aria-expanded', burger.classList.contains('open'));
    });
  }
})();

// Dark mode toggle
(function () {
  var STORAGE_KEY = 'theme-preference';
  var html = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  // Restore saved preference
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    html.setAttribute('data-theme', saved);
  }

  function updateIcon() {
    var isDark = html.getAttribute('data-theme') === 'dark' ||
      (!html.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    // Sun icon for dark mode (click to go light), moon for light mode (click to go dark)
    btn.textContent = isDark ? '\u2600' : '\u263E';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  updateIcon();

  btn.addEventListener('click', function () {
    var current = html.getAttribute('data-theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    var next;
    if (!current) {
      // No override set — toggle opposite of system
      next = systemDark ? 'light' : 'dark';
    } else if (current === 'dark') {
      next = 'light';
    } else {
      next = 'dark';
    }

    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    updateIcon();
  });

  // Update icon if system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateIcon);
})();

// Scroll fade-in observer
(function () {
  var els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  els.forEach(function (el) { observer.observe(el); });
})();
