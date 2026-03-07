(function () {
  const canvas = document.getElementById("flowerCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const flowers = [];
  const petals = [];
  const FLOWER_COUNT = 21;
  const PETAL_COUNT = 60;
  const TWO_PI = Math.PI * 2;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createFlower(seedX) {
    const x = seedX ?? rand(0.07, 0.93) * width;
    const stemHeight = rand(height * 0.2, height * 0.45);
    const headY = height - stemHeight;
    const size = rand(9, 18);
    return {
      x,
      stemHeight,
      headY,
      size,
      swayAmp: rand(5, 18),
      swaySpeed: rand(0.45, 1.2),
      swayPhase: rand(0, TWO_PI),
      tilt: rand(-0.3, 0.3),
      hueShift: rand(-12, 12),
      leafOffset: rand(0.26, 0.72)
    };
  }

  function createPetal() {
    return {
      x: rand(0, width),
      y: rand(-height * 0.2, height),
      size: rand(4, 9),
      speed: rand(0.3, 1.2),
      drift: rand(-0.55, 0.55),
      phase: rand(0, TWO_PI),
      spin: rand(-0.025, 0.025),
      rot: rand(0, TWO_PI),
      alpha: rand(0.3, 0.75)
    };
  }

  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const rect = canvas.getBoundingClientRect();
    width = Math.max(300, Math.floor(rect.width));
    height = Math.max(380, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    flowers.length = 0;
    for (let i = 0; i < FLOWER_COUNT; i += 1) {
      flowers.push(createFlower((i + 0.5) / FLOWER_COUNT * width + rand(-22, 22)));
    }

    petals.length = 0;
    for (let i = 0; i < PETAL_COUNT; i += 1) {
      petals.push(createPetal());
    }
  }

  function drawPetalShape(x, y, size, rotation, alpha, hueShift) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const grad = ctx.createLinearGradient(0, -size, 0, size);
    grad.addColorStop(0, `hsla(${336 + hueShift}, 88%, 76%, ${alpha})`);
    grad.addColorStop(1, `hsla(${350 + hueShift}, 82%, 58%, ${alpha * 0.9})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.9, -size * 0.75, size * 0.95, size * 0.2, 0, size);
    ctx.bezierCurveTo(-size * 0.95, size * 0.2, -size * 0.9, -size * 0.75, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(flower, t) {
    const sway = Math.sin(t * flower.swaySpeed + flower.swayPhase) * flower.swayAmp;
    const x = flower.x + sway;
    const baseY = height + 8;
    const tipY = flower.headY;

    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(104, 176, 104, 0.95)";
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + sway * 0.28 + flower.tilt * 20, (baseY + tipY) * 0.55, x + sway * 0.16, tipY);
    ctx.stroke();

    const leafY = baseY - flower.stemHeight * flower.leafOffset;
    ctx.fillStyle = "rgba(125, 194, 122, 0.78)";
    ctx.beginPath();
    ctx.ellipse(x + 8, leafY, 10, 4, -0.65, 0, TWO_PI);
    ctx.ellipse(x - 8, leafY - 6, 10, 4, 0.65, 0, TWO_PI);
    ctx.fill();

    const headX = x + sway * 0.18;
    const petalsCount = 8;
    for (let i = 0; i < petalsCount; i += 1) {
      const angle = (TWO_PI / petalsCount) * i + t * 0.16;
      const px = headX + Math.cos(angle) * (flower.size * 0.95);
      const py = tipY + Math.sin(angle) * (flower.size * 0.75);
      drawPetalShape(px, py, flower.size * 0.92, angle, 0.92, flower.hueShift);
    }

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 230, 120, 0.95)";
    ctx.arc(headX, tipY, flower.size * 0.56, 0, TWO_PI);
    ctx.fill();
  }

  function drawBackground() {
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "rgba(255, 229, 241, 0.08)");
    bg.addColorStop(1, "rgba(44, 8, 32, 0.22)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGround() {
    const ground = ctx.createLinearGradient(0, height * 0.82, 0, height);
    ground.addColorStop(0, "rgba(126, 47, 95, 0.06)");
    ground.addColorStop(1, "rgba(63, 13, 45, 0.28)");
    ctx.fillStyle = ground;
    ctx.fillRect(0, height * 0.8, width, height * 0.2);
  }

  function drawFallingPetals(t) {
    for (let i = 0; i < petals.length; i += 1) {
      const p = petals[i];
      p.y += p.speed;
      p.x += Math.sin(t * 0.8 + p.phase) * 0.35 + p.drift;
      p.rot += p.spin;

      if (p.y > height + 14) {
        p.y = rand(-40, -10);
        p.x = rand(-20, width + 20);
      }
      if (p.x < -30) p.x = width + 20;
      if (p.x > width + 30) p.x = -20;

      drawPetalShape(p.x, p.y, p.size, p.rot, p.alpha, rand(-10, 10));
    }
  }

  function tick(ms) {
    const t = ms * 0.001;
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawGround();

    for (let i = 0; i < flowers.length; i += 1) {
      drawFlower(flowers[i], t);
    }

    drawFallingPetals(t);
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
})();
