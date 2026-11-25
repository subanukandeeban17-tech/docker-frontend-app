const t1Slider = document.getElementById("theta1");
const t2Slider = document.getElementById("theta2");
const t1Val = document.getElementById("theta1-val");
const t2Val = document.getElementById("theta2-val");
const statusBadge = document.getElementById("status-badge");

const wsCanvas = document.getElementById("workspaceCanvas");
const wsCtx = wsCanvas.getContext("2d");

const csCanvas = document.getElementById("cspaceCanvas");
const csCtx = csCanvas.getContext("2d");

const L1 = 95;
const L2 = 75;
const base = { x: 190, y: 240 };
const obstacle = { x: 255, y: 140, r: 26 };

function getArmPoints(deg1, deg2) {
  const r1 = (deg1 * Math.PI) / 180;
  const r2 = ((deg1 + deg2) * Math.PI) / 180;

  const joint2 = {
    x: base.x + L1 * Math.cos(r1),
    y: base.y - L1 * Math.sin(r1),
  };

  const endEffector = {
    x: joint2.x + L2 * Math.cos(r2),
    y: joint2.y - L2 * Math.sin(r2),
  };

  return { joint2, endEffector };
}

function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function isCollision(deg1, deg2) {
  const { joint2, endEffector } = getArmPoints(deg1, deg2);
  const d1 = distToSegment(obstacle, base, joint2);
  const d2 = distToSegment(obstacle, joint2, endEffector);
  return d1 <= obstacle.r + 5 || d2 <= obstacle.r + 5;
}

// Precompute C-space obstacle grid for fast rendering
const cspaceGrid = [];
for (let t1 = 0; t1 <= 180; t1 += 3) {
  for (let t2 = -150; t2 <= 150; t2 += 3) {
    if (isCollision(t1, t2)) {
      cspaceGrid.push({ t1, t2 });
    }
  }
}

function drawWorkspace(deg1, deg2, collision) {
  wsCtx.clearRect(0, 0, wsCanvas.width, wsCanvas.height);

  // Draw table line
  wsCtx.strokeStyle = "#cbd5e1";
  wsCtx.lineWidth = 2;
  wsCtx.beginPath();
  wsCtx.moveTo(20, base.y);
  wsCtx.lineTo(360, base.y);
  wsCtx.stroke();

  // Draw obstacle
  wsCtx.fillStyle = "rgba(239, 68, 68, 0.25)";
  wsCtx.strokeStyle = "#ef4444";
  wsCtx.lineWidth = 2;
  wsCtx.beginPath();
  wsCtx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
  wsCtx.fill();
  wsCtx.stroke();

  wsCtx.fillStyle = "#991b1b";
  wsCtx.font = "12px sans-serif";
  wsCtx.fillText("Obstacle", obstacle.x - 24, obstacle.y + 4);

  const { joint2, endEffector } = getArmPoints(deg1, deg2);

  // Draw links
  wsCtx.strokeStyle = collision ? "#dc2626" : "#2563eb";
  wsCtx.lineWidth = 8;
  wsCtx.lineCap = "round";

  wsCtx.beginPath();
  wsCtx.moveTo(base.x, base.y);
  wsCtx.lineTo(joint2.x, joint2.y);
  wsCtx.lineTo(endEffector.x, endEffector.y);
  wsCtx.stroke();

  // Draw joints
  [base, joint2, endEffector].forEach((pt, idx) => {
    wsCtx.fillStyle = idx === 2 ? "#10b981" : "#1e293b";
    wsCtx.beginPath();
    wsCtx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
    wsCtx.fill();
  });
}

function drawCSpace(deg1, deg2, collision) {
  csCtx.clearRect(0, 0, csCanvas.width, csCanvas.height);

  const pad = 40;
  const w = csCanvas.width - pad * 2;
  const h = csCanvas.height - pad * 2;

  const mapX = (t1) => pad + (t1 / 180) * w;
  const mapY = (t2) => pad + ((150 - t2) / 300) * h;

  // Axes
  csCtx.strokeStyle = "#94a3b8";
  csCtx.lineWidth = 1.5;
  csCtx.strokeRect(pad, pad, w, h);

  csCtx.fillStyle = "#475569";
  csCtx.font = "12px sans-serif";
  csCtx.fillText("θ1 (0° to 180°)", pad + w / 2 - 40, csCanvas.height - 12);
  csCtx.fillText("θ2", 12, pad + h / 2);

  // Draw C-space obstacle region
  csCtx.fillStyle = "rgba(239, 68, 68, 0.35)";
  cspaceGrid.forEach(({ t1, t2 }) => {
    csCtx.fillRect(mapX(t1) - 3, mapY(t2) - 3, 6, 6);
  });

  // Draw current configuration dot
  const cx = mapX(deg1);
  const cy = mapY(deg2);

  csCtx.fillStyle = collision ? "#dc2626" : "#2563eb";
  csCtx.beginPath();
  csCtx.arc(cx, cy, 7, 0, Math.PI * 2);
  csCtx.fill();

  csCtx.strokeStyle = "#ffffff";
  csCtx.lineWidth = 2;
  csCtx.stroke();

  csCtx.fillStyle = "#0f172a";
  csCtx.font = "bold 12px sans-serif";
  csCtx.fillText(`(${deg1}°, ${deg2}°)`, Math.min(cx + 10, csCanvas.width - 75), Math.max(cy - 8, 20));
}

function update() {
  const deg1 = Number(t1Slider.value);
  const deg2 = Number(t2Slider.value);

  t1Val.textContent = deg1;
  t2Val.textContent = deg2;

  const collision = isCollision(deg1, deg2);

  if (collision) {
    statusBadge.textContent = "Status: Collision! (Inside Red Zone)";
    statusBadge.classList.add("collision");
  } else {
    statusBadge.textContent = "Status: Safe Pose";
    statusBadge.classList.remove("collision");
  }

  drawWorkspace(deg1, deg2, collision);
  drawCSpace(deg1, deg2, collision);
}

t1Slider.addEventListener("input", update);
t2Slider.addEventListener("input", update);

update();
