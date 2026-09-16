// ── POI Types & Icons ───────────────────────────────────
const POI_TYPES = {
	// ── Locations (white / light grey) ──
	player_spawns:        { label: 'Player Spawns',         icon: '🧍', color: '#00bcd4' },
	cities:               { label: 'City',                  icon: '🏙️', color: '#f0f0f0' },
	villages:             { label: 'Village',               icon: '🏘️', color: '#c8c8c8' },
	industrial:           { label: 'Industrial Sites',      icon: '🏭', color: '#a8a8a8' },
	military_zones:       { label: 'Military Zones',        icon: '🎖️', color: '#888888' },
	military_checkpoints: { label: 'Military Checkpoints',  icon: '🚧', color: '#787878' },
	wells:                { label: 'Well',                  icon: '💧', color: '#d0d0d0' },
	secret_locations:     { label: 'Unknown Location',      icon: '❓', color: '#b0b0b0' },
	fuel_stations:        { label: 'Fuel Stations',         icon: '⛽', color: '#e0e0e0' },
	medical:              { label: 'Medical',               icon: '💊', color: '#e74c3c' },
	police_stations:      { label: 'Police HQ',             icon: '🚔', color: '#1a5276' },

	// ── Events (red → orange → yellow) ──
	helicrashes:          { label: 'Helicrash',             icon: '🚁', color: '#e74c3c' },
	military_convoy:      { label: 'Convoy',                icon: '🚚', color: '#d4a017' },
	police:               { label: 'Police Situation',      icon: '🚧', color: '#a93226' },
	ambulances:           { label: 'Ambulance',             icon: '🚑', color: '#ff6b6b' },
	car_spawns:           { label: 'Car',                   icon: '🚗', color: '#d35400' },
	trucks:               { label: 'Truck',                 icon: '🚚', color: '#c0392b' },
	boat_spawns:          { label: 'Boat',                  icon: '🚤', color: '#e67e22' },
	wooden_planks:        { label: 'Wooden Planks',         icon: '🪓', color: '#c99700' },
	contaminated_zones:   { label: 'Random Gas Zone',       icon: '☢️', color: '#f1c40f' },
	gas_zone:             { label: 'Static Gas Zone',       icon: '☢️', color: '#e6a817' },

	// ── Animals (green range) ──
	hens:                 { label: 'Hens',                  icon: '🐔', color: '#7dcea0' },
	sheep:                { label: 'Sheep',                 icon: '🐑', color: '#58d68d' },
	goats:                { label: 'Goats',                 icon: '🐐', color: '#2ecc71' },
	wolves:               { label: 'Wolves',                icon: '🐺', color: '#1e8449' },
	bears:                { label: 'Bears',                 icon: '🐻', color: '#196f3d' },
	deer:                 { label: 'Deer',                  icon: '🦌', color: '#145a32' },
};

// ── State ───────────────────────────────────────────────
let pois = [];
let activeTypes = new Set(Object.keys(POI_TYPES)); // all on by default
let markerLayer = L.layerGroup().addTo(map);

// fetching poi data from arrays in poi-data.js
pois = [];
Object.entries(POI_DATA).forEach(([type, items]) => {
  items.forEach(item => pois.push({ ...item, type }));
});
renderPOIs();     

