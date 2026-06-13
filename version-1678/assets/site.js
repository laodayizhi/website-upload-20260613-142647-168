(function () {
    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setImageFallback() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing-image");
                image.removeAttribute("src");
            }, { once: true });
        });
    }

    function setHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setHeroSearch() {
        var input = document.querySelector("[data-hero-search]");
        var link = document.querySelector("[data-hero-search-link]");
        if (!input || !link) {
            return;
        }
        function sync() {
            var value = encodeURIComponent(input.value.trim());
            link.href = value ? "search.html?q=" + value : "search.html";
        }
        input.addEventListener("input", sync);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                sync();
                window.location.href = link.href;
            }
        });
        sync();
    }

    function applyQueryFromUrl() {
        var input = document.querySelector("[data-search-input]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            input.value = q;
        }
    }

    function setFiltering() {
        var grid = document.querySelector("[data-movie-grid]");
        if (!grid) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var category = document.querySelector("[data-category-select]");
        var sort = document.querySelector("[data-sort-select]");
        var empty = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var original = cards.slice();

        function cardValue(card, key) {
            if (key === "views") {
                return Number(card.dataset.views || 0);
            }
            if (key === "rating") {
                return Number(card.dataset.rating || 0);
            }
            if (key === "year") {
                return Number(String(card.dataset.year || "0").replace(/\D/g, "")) || 0;
            }
            if (key === "title") {
                return card.dataset.title || "";
            }
            return 0;
        }

        function update() {
            var keyword = normalize(input ? input.value : "");
            var categoryValue = category ? category.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var hay = normalize((card.dataset.title || "") + " " + (card.dataset.tags || ""));
                var matchKeyword = !keyword || hay.indexOf(keyword) >= 0;
                var matchCategory = !categoryValue || card.dataset.category === categoryValue;
                var show = matchKeyword && matchCategory;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        function reorder() {
            var mode = sort ? sort.value : "default";
            var sorted = mode === "default" ? original.slice() : cards.slice().sort(function (a, b) {
                if (mode === "title") {
                    return String(cardValue(a, mode)).localeCompare(String(cardValue(b, mode)), "zh-Hans-CN");
                }
                return cardValue(b, mode) - cardValue(a, mode);
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            update();
        }

        if (input) {
            input.addEventListener("input", update);
        }
        if (category) {
            category.addEventListener("change", update);
        }
        if (sort) {
            sort.addEventListener("change", reorder);
        }
        applyQueryFromUrl();
        reorder();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setMobileMenu();
        setImageFallback();
        setHero();
        setHeroSearch();
        setFiltering();
    });
})();
