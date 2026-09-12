// ── POI Types & Icons ───────────────────────────────────
const POI_TYPES = {
  player_spawns: 		{ label: 'Player Spawns', 		icon: '🧍', color: '#27ae60' },   
  cities:        		{ label: 'City',        		icon: '🏙️', color: '#3498db' },
  villages:      		{ label: 'Village',      		icon: '🏘️', color: '#2ecc71' },
  industrial: 			{ label: 'Industrial Sites', 	icon: '🏭', color: '#607d8b' }, 
  military_zones: 		{ label: 'Military Zones', 		icon: '🎖️', color: '#b71c1c' },   
  military_checkpoints: { label: 'Military Checkpoints',icon: '🚧', color: '#b71c1c' },     
  wells:         		{ label: 'Well',         		icon: '💧', color: '#1abc9c' },
  secret_locations: 	{ label: 'Unknown Location', 	icon: '❓', color: '#9b59b6' },   
  helicrashes:   		{ label: 'Helicrash',   		icon: '🚁', color: '#e74c3c' },
  military_convoy: 		{ label: 'Convoy', 				icon: '🚚', color: '#8e44ad' },
  police: 				{ label: 'Police Situation', 	icon: '🚧', color: '#2c3e50' },  
  car_spawns: 			{ label: 'Car', 				icon: '🚗', color: '#16a085' },  
  trucks: 				{ label: 'Truck', 				icon: '🚚', color: '#d35400' },
  boat_spawns: 			{ label: 'Boat', 				icon: '🚤', color: '#2980b9' },
  wooden_planks: 	  	{ label: 'Wooden Planks', 		icon: '🪵', color: '#795548' }, 
  contaminated_zones: 	{ label: 'Random Gas Zone', 	icon: '☢️', color: '#f1c40f' },     
  gas_zone: 			{ label: 'Static Gas Zone', 	icon: '☢️', color: '#e67e22' },   
  hens: 				{ label: 'Hens', 				icon: '🐔', color: '#f9e79f' },
  sheep: 				{ label: 'Sheep', 				icon: '🐑', color: '#ecf0f1' },
  goats: 				{ label: 'Goats', 				icon: '🐐', color: '#d5b895' },
  wolves: 				{ label: 'Wolves', 				icon: '🐺', color: '#566573' },
  bears: 				{ label: 'Bears', 				icon: '🐻', color: '#6e2c00' },
  deer: 				{ label: 'Deer', 				icon: '🦌', color: '#a04000' },
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

// Filter panel
const panel = document.createElement('div');
panel.id = 'filter-panel';
panel.style.cssText = `
  background: rgba(0,0,0,0.8); color: #fff;
  padding: 12px 16px; border-radius: 6px;
  font: 13px/1.8 sans-serif;
`;
sidebar.appendChild(panel);   

// ── Filter Panel (grouped) ──────────────────────────────
const GROUPS = [
	{ title: 'Locations', types: ['cities', 'villages', 'industrial', 'military_zones', 'military_checkpoints', 'wells', 'secret_locations'] },
	{ title: 'Events', types: ['helicrashes', 'military_convoy', 'police', 'car_spawns', 'trucks', 'boat_spawns', 'wooden_planks', 'gas_zone', 'contaminated_zones'] },
	{ title: 'Animals', types: ['hens', 'sheep', 'goats', 'wolves', 'bears', 'deer'] },
];

GROUPS.forEach(group => {
	// Section header
	const header = document.createElement('div');
	header.style.cssText = 'font-size:12px; font-weight:bold; color:#EEE; text-transform:uppercase; letter-spacing:1px; margin-top:8px; margin-bottom:4px;';
	header.textContent = group.title;
	panel.appendChild(header);

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
		panel.appendChild(label);

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
panel.appendChild(allBtns);

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
        width: 140px; padding: 4px 8px;
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
sidebar.appendChild(coordBox);

function goToCoords() {
  const val = document.getElementById('coord-field').value.trim();
  const parts = val.split(/[;,\s]+/).map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return;

  const [x, y] = parts;
  const [lat, lng] = gameToLeaflet(x, y);

  map.flyTo([lat, lng], Math.max(map.getZoom(), 6), { duration: 0.5 });

  // Drop a temporary marker
  const tempMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        width: 12px; height: 12px;
        background: #fff; border: 3px solid #e74c3c;
        border-radius: 50%;
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })
  }).addTo(map);

  setTimeout(() => map.removeLayer(tempMarker), 3000);
}

document.getElementById('coord-go').addEventListener('click', goToCoords);
document.getElementById('coord-field').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goToCoords();
});    