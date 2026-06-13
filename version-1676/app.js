(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
      toggle.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupFilters() {
    qsa('.filterable-page').forEach(function (page) {
      var input = qs('[data-filter-input]', page);
      var region = qs('[data-filter-region]', page);
      var year = qs('[data-filter-year]', page);
      var type = qs('[data-filter-type]', page);
      var list = qs('[data-filter-list]', page);
      var empty = qs('[data-empty-state]', page);
      var cards = list ? qsa('.movie-card', list) : [];
      var params = new URLSearchParams(window.location.search);
      var keyword = params.get('q') || '';

      if (input && keyword) {
        input.value = keyword;
      }

      function apply() {
        var q = normalize(input ? input.value : '');
        var r = region ? region.value : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.dataset.region !== r) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupImageFallback() {
    qsa('img.movie-cover').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      if (!video || !button) {
        return;
      }
      var started = false;
      var hls = null;

      function playFallback() {
        var mp4 = video.getAttribute('data-mp4');
        if (mp4) {
          video.src = mp4;
          video.load();
          video.play().catch(function () {});
        }
      }

      function start() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        button.classList.add('is-hidden');
        var src = video.getAttribute('data-hls');

        if (window.Hls && window.Hls.isSupported() && src) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 60
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              playFallback();
            }
          });
          return;
        }

        if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.load();
          video.play().catch(function () {});
          return;
        }

        playFallback();
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImageFallback();
    setupPlayers();
  });
})();