// ── Render ──────────────────────────────────────────────
function renderPOIs() {
	markerLayer.clearLayers();

	const zoom = map.getZoom();
	let size;
	if (zoom <= -3)      size = 16;
	else if (zoom <= -1) size = 24;
	else if (zoom <= 3)  size = 32;
	else                 size = 40;
	const fontSize = Math.round(size * 0.55); 

	pois.forEach(poi => {
		if (!activeTypes.has(poi.type)) return;
		if (!POI_TYPES[poi.type]) return;

		const type = POI_TYPES[poi.type];
		const [lat, lng] = gameToLeaflet(poi.x, poi.y);

		if (poi.type === 'cities' || poi.type === 'villages') {
			const isCity = poi.type === 'cities';
			const fontSize = isCity ? Math.round(size * 1.2) : Math.round(size * 0.9);
			const color = isCity ? '#fff' : '#ededed';

			L.marker([lat, lng], {
				icon: L.divIcon({
					className: '',
					html: `<div style="width:0;height:0;position:relative;">
						<span style="
							position:absolute; bottom:4px; left:50%;
							transform:translateX(-50%);
							color:${color}; white-space:nowrap;
							font:bold ${fontSize}px sans-serif;
							text-shadow: 0 0 4px #000, 0 0 8px #000;
						">${poi.name}</span>
					</div>`,
					iconSize: [0, 0],
					iconAnchor: [0, 0],
				}),
				interactive: false,
			}).addTo(markerLayer).bindPopup(
				`<b>${poi.name}</b><br><small>${poi.x}; ${poi.y}</small>`
			);
		} else if (poi.type === 'industrial' || poi.type === 'military_zones' || poi.type === 'military_checkpoints') {   
			L.marker([lat, lng], {
				icon: L.divIcon({
					className: '',
					html: `<div style="width:0;height:0;position:relative;">
						<span style="
							position:absolute; bottom:${Math.round(size * 0.6)}px; left:50%;
							transform:translateX(-50%);
							color:${(poi.type === 'military_zones' || poi.type === 'military_checkpoints') ? '#FCA5A5' : '#BAB07B'};   white-space:nowrap; text-transform:uppercase;
							font:bold ${Math.round(size * 0.7)}px sans-serif;
							text-shadow: 0 0 4px #000, 0 0 8px #000;
						">${poi.name}</span>
						<span style="
							position:absolute; top:${-Math.round(size / 2)}px; left:50%;
							transform:translateX(-50%);
							font-size:${Math.round(size * 0.8)}px;
						">${type.icon}</span>
					</div>`,
					iconSize: [0, 0],
					iconAnchor: [0, 0],
				}),
				interactive: false,
			}).addTo(markerLayer).bindPopup(
				`<b>${poi.name}</b><br><small>${poi.x}; ${poi.y}</small>`
			);
		} else if (poi.type === 'contaminated_zones' || poi.type === 'gas_zone') {
			L.circle([lat, lng], {
				radius: 200,
				color: type.color,
				fillColor: type.color,
				fillOpacity: 0.3,
				weight: 2,
				dashArray: '6 4',
			}).addTo(markerLayer).bindPopup(
				`<b>${poi.name}</b><br><small>${poi.x}; ${poi.y}</small>`
			);

			L.marker([lat, lng], {
				icon: L.divIcon({
					className: '',
					html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;">${type.icon}</div>`,
					iconSize: [size, size],
					iconAnchor: [size / 2, size / 2],
				}),
				interactive: false,
			}).addTo(markerLayer);
		} else {
			L.marker([lat, lng], {
				icon: L.divIcon({
					className: '',
					html: `<div style="width:${size}px;height:${size}px;background:${type.color};border:1px solid #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;box-shadow:0 2px 4px rgba(0,0,0,0.4);">${type.icon}</div>`,
					iconSize: [size, size],
					iconAnchor: [size / 2, size / 2],
				})
			}).addTo(markerLayer).bindPopup(
				`<b>${poi.name}</b><br><small>${poi.x}; ${poi.y}</small>`
			);
		}
	});
}

map.on('zoomend', renderPOIs);    

// ── Right sidebar (stacked panels) ──────────────────────
const sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.style.cssText = `
  position: fixed; top: 12px; right: 12px; z-index: 1000;
  display: flex; flex-direction: column; gap: 10px;
  width: 240px;
`;
document.body.appendChild(sidebar);

// ── Filter Panel (collapsible) ──────────────────────────
const panel = document.createElement('div');
panel.id = 'filter-panel';
panel.style.cssText = `
  background: rgba(0,0,0,0.8); color: #fff;
  border-radius: 6px; font: 13px/1.8 sans-serif;
  overflow: hidden;
`;
sidebar.appendChild(panel);

// Toggle header
const panelHeader = document.createElement('div');
panelHeader.style.cssText = `
  padding: 10px 16px; cursor: pointer;
  font-weight: bold; font-size: 13px;
  display: flex; justify-content: space-between; align-items: center;
  user-select: none;
`;
panelHeader.innerHTML = `<span>Filters</span><span id="panel-arrow">▼</span>`;
panel.appendChild(panelHeader);

// Collapsible body
const panelBody = document.createElement('div');
panelBody.id = 'panel-body';
panelBody.style.cssText = `
  padding: 0 16px 12px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
`;
panel.appendChild(panelBody);

// Toggle
let panelOpen = true;
panelHeader.addEventListener('click', () => {
  panelOpen = !panelOpen;
  panelBody.style.display = panelOpen ? 'block' : 'none';
  document.getElementById('panel-arrow').textContent = panelOpen ? '▼' : '▶';
});   

// ── Filter Panel (grouped) ──────────────────────────────
const GROUPS = [
	{ title: 'Locations', types: ['player_spawns', 'cities', 'villages', 'industrial', 'medical', 'police_stations', 'military_zones', 'military_checkpoints', 'wells', 'fuel_stations', 'secret_locations'] },
	{ title: 'Events', types: ['helicrashes', 'military_convoy', 'police', 'ambulances', 'car_spawns', 'trucks', 'boat_spawns', 'wooden_planks', 'gas_zone', 'contaminated_zones'] },
	{ title: 'Animals', types: ['hens', 'sheep', 'goats', 'wolves', 'bears', 'deer'] },
];

GROUPS.forEach(group => {
	// Section header
	const header = document.createElement('div');
	header.style.cssText = 'font-size:12px; font-weight:bold; color:#EEE; text-transform:uppercase; letter-spacing:1px; margin-top:8px; margin-bottom:4px;';
	header.textContent = group.title;
	panelBody.appendChild(header);

	// Checkboxes for this group
	group.types.forEach(key => {
		if (!POI_TYPES[key]) return;
		const type = POI_TYPES[key];
		const label = document.createElement('label');
		label.style.cssText = 'display: flex; align-items: center; gap: 8px; cursor: pointer;';
		label.innerHTML = `
			<input type="checkbox" checked data-type="${key}" style="accent-color: ${type.color};">
			<span>${type.icon} ${type.label}</span>
		`;
		panelBody.appendChild(label);

		label.querySelector('input').addEventListener('change', (e) => {
			if (e.target.checked) activeTypes.add(key);
			else activeTypes.delete(key);
			renderPOIs();
		});
	});
});

