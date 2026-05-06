// =======================
// INIT
// =======================
const peer = new Peer();

let connections = [];
let players = {};

// =======================
// LIMITE TERRAIN (pas les pièces !)
// =======================
const walls = [
  {x:0, y:0, w:1400, h:20},
  {x:0, y:0, w:20, h:900},
  {x:1380, y:0, w:20, h:900},
  {x:0, y:880, w:1400, h:20}
];

// =======================
// HOST READY
// =======================
peer.on('open', id => {

  document.getElementById("code").innerText = id;

  const url = location.origin + "/player.html?host=" + id;

  document.getElementById("qrcode").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
    encodeURIComponent(url);

  addLog("🟢 Serveur prêt");
});

// =======================
// CONNEXION JOUEURS
// =======================
peer.on('connection', conn => {

  connections.push(conn);
  addLog("🔗 Connexion");

  conn.on('data', data => {

    // joueur arrive
    if (data.type === "join") {

      players[conn.peer] = {
        id: data.player.id,
        name: data.player.name,
        color: data.player.color,
        x: 400,
        y: 500,
        vx: 0,
        vy: 0
      };

      addLog("✅ " + data.player.name);
      return;
    }

    // mouvement
    if (data.type === "move") {

      let p = players[conn.peer];
      if (!p) return;

      p.vx = data.vx;
      p.vy = data.vy;
    }

  });

  conn.on('close', () => {
    if (players[conn.peer]) {
      addLog("❌ " + players[conn.peer].name);
      delete players[conn.peer];
    }
  });

});

// =======================
// LOOP
// =======================
setInterval(() => {

  updatePlayers();
  drawPlayers();

}, 16);

// =======================
// UPDATE POSITION
// =======================
function updatePlayers() {

  Object.values(players).forEach(p => {

    let nextX = p.x + p.vx;
    let nextY = p.y + p.vy;

    if (!isColliding(nextX, nextY)) {
      p.x = nextX;
      p.y = nextY;
    }
  });

}

// =======================
// COLLISION SIMPLE (bord seulement)
// =======================
function isColliding(x, y) {

  const size = 20;

  for (let w of walls) {
    if (
      x + size > w.x &&
      x < w.x + w.w &&
      y + size > w.y &&
      y < w.y + w.h
    ) {
      return true;
    }
  }

  return false;
}

// =======================
// AFFICHAGE
// =======================
function drawPlayers() {

  document.querySelectorAll(".player").forEach(p => p.remove());

  Object.values(players).forEach(p => {

    const dot = document.createElement("div");
    dot.className = "player";

    dot.style.left = p.x + "px";
    dot.style.top = p.y + "px";
    dot.style.background = p.color;

    dot.innerText = p.name[0].toUpperCase();

    const label = document.createElement("div");
    label.innerText = p.name;

    label.style.position = "absolute";
    label.style.top = "-14px";
    label.style.left = "-5px";
    label.style.fontSize = "10px";

    dot.appendChild(label);

    document.getElementById("ship").appendChild(dot);

  });

}

// =======================
// LOG
// =======================
function addLog(text) {

  const log = document.getElementById("log");

  const line = document.createElement("div");
  line.innerText = text;

  log.prepend(line);
}
