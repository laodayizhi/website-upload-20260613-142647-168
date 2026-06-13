(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var button = document.getElementById(options.buttonId);
    var hlsInstance = null;
    var attached = false;

    if (!video || !cover || !options.src) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      video.setAttribute("controls", "controls");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(options.src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = options.src;
      }
    };

    var play = function () {
      attach();
      cover.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          video.setAttribute("controls", "controls");
        });
      }
    };

    cover.addEventListener("click", play);
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
