/* Portfolio interactions – vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- Scroll-spy for the primary nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav li a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) {
            a.setAttribute('aria-current', 'true');
          } else {
            a.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Career map ---------- */
  var map = document.getElementById('career-map');

  function decimalYear(d) {
    var start = new Date(d.getFullYear(), 0, 1).getTime();
    var end = new Date(d.getFullYear() + 1, 0, 1).getTime();
    return d.getFullYear() + (d.getTime() - start) / (end - start);
  }

  if (map) {
    var bars = Array.prototype.slice.call(map.querySelectorAll('.bar'));
    var grid = map.querySelector('.map__grid');
    var axis = map.querySelector('.map__axis');
    var caption = document.getElementById('map-caption');

    var domainStart = 1997.5;
    var domainEnd = decimalYear(new Date());
    var span = domainEnd - domainStart;

    function pct(year) { return ((year - domainStart) / span) * 100; }

    // Position bars from their data attributes
    bars.forEach(function (bar, i) {
      var s = parseFloat(bar.dataset.start);
      var e = bar.dataset.end === 'now' ? domainEnd : parseFloat(bar.dataset.end);
      bar.style.left = pct(s) + '%';
      bar.style.width = (pct(e) - pct(s)) + '%';
      bar.style.setProperty('--i', i);
      bar.setAttribute('aria-pressed', 'false');
      if (!bar.getAttribute('aria-label')) {
        bar.setAttribute('aria-label', bar.dataset.title + ', ' + bar.dataset.meta);
      }
      bar.dataset.label = bar.textContent;
    });

    // Show a bar's text label only when it fits (avoids clipped fragments)
    function fitLabels() {
      bars.forEach(function (bar) {
        var options = [bar.dataset.label, bar.dataset.short || '', ''];
        for (var k = 0; k < options.length; k++) {
          bar.textContent = options[k];
          if (bar.scrollWidth <= bar.clientWidth) break;
        }
      });
    }
    fitLabels();
    window.addEventListener('resize', fitLabels);

    // Year ticks and labels
    [2005, 2010, 2015, 2020, 2025].forEach(function (y) {
      var tick = document.createElement('span');
      tick.className = 'map__tick';
      tick.style.left = pct(y) + '%';
      grid.appendChild(tick);

      var label = document.createElement('span');
      label.className = 'map__year';
      label.style.left = pct(y) + '%';
      label.textContent = y;
      axis.appendChild(label);
    });
    var first = document.createElement('span');
    first.className = 'map__year map__year--first';
    first.style.left = '0';
    first.textContent = '1997';
    axis.appendChild(first);

    // Caption for the selected bar
    function select(bar) {
      bars.forEach(function (b) { b.setAttribute('aria-pressed', String(b === bar)); });

      caption.textContent = '';
      var title = document.createElement('strong');
      title.textContent = bar.dataset.title;
      var meta = document.createElement('span');
      meta.textContent = bar.dataset.meta;
      var link = document.createElement('a');
      link.href = '#' + bar.dataset.target;
      link.textContent = 'Read the role';

      caption.appendChild(title);
      caption.appendChild(meta);
      caption.appendChild(link);
    }

    bars.forEach(function (bar) {
      bar.addEventListener('click', function () { select(bar); });
      bar.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover)').matches) select(bar);
      });
    });

    var initial = map.querySelector('.bar[data-default="true"]') || bars[0];
    select(initial);

    // Draw the bars in once, when the map first scrolls into view
    if ('IntersectionObserver' in window) {
      var drawn = new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          map.classList.add('is-drawn');
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      drawn.observe(map);
    } else {
      map.classList.add('is-drawn');
    }
  }

  /* ---------- Tabs (Ford focus areas) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function activate(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].classList.toggle('is-active', on);
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); activate(next, true); }
      });
    });

    activate(0, false);
  });
})();
