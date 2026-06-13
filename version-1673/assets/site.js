(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  var filterInput = document.querySelector('.card-filter');

  if (filterInput) {
    var scope = document.querySelector('.filter-scope');
    var cards = scope ? Array.prototype.slice.call(scope.children) : [];

    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-filter-hidden', value && content.indexOf(value) === -1);
      });
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));

  searchInputs.forEach(function (input) {
    var form = input.closest('.site-search');
    var panel = form ? form.querySelector('.site-search-panel') : null;

    if (!panel) {
      return;
    }

    function closePanel() {
      panel.classList.remove('active');
      panel.innerHTML = '';
    }

    function renderResults(value) {
      var query = value.trim().toLowerCase();

      if (!query || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
        closePanel();
        return;
      }

      var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 10);

      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><div></div><div><h3>暂无匹配影片</h3><p>换一个关键词试试</p></div></div>';
        panel.classList.add('active');
        return;
      }

      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<div><h3>' + item.title + '</h3><p>' + item.meta + '</p></div>' +
          '</a>';
      }).join('');

      panel.classList.add('active');
    }

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();

        if (Array.isArray(window.MOVIE_SEARCH_DATA)) {
          var query = input.value.trim().toLowerCase();
          var first = window.MOVIE_SEARCH_DATA.find(function (item) {
            return item.search.indexOf(query) !== -1;
          });

          if (first) {
            window.location.href = first.url;
          }
        }
      }

      if (event.key === 'Escape') {
        closePanel();
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        closePanel();
      }
    });
  });
}());
