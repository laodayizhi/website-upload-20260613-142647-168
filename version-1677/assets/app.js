(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function openSearch(form) {
    var input = one('input[name="q"]', form);
    var value = input ? input.value.trim() : '';
    if (value) {
      window.location.href = './search.html?q=' + encodeURIComponent(value);
    }
  }

  function initNav() {
    var toggle = one('[data-mobile-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
      toggle.textContent = document.body.classList.contains('nav-open') ? '×' : '☰';
    });
    all('.mobile-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.textContent = '☰';
      });
    });
  }

  function initForms() {
    all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        openSearch(form);
      });
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-to]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var index = 0;
    var timer;
    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-to'), 10));
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function initRails() {
    all('.rail-wrap').forEach(function (wrap) {
      var rail = one('[data-rail]', wrap);
      var prev = one('[data-rail-prev]', wrap);
      var next = one('[data-rail-next]', wrap);
      if (!rail) {
        return;
      }
      function move(amount) {
        rail.scrollBy({ left: amount, behavior: 'smooth' });
      }
      if (prev) {
        prev.addEventListener('click', function () {
          move(-420);
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          move(420);
        });
      }
    });
  }

  function initFilters() {
    var scope = one('[data-filter-scope]');
    if (!scope) {
      return;
    }
    var input = one('[data-filter-keyword]', scope);
    var typeSelect = one('[data-filter-type]', scope);
    var yearSelect = one('[data-filter-year]', scope);
    var empty = one('[data-filter-empty]', scope);
    var grid = scope.parentElement ? one('.filter-grid', scope.parentElement) : null;
    var cards = grid ? all('[data-card]', grid) : [];
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !typeValue || type === typeValue;
        var matchYear = !yearValue || year === yearValue;
        var ok = matchKeyword && matchType && matchYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initPlayer() {
    var video = one('[data-player]');
    if (!video) {
      return;
    }
    var overlay = one('[data-player-start]');
    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    }
    function play() {
      attach();
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
      if (overlay) {
        overlay.hidden = true;
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initForms();
    initHero();
    initRails();
    initFilters();
    initPlayer();
  });
}());
