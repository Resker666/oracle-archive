const scratchTicket = (() => {
  const cover = document.querySelector("#scratch-cover");
  const progress = document.querySelector("#scratch-progress");
  const tiles = [...document.querySelectorAll(".scratch-tile")];
  const tileCount = document.querySelector("#scratch-tile-count");
  const brush = cover.getContext("2d", { willReadFrequently: true });
  const { width, height } = cover;
  let pointer = null;

  function reset() {
    pointer = null;
    progress.value = 0;
    tileCount.textContent = "已刮开 0 / " + tiles.length + " 格";
    for (const tile of tiles) tile.classList.remove("is-cleared");
    if (!brush) return;

    brush.globalCompositeOperation = "source-over";
    const foil = brush.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, "#858c88");
    foil.addColorStop(0.45, "#f5f0dd");
    foil.addColorStop(1, "#8b9d94");
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
    brush.fillStyle = "#373f37";
    brush.textAlign = "center";
    brush.textBaseline = "middle";
    brush.font = "bold 40px sans-serif";
    const tileWidth = width / tiles.length;
    for (let index = 0; index < tiles.length; index += 1) {
      if (index) brush.fillRect(tileWidth * index - 1, 0, 2, height);
      brush.fillText("✷", tileWidth * (index + 0.5), height / 2);
    }
    brush.globalCompositeOperation = "destination-out";
    brush.strokeStyle = "#000";
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
      const cleared = tiles.map(() => 0);
      const samples = tiles.map(() => 0);
      for (let row = 2; row < height; row += 4) {
        for (let column = 2; column < width; column += 4) {
          const index = Math.floor(column * tiles.length / width);
          if (pixels[(row * width + column) * 4 + 3] < 128) cleared[index] += 1;
          samples[index] += 1;
        }
      }
      const coverage = cleared.map((count, index) => count * 100 / samples[index]);
      let open = 0;
      tiles.forEach((tile, index) => {
        const revealed = coverage[index] >= progress.max;
        tile.classList.toggle("is-cleared", revealed);
        if (revealed) open += 1;
      });
      const label = "已刮开 " + open + " / " + tiles.length + " 格";
      if (tileCount.textContent !== label) tileCount.textContent = label;
      const clearedArea = coverage.reduce((total, percent) => total + Math.min(percent, progress.max), 0);
      progress.value = clearedArea / tiles.length;
      if (open === tiles.length) {
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
