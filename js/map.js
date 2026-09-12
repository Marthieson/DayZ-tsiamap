// ── Config ──────────────────────────────────────────────
const MAP_SIZE = 12800; // your map size in meters (adjust to your terrain)

// ── Coordinate helpers ──────────────────────────────────
function gameToLeaflet(x, y) {
  return [y, x]; // [lat, lng] — Y goes up, X goes right
}

function leafletToGame(lat, lng) {
  return [lng, lat]; // [x, y]
}   

// ── Map init ────────────────────────────────────────────
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -3,       // ← was 0, now allows zooming out 8× further
  maxZoom: 2,
  maxBounds: [[0, 0], [MAP_SIZE, MAP_SIZE]],
});

L.imageOverlay('assets/satellite.png',
  [[0, 0], [MAP_SIZE, MAP_SIZE]],
  { opacity: 1 }
).addTo(map);   

map.fitBounds([[0, 0], [MAP_SIZE, MAP_SIZE]], { padding: [0, 0] });

// ── Coordinate display ──────────────────────────────────
const coordsEl = document.getElementById('coords');

map.on('mousemove', (e) => {
  const [x, y] = leafletToGame(e.latlng.lat, e.latlng.lng);
  coordsEl.textContent = `X: ${x.toFixed(1)}  Y: ${y.toFixed(1)}`;
});   