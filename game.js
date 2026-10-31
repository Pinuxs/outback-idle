// Change these values to balance the game. Durations are in seconds.
const ores = {
  copper: { name: 'Copper', seconds: 5, xp: 10, level: 1, colour: '#ba774b', region: 'Surface deposit', description: 'A warm glint in the red dirt. Every trade starts somewhere.' },
  iron: { name: 'Iron', seconds: 7, xp: 18, level: 2, colour: '#82908b', region: 'Rocky escarpment', description: 'Harder stone. Stronger possibilities. Earn your first upgrade.' },
  gold: { name: 'Gold', seconds: 10, xp: 30, level: 5, colour: '#c6a458', region: 'Dry creek bed', description: 'A little patience goes a long way in gold country.' }
};
const SAVE_KEY = 'outback-idle-v1';
let state = { xp: 0, inventory: { copper: 0, iron: 0, gold: 0 } };
let activeOre = null;
let elapsed = 0;
let previousTick = performance.now();
let saveAvailable = true;

// Level 1 needs 100 XP; each following level needs 50 more than the last.
function levelInfo(xp) {
  let level = 1;
  let required = 100;
  while (xp >= required) {
    xp -= required;
    level += 1;
    required += 50;
  }
  return { level, current: xp, required };
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return;
    if (!Number.isSafeInteger(saved.xp) || saved.xp < 0 || saved.xp > 1000000000) throw new Error('Invalid XP');
    for (const id of Object.keys(ores)) {
      if (!Number.isSafeInteger(saved.inventory?.[id]) || saved.inventory[id] < 0) throw new Error('Invalid inventory');
    }
    state = { xp: saved.xp, inventory: { ...saved.inventory } };
  } catch {
    document.getElementById('message').textContent = 'Save could not be loaded. Starting a fresh session.';
  }
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    saveAvailable = true;
    document.getElementById('save-status').textContent = 'Saved on this browser';
  } catch {
    saveAvailable = false;
    document.getElementById('save-status').textContent = 'Saving unavailable';
    document.getElementById('message').textContent = 'Browser storage is unavailable. Progress will be lost when you close this page.';
  }
}

// Build each card from the same data rather than copying its HTML by hand.
function buildCards() {
  document.getElementById('deposits').innerHTML = Object.entries(ores).map(([id, ore]) => `
    <article class="deposit" id="card-${id}" style="--ore:${ore.colour}">
      <div class="card-top"><span>${ore.region}</span><span class="state" id="state-${id}">Available</span></div>
      <div class="ore-art" aria-hidden="true"><div class="rock"></div><div class="ore-glint"></div></div>
      <div class="card-body"><h3>${ore.name} ore</h3><p class="description">${ore.description}</p>
        <div class="stats"><span><b>+1</b> ore</span><span><b>+${ore.xp}</b> XP</span><span><b>${ore.seconds}s</b> / action</span></div>
        <progress id="progress-${id}" value="0" max="${ore.seconds}" aria-label="${ore.name} mining progress"></progress>
        <div class="progress-label"><span id="time-${id}">Waiting to mine</span><span>Level ${ore.level}</span></div>
        <button class="mine-button" id="mine-${id}" aria-pressed="false">Mine ${ore.name.toLowerCase()}</button>
      </div>
    </article>`).join('');
  document.getElementById('inventory-items').innerHTML = Object.entries(ores).map(([id, ore]) => `
    <div class="inventory-item" style="--ore:${ore.colour}"><span class="chip" aria-hidden="true"></span><span>${ore.name} ore</span><strong id="count-${id}">0</strong></div>`).join('');
  for (const id of Object.keys(ores)) {
    document.getElementById(`mine-${id}`).addEventListener('click', () => toggleMining(id));
  }
}

function render() {
  const info = levelInfo(state.xp);
  document.getElementById('level').textContent = info.level;
  document.getElementById('nav-level').textContent = info.level;
  document.getElementById('xp-text').textContent = `${info.current.toLocaleString()} / ${info.required.toLocaleString()} XP`;
  document.getElementById('xp-bar').max = info.required;
  document.getElementById('xp-bar').value = info.current;
  const next = Object.values(ores).find(ore => ore.level > info.level);
  document.getElementById('unlock-text').textContent = next ? `Next discovery: ${next.name} at level ${next.level}` : 'All current deposits unlocked. Keep building your skill.';
  document.getElementById('inventory-total').textContent = Object.values(state.inventory).reduce((a, b) => a + b, 0).toLocaleString();
  for (const [id, ore] of Object.entries(ores)) {
    const locked = info.level < ore.level;
    const active = id === activeOre;
    document.getElementById(`card-${id}`).classList.toggle('active', active);
    const button = document.getElementById(`mine-${id}`);
    button.disabled = locked;
    button.setAttribute('aria-pressed', String(active));
    button.textContent = locked ? `Unlocks at Mining level ${ore.level}` : active ? 'Stop mining' : `Mine ${ore.name.toLowerCase()}`;
    document.getElementById(`state-${id}`).textContent = locked ? 'Locked' : active ? 'Mining' : 'Available';
    document.getElementById(`count-${id}`).textContent = state.inventory[id].toLocaleString();
  }
  document.getElementById('stop-button').disabled = !activeOre;
  document.getElementById('activity-title').textContent = activeOre ? `Mining ${ores[activeOre].name.toLowerCase()}` : 'Ready when you are';
  document.getElementById('activity-detail').textContent = activeOre ? `1 ore every ${ores[activeOre].seconds} seconds. Click again to stop.` : 'Choose a deposit below to start mining.';
  renderProgress();
}

function renderProgress() {
  for (const [id, ore] of Object.entries(ores)) {
    const active = id === activeOre;
    document.getElementById(`progress-${id}`).value = active ? elapsed : 0;
    document.getElementById(`time-${id}`).textContent = active ? `${Math.max(0, ore.seconds - elapsed).toFixed(1)}s remaining` : 'Waiting to mine';
  }
}

function toggleMining(id) {
  if (!ores[id] || levelInfo(state.xp).level < ores[id].level) return;
  activeOre = activeOre === id ? null : id;
  elapsed = 0;
  previousTick = performance.now();
  render();
}

function stopMining() {
  activeOre = null;
  elapsed = 0;
  render();
}

// One shared clock. Each ore supplies its own duration; switching never adds timers.
function tick() {
  const now = performance.now();
  const delta = Math.max(0, (now - previousTick) / 1000);
  previousTick = now;
  if (!activeOre || document.hidden) return;
  elapsed += delta;
  const ore = ores[activeOre];
  const completed = Math.floor(elapsed / ore.seconds);
  if (completed > 0) {
    const oldLevel = levelInfo(state.xp).level;
    state.inventory[activeOre] += completed;
    state.xp += completed * ore.xp;
    elapsed %= ore.seconds;
    saveGame();
    const newLevel = levelInfo(state.xp).level;
    if (saveAvailable) document.getElementById('message').textContent = newLevel > oldLevel ? `Mining level ${newLevel} reached. Check your newly available deposits!` : `Collected ${completed} ${ore.name.toLowerCase()} ore. Keep at it.`;
    render();
  }
  renderProgress();
}

loadGame();
buildCards();
render();
document.getElementById('stop-button').addEventListener('click', stopMining);
// Hidden tabs pause this first version; no accidental offline catch-up rewards.
document.addEventListener('visibilitychange', () => {
  previousTick = performance.now();
  if (document.hidden) saveGame();
});
window.addEventListener('pagehide', saveGame);
setInterval(tick, 100);
