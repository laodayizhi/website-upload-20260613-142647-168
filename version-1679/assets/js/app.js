(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                activate(dotIndex);
                start();
            });
        });

        start();
    }

    function setupSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function setupSearchPage() {
        var root = document.querySelector('[data-search-results]');
        if (!root || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim().toLowerCase();
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = params.get('q') || '';
        }
        if (!query) {
            root.innerHTML = '<div class="content-panel"><h2>输入片名、类型、地区或年份</h2><p>系统会根据关键词展示匹配的影视内容。</p></div>';
            return;
        }
        var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
            return [item.title, item.genre, item.region, item.year, item.tags].join(' ').toLowerCase().indexOf(query) !== -1;
        }).slice(0, 80);
        if (!results.length) {
            root.innerHTML = '<div class="content-panel"><h2>没有找到匹配内容</h2><p>可以尝试更换片名、类型、地区或年份关键词。</p></div>';
            return;
        }
        root.innerHTML = results.map(function (item) {
            return [
                '<a class="search-result-card" href="' + item.url + '">',
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span>',
                '<h2>' + escapeHtml(item.title) + '</h2>',
                '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</p>',
                '<p>' + escapeHtml(item.one_line) + '</p>',
                '</span>',
                '</a>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupVideoPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-source]'));
        shells.forEach(function (shell) {
            var source = shell.getAttribute('data-video-source');
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            if (!source || !video) {
                return;
            }

            function attachSource() {
                if (video.dataset.ready === 'true') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else {
                    video.src = source;
                }
                video.dataset.ready = 'true';
            }

            function play() {
                attachSource();
                if (button) {
                    button.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.dataset.ready !== 'true') {
                    play();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupSearchPage();
        setupVideoPlayers();
    });
}());
