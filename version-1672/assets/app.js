(function () {
  var body = document.body;
  var navToggle = document.querySelector(".nav-toggle");

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var opened = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (query.length === 0) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });

  var filterInput = document.querySelector("[data-filter-input]");
  var filterType = document.querySelector("[data-filter-type]");
  var filterYear = document.querySelector("[data-filter-year]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  if (filterInput && cards.length > 0) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    filterInput.value = query;

    var applyFilter = function () {
      var text = (filterInput.value || "").trim().toLowerCase();
      var type = filterType ? filterType.value : "";
      var year = filterYear ? filterYear.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchText = text === "" || haystack.indexOf(text) !== -1;
        var matchType = type === "" || cardType.indexOf(type) !== -1 || haystack.indexOf(type.toLowerCase()) !== -1;
        var matchYear = year === "" || cardYear === year;
        card.hidden = !(matchText && matchType && matchYear);
      });
    };

    filterInput.addEventListener("input", applyFilter);
    if (filterType) {
      filterType.addEventListener("change", applyFilter);
    }
    if (filterYear) {
      filterYear.addEventListener("change", applyFilter);
    }
    applyFilter();
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    if (slides.length === 0) {
      return;
    }

    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    };

    var restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  });
})();
