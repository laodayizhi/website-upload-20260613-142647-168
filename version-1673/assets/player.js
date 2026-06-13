(function () {
  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('playerCover');
    var hls = null;
    var ready = false;

    if (!video || !sourceUrl) {
      return;
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
        return;
      }

      video.src = sourceUrl;
      video.load();
      playVideo();
    }

    if (cover) {
      cover.addEventListener('click', attachSource);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        attachSource();
      }
    });
  };
}());
