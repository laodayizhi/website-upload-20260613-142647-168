(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupCardFilter() {
        var area = document.querySelector("[data-filter-area]");
        var list = document.querySelector("[data-card-list]");
        if (!area || !list) {
            return;
        }
        var search = area.querySelector("[data-page-search]");
        var type = area.querySelector("[data-type-filter]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : "";
            var selectedType = type ? type.value.trim() : "";
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var typeMatched = !selectedType || text.indexOf(selectedType.toLowerCase()) !== -1;
                var queryMatched = !query || text.indexOf(query) !== -1;
                card.classList.toggle("is-hidden", !(typeMatched && queryMatched));
            });
        }

        if (search) {
            search.addEventListener("input", apply);
        }
        if (type) {
            type.addEventListener("change", apply);
        }
        apply();
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<a class=\"movie-card standard\" href=\"./" + escapeHtml(movie.file) + "\" data-movie-card>",
            "<span class=\"poster-wrap\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span></span>",
            "<span class=\"card-info\"><span class=\"card-title\">" + escapeHtml(movie.title) + "</span>",
            "<span class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>",
            "<span class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</span>",
            "<span class=\"tag-row\">" + tags + "</span>",
            "<span class=\"card-foot\">" + escapeHtml(movie.genre) + "<b>立即观看</b></span></span></a>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var subtitle = document.querySelector("[data-search-subtitle]");
        var form = document.querySelector("[data-search-page-form]");
        if (!results || !window.HONGFEN_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (form) {
            var input = form.querySelector("input[name='q']");
            if (input) {
                input.value = query;
            }
        }
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.HONGFEN_SEARCH_DATA.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.genre, (movie.tags || []).join(" "), movie.year]
                .join(" ")
                .toLowerCase()
                .indexOf(lower) !== -1;
        }).slice(0, 80);
        if (title) {
            title.textContent = "搜索结果";
        }
        if (subtitle) {
            subtitle.textContent = "与“" + query + "”相关的影片";
        }
        if (!matched.length) {
            results.innerHTML = "<div class=\"empty-state\">没有找到相关影片</div>";
            return;
        }
        results.innerHTML = matched.map(createCard).join("");
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCardFilter();
        setupSearchPage();
    });
})();

function initializeMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
        return;
    }
    var frame = video.closest("[data-player]");
    var trigger = frame ? frame.querySelector("[data-play-trigger]") : null;
    var started = false;
    var hlsInstance = null;

    function hideTrigger() {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
    }

    function showTrigger() {
        if (trigger) {
            trigger.classList.remove("is-hidden");
        }
    }

    function playVideo() {
        hideTrigger();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                showTrigger();
            });
        }
    }

    function start() {
        if (started) {
            playVideo();
            return;
        }
        started = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            return;
        }
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
    }

    if (trigger) {
        trigger.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
