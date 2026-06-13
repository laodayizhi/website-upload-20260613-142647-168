(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-hero-dot]');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }
    function run() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(current);
        run();
      });
    });
    show(0);
    run();
  }

  function setupFilter() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var input = document.querySelector('[data-filter-keyword]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var region = document.querySelector('[data-filter-region]');
    var cards = selectAll('[data-movie-card]', grid);
    function apply() {
      var q = normalizeText(input && input.value);
      var y = year && year.value;
      var t = type && type.value;
      var r = region && region.value;
      cards.forEach(function (card) {
        var title = normalizeText(card.getAttribute('data-title'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var ok = true;
        if (q && title.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (t && cardType !== t) {
          ok = false;
        }
        if (r && cardRegion.indexOf(r) === -1) {
          ok = false;
        }
        card.classList.toggle('hidden-card', !ok);
      });
    }
    [input, year, type, region].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !input || !results || !window.MOVIES) {
      return;
    }
    function render(query) {
      var q = normalizeText(query);
      var list = window.MOVIES.filter(function (movie) {
        var bucket = normalizeText([movie.title, movie.year, movie.type, movie.region, movie.genre, movie.tags].join(' '));
        return !q || bucket.indexOf(q) !== -1;
      }).slice(0, 120);
      if (!list.length) {
        results.innerHTML = '<div class="content-card"><h2>未找到匹配影片</h2><p>可以换一个影片名称、年份、类型或地区继续搜索。</p></div>';
        return;
      }
      results.innerHTML = list.map(function (movie) {
        return '<a class="movie-card" href="' + movie.url + '">' +
          '<div class="poster-wrap"><img src="./' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy" onerror="this.style.opacity=\'0\'"><span class="poster-badge">' + movie.year + '</span><span class="poster-play">▶</span></div>' +
          '<div class="card-body"><h2 class="card-title">' + movie.title + '</h2><div class="card-meta"><span>' + movie.region + '</span><span>' + movie.type + '</span></div><p class="card-desc">' + movie.oneLine + '</p></div>' +
          '</a>';
      }).join('');
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    render(initial);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var nextUrl = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      render(q);
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, coverId, stream) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    if (!video || !button || !cover || !stream) {
      return;
    }
    var hls = null;
    function start() {
      cover.classList.add('is-hidden');
      video.controls = true;
      if (!video.getAttribute('data-ready')) {
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          var directPlay = video.play();
          if (directPlay && directPlay.catch) {
            directPlay.catch(function () {});
          }
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var parsedPlay = video.play();
            if (parsedPlay && parsedPlay.catch) {
              parsedPlay.catch(function () {});
            }
          });
          return;
        }
        video.src = stream;
      }
      var play = video.play();
      if (play && play.catch) {
        play.catch(function () {});
      }
    }
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!video.getAttribute('data-ready')) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilter();
    setupSearchPage();
  });
})();