// ── Show All / Hide All ─────────────────────────────────
const allBtns = document.createElement('div');
allBtns.style.cssText = 'display: flex; gap: 6px; margin-top: 8px;';
panelBody.appendChild(allBtns);

const showAllBtn = document.createElement('button');
showAllBtn.textContent = 'Show All';
showAllBtn.style.cssText = 'flex:1; padding:4px; border:none; border-radius:3px; background:#27ae60; color:#fff; cursor:pointer; font-size:11px;';
showAllBtn.addEventListener('click', () => {
  activeTypes = new Set(Object.keys(POI_TYPES));
  panel.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = true);
  renderPOIs();
});
allBtns.appendChild(showAllBtn);

const hideAllBtn = document.createElement('button');
hideAllBtn.textContent = 'Hide All';
hideAllBtn.style.cssText = 'flex:1; padding:4px; border:none; border-radius:3px; background:#e74c3c; color:#fff; cursor:pointer; font-size:11px;';
hideAllBtn.addEventListener('click', () => {
  activeTypes.clear();
  panel.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
  renderPOIs();
});
allBtns.appendChild(hideAllBtn);   

// Coord panel
const coordBox = document.createElement('div');
coordBox.id = 'coord-input';
coordBox.style.cssText = `
  background: rgba(0,0,0,0.8); color: #fff;
  padding: 10px 14px; border-radius: 6px;
  font: 13px monospace;
`;
coordBox.innerHTML = `
  <label style="display:block; margin-bottom:6px; font-size:11px; color:#aaa;">
    Paste coords (x; y):
  </label>
  <div style="display:flex; gap:6px;">
    <input id="coord-field" type="text" placeholder="2480.5; 3660.2"
      style="
        width: 110px; padding: 4px 8px;
        border: none; border-radius: 3px;
        background: #2c3e50; color: #fff;
        font: 13px monospace;
      ">
    <button id="coord-go"
      style="
        padding: 4px 10px; border: none; border-radius: 3px;
        background: #3498db; color: #fff; cursor: pointer;
        font-size: 13px;
      ">Go</button>
  </div>
`;

coordBox.style.cssText = `
  position: fixed; bottom: 50px; left: 12px; z-index: 1000;
  background: rgba(10,10,10,0.9); color: #ccc;
  border: 1px solid #333; border-radius: 4px;
  padding: 10px 14px;
  font: 12px 'Consolas', monospace;
  width: 180px;
`;
document.body.appendChild(coordBox);

function goToCoords() {
  const val = document.getElementById('coord-field').value.trim();
  const parts = val.split(/[;,\s]+/).map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return;

  const [x, y] = parts;
  const [lat, lng] = gameToLeaflet(x, y);

  map.flyTo([lat, lng], Math.max(map.getZoom(), 0), { duration: 0.5 });

  // Drop a temporary marker
  const tempMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        width: 24px; height: 24px;
        background: #fff; border: 3px solid #e74c3c;
        border-radius: 50%;
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [6, 6],
    })
  }).addTo(map);

  setTimeout(() => map.removeLayer(tempMarker), 3000);
}

// ── Grid Overlay ────────────────────────────────────────
const GRID_SIZE = 1000; // meters between grid lines
let gridLayer = L.layerGroup().addTo(map);
let gridVisible = true;

function drawGrid() {
	gridLayer.clearLayers();
	if (!gridVisible) return;

	for (let i = 0; i <= MAP_SIZE; i += GRID_SIZE) {
		// Horizontal lines
		const [hLat] = gameToLeaflet(0, i);
		L.polyline([[hLat, 0], [hLat, MAP_SIZE]], {
			color: '#fff', weight: 1, opacity: 0.5,
		}).addTo(gridLayer);

		// Vertical lines
		const [, vLng] = gameToLeaflet(i, 0);
		L.polyline([[0, vLng], [MAP_SIZE, vLng]], {
			color: '#fff', weight: 1, opacity: 0.5,
		}).addTo(gridLayer);
	}
}
drawGrid();

// Toggle button
const gridBtn = document.createElement('button');
gridBtn.textContent = 'Grid';
gridBtn.style.cssText = `
  position: fixed; bottom: 12px; left: 196px; z-index: 1000;   
  padding: 6px 12px; border: 1px solid #333; border-radius: 4px;
  background: rgba(10,10,10,0.8); color: #eee;
  font: 12px 'Consolas', monospace; cursor: pointer;
`;
gridBtn.addEventListener('click', () => {
	gridVisible = !gridVisible;
	gridBtn.style.color = gridVisible ? '#eee' : '#bbb';
	drawGrid();
});
document.body.appendChild(gridBtn);

document.getElementById('coord-go').addEventListener('click', goToCoords);
document.getElementById('coord-field').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goToCoords();
});    