(function () {
  const ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  ready(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
      const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
      const prev = hero.querySelector('[data-hero-prev]');
      const next = hero.querySelector('[data-hero-next]');
      let current = 0;
      let timer = null;

      const show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      };

      const restart = function () {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      };

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          const index = Number(dot.getAttribute('data-hero-dot')) || 0;
          show(index);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        const input = form.querySelector('input[name="q"], input[type="search"]');
        const query = input ? input.value.trim() : '';
        if (query) {
          event.preventDefault();
          window.location.href = './search.html?q=' + encodeURIComponent(query);
        }
      });
    });

    const searchInput = document.querySelector('[data-search-input]');
    const localForm = document.querySelector('[data-local-search-form]');
    const container = document.querySelector('[data-card-container]');
    const emptyState = document.querySelector('[data-empty-state]');
    const sortSelect = document.querySelector('[data-sort-select]');
    const typeButtons = Array.from(document.querySelectorAll('[data-type-filter]'));
    let activeType = 'all';

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const applyFilter = function () {
      if (!container) {
        return;
      }
      const query = normalize(searchInput ? searchInput.value : '');
      const cards = Array.from(container.querySelectorAll('[data-search-card]'));
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' '));
        const type = card.getAttribute('data-type') || '';
        const matchesText = !query || haystack.indexOf(query) !== -1;
        const matchesType = activeType === 'all' || type === activeType;
        const showCard = matchesText && matchesType;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    if (localForm) {
      localForm.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter();
      });
    }

    if (searchInput) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        searchInput.value = q;
      }
      searchInput.addEventListener('input', applyFilter);
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-type-filter') || 'all';
        typeButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });

    if (sortSelect && container) {
      sortSelect.addEventListener('change', function () {
        const cards = Array.from(container.querySelectorAll('[data-search-card]'));
        const mode = sortSelect.value;
        const sorted = cards.sort(function (a, b) {
          if (mode === 'year') {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          }
          if (mode === 'rating') {
            const ar = Number((a.textContent.match(/★\s*(\d+(?:\.\d+)?)/) || [0, 0])[1]);
            const br = Number((b.textContent.match(/★\s*(\d+(?:\.\d+)?)/) || [0, 0])[1]);
            return br - ar;
          }
          return 0;
        });
        sorted.forEach(function (card) {
          container.appendChild(card);
        });
        applyFilter();
      });
    }

    applyFilter();

    const video = document.querySelector('[data-player-video]');
    const overlay = document.querySelector('[data-player-overlay]');
    const playButton = document.querySelector('[data-player-button]');

    if (video && typeof playerSource !== 'undefined') {
      let hlsInstance = null;

      const start = function () {
        if (!video.dataset.ready) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playerSource;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(playerSource);
            hlsInstance.attachMedia(video);
          } else {
            video.src = playerSource;
          }
          video.dataset.ready = '1';
        }

        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      };

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      if (playButton) {
        playButton.addEventListener('click', function (event) {
          event.stopPropagation();
          start();
        });
      }

      video.addEventListener('click', function () {
        if (!video.dataset.ready) {
          start();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
