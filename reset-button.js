const resetBtn = document.getElementById("resetBtn");
const msg = document.getElementById("msg");

const params = new URLSearchParams(window.location.search);

if (params.get("size") === "small") document.body.classList.add("small");
if (params.get("size") === "big") document.body.classList.add("big");

const todayKey = new Date().toISOString().slice(0, 10);
const distanceStorageKey = `miikuliveDistanceKm_${todayKey}`;
const resetCommandKey = "miikuliveDistanceResetCommand";

function showMessage(text) {
  msg.textContent = text;
  msg.classList.remove("hidden");

  setTimeout(() => {
    msg.classList.add("hidden");
  }, 1400);
}

function resetTodayDistance() {
  const command = String(Date.now());

  localStorage.setItem(distanceStorageKey, "0");
  localStorage.setItem(resetCommandKey, command);

  // BroadcastChannel toimii joissain selaimissa, mutta localStorage-pollaus on varmistus.
  try {
    const channel = new BroadcastChannel("miikuliveDistance");
    channel.postMessage({ type: "reset", command });
    channel.close();
  } catch (err) {}

  showMessage("Nollattu");
}

resetBtn.addEventListener("click", resetTodayDistance);

resetBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  resetTodayDistance();
}, { passive: false });
