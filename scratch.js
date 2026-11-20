const scratchTicket = (() => {
  const cover = document.querySelector("#scratch-cover");
  const progress = document.querySelector("#scratch-progress");
  const brush = cover.getContext("2d", { willReadFrequently: true });
  const { width, height } = cover;
  let pointer = null;

  function reset() {
    pointer = null;
    progress.value = 0;
    if (!brush) return;

    brush.globalCompositeOperation = "source-over";
    const foil = brush.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, "#a6a995");
    foil.addColorStop(0.52, "#e2debe");
    foil.addColorStop(1, "#9c9d89");
    brush.fillStyle = foil;
    brush.fillRect(0, 0, width, height);
    brush.strokeStyle = "rgba(66, 63, 45, .19)";
    brush.lineWidth = 1;
    brush.beginPath();
    for (let x = -height; x < width; x += 9) {
      brush.moveTo(x, height);
      brush.lineTo(x + height, 0);
    }
    brush.stroke();
    brush.fillStyle = "#393b2b";
    brush.textAlign = "center";
    brush.textBaseline = "middle";
    brush.font = 'bold 22px "Microsoft YaHei", sans-serif';
    brush.fillText("在这里刮开", width / 2, height / 2);
    brush.globalCompositeOperation = "destination-out";
    brush.lineCap = "round";
    brush.lineWidth = 38;
  }

  function point(event) {
    const rect = cover.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * width / rect.width,
      y: (event.clientY - rect.top) * height / rect.height,
      id: event.pointerId,
    };
  }

  function bind(onReveal) {
    if (!brush) return;

    function erase(from, to) {
      brush.beginPath();
      brush.moveTo(from.x, from.y);
      brush.lineTo(to.x + 0.01, to.y);
      brush.stroke();

      const pixels = brush.getImageData(0, 0, width, height).data;
      let cleared = 0;
      let samples = 0;
      for (let row = 2; row < height; row += 4) {
        for (let column = 2; column < width; column += 4) {
          if (pixels[(row * width + column) * 4 + 3] < 128) cleared += 1;
          samples += 1;
        }
      }
      progress.value = cleared * 100 / samples;
      if (progress.value === progress.max) {
        pointer = null;
        onReveal();
      }
    }

    cover.addEventListener("pointerdown", (event) => {
      if (pointer || event.button !== 0 || progress.value === progress.max) return;
      pointer = point(event);
      cover.setPointerCapture(event.pointerId);
      erase(pointer, pointer);
    });
    cover.addEventListener("pointermove", (event) => {
      if (pointer?.id !== event.pointerId) return;
      const previous = pointer;
      pointer = point(event);
      erase(previous, pointer);
    });
    cover.addEventListener("lostpointercapture", (event) => {
      if (pointer?.id === event.pointerId) pointer = null;
    });
  }

  return { reset, bind };
})();
