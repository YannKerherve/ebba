let conn;
const peer = new Peer();

// =======================
// JOUEUR
// =======================
const playerId = Math.random().toString(36).substring(7);
let name = prompt("Nom ?");

let player = {
  id: playerId,
  name: name || "Player",
  color: getColor()
};

function getColor() {
  return "#" + Math.floor(Math.random()*16777215).toString(16);
}

// =======================
// CONNEXION
// =======================
peer.on('open', () => {

  const url = new URLSearchParams(window.location.search);
  const host = url.get("host");

  conn = peer.connect(host);

  conn.on('open', () => {

    document.getElementById("status").innerText = "Connecté";

    conn.send({
      type: "join",
      player: player
    });
  });

});

// =======================
// MOUVEMENT
// =======================
// =======================
// MOUVEMENT PAR APPUI (PAS CONTINU AUTOMATIQUE)
// =======================
let vx = 0;
let vy = 0;

// appui = vitesse
function move(dir) {

  if (dir === "up")    { vx = 0;  vy = -3; }
  if (dir === "down")  { vx = 0;  vy = 3; }
  if (dir === "left")  { vx = -3; vy = 0; }
  if (dir === "right") { vx = 3;  vy = 0; }
}

// relâche = STOP
function stopMove() {
  vx = 0;
  vy = 0;
}

// envoi (toujours)
setInterval(() => {

  if (!conn) return;

  conn.send({
    type: "move",
    vx: vx,
    vy: vy
  });

}, 50);

// événements boutons
window.onload = () => {

  document.querySelectorAll("button").forEach(btn => {

    btn.addEventListener("touchend", stopMove);
    btn.addEventListener("touchcancel", stopMove);
    btn.addEventListener("mouseup", stopMove);

  });

};
