const distanceEl = document.getElementById("distance");
const labelEl = document.getElementById("label");
const helpEl = document.getElementById("help");
const resetBtn = document.getElementById("resetBtn");

const params = new URLSearchParams(window.location.search);

const CONFIG = {
  demo: params.get("demo") === "true",
  help: params.get("help") === "true",
  controls: params.get("controls") === "true",
  gpsEnabled: params.get("gps") !== "false",
  label: params.get("label") || "Kuljettu tänään:",
  minMeters: Number(params.get("minMeters") || 10),
  maxAccuracy: Number(params.get("maxAccuracy") || 80),
  maxSpeedKmh: Number(params.get("maxSpeedKmh") || 180)
};

if (params.get("size") === "small") document.body.classList.add("small");
if (params.get("position") === "left") document.body.classList.add("left");
if (params.get("position") === "top") document.body.classList.add("top");
if (CONFIG.help) helpEl.classList.remove("hidden");
if (CONFIG.controls) resetBtn.classList.remove("hidden");

labelEl.textContent = CONFIG.label;

const todayKey = new Date().toISOString().slice(0, 10);
const distanceStorageKey = `miikuliveDistanceKm_${todayKey}`;

let distanceKm = Number(localStorage.getItem(distanceStorageKey) || "0");
let lastPoint = null;
let demoTimer = null;

function saveDistance() {
  localStorage.setItem(distanceStorageKey, String(distanceKm));
}

function updateDistanceText() {
  distanceEl.textContent = `${distanceKm.toFixed(1)} km`;
}

function resetDistance() {
  distanceKm = 0;
  lastPoint = null;
  saveDistance();
  updateDistanceText();

  const oldText = resetBtn.textContent;
  resetBtn.textContent = "Nollattu!";
  setTimeout(() => {
    resetBtn.textContent = oldText;
  }, 1200);
}

resetBtn.addEventListener("click", resetDistance);
resetBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  resetDistance();
}, { passive: false });

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
  distanceKm = 12.4;
  updateDistanceText();

  demoTimer = setInterval(() => {
    distanceKm += Math.random() * 0.25;
    updateDistanceText();
  }, 3000);
}

updateDistanceText();

if (CONFIG.demo) {
  startDemo();
} else {
  startGps();
}
