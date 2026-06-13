(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupCoverFallbacks() {
        var covers = document.querySelectorAll("img[data-cover]");
        covers.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
                image.setAttribute("aria-hidden", "true");
            });
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var panels = document.querySelectorAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var input = panel.querySelector("[data-filter-input]");
            var reset = panel.querySelector("[data-filter-reset]");
            var result = panel.querySelector("[data-filter-result]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var active = {};
                selects.forEach(function (select) {
                    active[select.getAttribute("data-filter-select")] = normalize(select.value);
                });

                var visibleCount = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" "));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesType = !active.type || normalize(card.getAttribute("data-type")).indexOf(active.type) !== -1;
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matchesYear = !active.year || (active.year === "2021" ? Number(cardYear) <= 2021 : cardYear === active.year);
                    var visible = matchesKeyword && matchesType && matchesYear;
                    card.classList.toggle("is-hidden", !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (result) {
                    result.textContent = "当前显示 " + visibleCount + " / " + cards.length + " 部影片";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    apply();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-video");
            var hasStarted = false;
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                if (hasStarted) {
                    return;
                }
                hasStarted = true;

                if (!source) {
                    setStatus("当前影片暂未配置播放源");
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    setStatus("已使用浏览器原生 HLS 播放能力");
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("HLS 清单加载完成，正在播放");
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放线路加载失败，可刷新页面重试");
                        }
                    });
                    return;
                }

                video.src = source;
                setStatus("浏览器不支持 HLS.js，已尝试直接加载 m3u8 源");
            }

            button.addEventListener("click", function () {
                attachSource();
                video.controls = true;
                player.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击视频播放键");
                    });
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupCoverFallbacks();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });
})();
