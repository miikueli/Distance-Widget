const distanceEl = document.getElementById("distance");
const labelEl = document.getElementById("label");

const params = new URLSearchParams(window.location.search);

const CONFIG = {
  demo: params.get("demo") === "true",
  gpsEnabled: params.get("gps") !== "false",
  label: params.get("label") || "Kuljettu tänään:",
  minMeters: Number(params.get("minMeters") || 10),
  maxAccuracy: Number(params.get("maxAccuracy") || 80),
  maxSpeedKmh: Number(params.get("maxSpeedKmh") || 180)
};

if (params.get("size") === "small") document.body.classList.add("small");
if (params.get("position") === "left") document.body.classList.add("left");
if (params.get("position") === "top") document.body.classList.add("top");

labelEl.textContent = CONFIG.label;

const todayKey = new Date().toISOString().slice(0, 10);
const distanceStorageKey = `miikuliveDistanceKm_${todayKey}`;
const resetCommandKey = "miikuliveDistanceResetCommand";

let distanceKm = Number(localStorage.getItem(distanceStorageKey) || "0");
let lastPoint = null;
let lastSeenResetCommand = localStorage.getItem(resetCommandKey) || "";

function saveDistance() {
  localStorage.setItem(distanceStorageKey, String(distanceKm));
}

function updateDistanceText() {
  distanceEl.textContent = `${distanceKm.toFixed(1)} km`;
}

function resetDistanceFromCommand() {
  distanceKm = 0;
  lastPoint = null;
  saveDistance();
  updateDistanceText();
}

function checkResetCommand() {
  const currentCommand = localStorage.getItem(resetCommandKey) || "";

  if (currentCommand && currentCommand !== lastSeenResetCommand) {
    lastSeenResetCommand = currentCommand;
    resetDistanceFromCommand();
  }
}

// Pollaus, koska IRL Pron eri web overlayt eivät aina lähetä storage-eventtejä.
setInterval(checkResetCommand, 500);

window.addEventListener("storage", (event) => {
  if (event.key === resetCommandKey) {
    checkResetCommand();
  }
});

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function handlePosition(position) {
  checkResetCommand();

  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const accuracy = position.coords.accuracy ?? 9999;
  const now = Date.now();

  if (accuracy > CONFIG.maxAccuracy) {
    updateDistanceText();
    return;
  }

  const currentPoint = { lat, lon, time: now };

  if (!lastPoint) {
    lastPoint = currentPoint;
    updateDistanceText();
    return;
  }

  const segmentKm = haversineKm(lastPoint.lat, lastPoint.lon, lat, lon);
  const segmentMeters = segmentKm * 1000;

  const seconds = Math.max(1, (now - lastPoint.time) / 1000);
  const calculatedSpeedKmh = (segmentKm / seconds) * 3600;

  // Suodatetaan paikallaanolon GPS-värinä ja isot GPS-hypyt.
  if (
    segmentMeters >= CONFIG.minMeters &&
    segmentKm < 2 &&
    calculatedSpeedKmh < CONFIG.maxSpeedKmh
  ) {
    distanceKm += segmentKm;
    saveDistance();
  }

  lastPoint = currentPoint;
  updateDistanceText();
}

function handleGeoError(error) {
  distanceEl.textContent = "GPS ei käytössä";
}

function startGps() {
  if (!CONFIG.gpsEnabled) {
    distanceEl.textContent = "GPS pois";
    return;
  }

  if (!navigator.geolocation) {
    distanceEl.textContent = "GPS ei tuettu";
    return;
  }

  navigator.geolocation.watchPosition(
    handlePosition,
    handleGeoError,
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );
}

function startDemo() {
  let demoDistance = 12.4;
  distanceEl.textContent = `${demoDistance.toFixed(1)} km`;

  setInterval(() => {
    checkResetCommand();
    demoDistance += Math.random() * 0.25;
    if (distanceKm === 0) demoDistance = 0;
    distanceEl.textContent = `${demoDistance.toFixed(1)} km`;
  }, 3000);
}

updateDistanceText();

if (CONFIG.demo) {
  startDemo();
} else {
  startGps();
}
