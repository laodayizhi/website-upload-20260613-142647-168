(function () {
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve();
                return;
            }
            var script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function attachStream(video, stream) {
        if (!video || !stream) {
            return Promise.reject(new Error("no stream"));
        }
        if (video.dataset.ready === "1") {
            return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.dataset.ready = "1";
            return Promise.resolve();
        }
        var setWithHls = function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.dataset.ready = "1";
                return Promise.resolve();
            }
            video.src = stream;
            video.dataset.ready = "1";
            return Promise.resolve();
        };
        if (window.Hls) {
            return setWithHls();
        }
        return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js").then(setWithHls).catch(function () {
            video.src = stream;
            video.dataset.ready = "1";
        });
    }

    function setPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (box) {
            var video = box.querySelector("video[data-stream]");
            var button = box.querySelector("[data-play]");
            if (!video) {
                return;
            }
            var start = function () {
                var stream = video.getAttribute("data-stream");
                attachStream(video, stream).then(function () {
                    box.classList.add("playing");
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                });
            };
            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("play", function () {
                box.classList.add("playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    box.classList.remove("playing");
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", setPlayers);
})();
