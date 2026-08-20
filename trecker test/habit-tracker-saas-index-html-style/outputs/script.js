const KEY = 'habitly-accounts-v2';
const ADMIN = 'admin@habitly.local';
const $ = (selector) => document.querySelector(selector);
let icon = '✦';
let store = JSON.parse(localStorage.getItem(KEY) || '{"accounts":{},"session":null,"theme":"light"}');
const save = () => localStorage.setItem(KEY, JSON.stringify(store));
const current = () => store.accounts[store.session];
const dateKey = (date = new Date()) => date.toLocaleDateString('en-CA');
const escapeHtml = (value) => { const el = document.createElement('span'); el.textContent = value; return el.innerHTML; };
const avatar = (user) => user.photo || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#ded8ff"/><text x="50" y="64" text-anchor="middle" font-size="46" fill="#705de8" font-family="Arial">' + user.name[0].toUpperCase() + '</text></svg>');
function streak(habit) { let day = new Date(), count = 0; while (habit.done?.[dateKey(day)] === 'complete') { count++; day.setDate(day.getDate() - 1); } return count; }
function modal(id, open) { $(`#${id}`).classList.toggle('open', open); }
function setStatus(id, state) { const user = current(), habit = user.habits.find((h) => h.id === id); habit.done ||= {}; habit.done[dateKey()] = state; user.selected = id; save(); render(); }
function renderAreas(user) {
  $('#areas').innerHTML = `<button class="filter ${user.filter.area === 'all' ? 'active' : ''}" data-area="all">◌ All areas</button>` + user.areas.map((area) => `<button class="filter ${user.filter.area === area ? 'active' : ''}" data-area="${escapeHtml(area)}">◈ ${escapeHtml(area)}</button>`).join('');
  document.querySelectorAll('[data-area]').forEach((button) => button.onclick = () => { user.filter.area = button.dataset.area; save(); render(); });
  $('#area').innerHTML = user.areas.map((area) => `<option>${escapeHtml(area)}</option>`).join('');
}
function renderAdmin() {
  $('#users').innerHTML = Object.values(store.accounts).map((user) => `<tr><td><b>${escapeHtml(user.name)}</b><br><small>${escapeHtml(user.email)}</small></td><td><select data-plan="${user.email}"><option ${user.plan === 'Free' ? 'selected' : ''}>Free</option><option ${user.plan === 'Plus' ? 'selected' : ''}>Plus</option><option ${user.plan === 'Pro' ? 'selected' : ''}>Pro</option></select></td><td>${user.admin ? 'Administrator' : 'Member'}</td><td><button data-access="${user.email}">${user.enabled === false ? 'Enable' : 'Disable'}</button></td></tr>`).join('');
  document.querySelectorAll('[data-plan]').forEach((select) => select.onchange = () => { store.accounts[select.dataset.plan].plan = select.value; save(); render(); });
  document.querySelectorAll('[data-access]').forEach((button) => button.onclick = () => { const user = store.accounts[button.dataset.access]; user.enabled = user.enabled === false; save(); render(); });
}
function render() {
  const user = current(); if (!user) return;
  const picture = avatar(user);
  ['sidePhoto', 'helloPhoto', 'profilePhoto'].forEach((id) => { $(`#${id}`).src = picture; });
  $('#sideName').textContent = user.name; $('#sideRole').textContent = user.plan; $('#hello').textContent = `Здарова, ${user.name}!`;
  $('#profileName').textContent = user.name; $('#profileEmail').textContent = user.email; $('#profilePlan').textContent = user.plan;
  $('#editName').value = user.name; $('#editEmail').value = user.email; $('#plan').value = user.plan;
  $('#adminLink').classList.toggle('hidden', !user.admin); renderAreas(user);
  const matches = user.habits.filter((habit) => (user.filter.time === 'all' || habit.time === user.filter.time) && (user.filter.area === 'all' || habit.area === user.filter.area) && habit.name.toLowerCase().includes(user.filter.search.toLowerCase()));
  const key = dateKey(); $('#habits').className = `habits ${user.filter.layout}`; $('#empty').classList.toggle('hidden', matches.length > 0); $('#meta').textContent = `${matches.length} привычек в вашем ритме`;
  $('#habits').innerHTML = matches.map((habit) => `<article class="habit glass-card ${user.selected === habit.id ? 'selected' : ''}" data-habit="${habit.id}"><div class="top"><span class="badge ${habit.type}">${habit.type === 'break' ? 'BREAK' : 'BUILD'}</span><i class="icon">${habit.icon}</i></div><h3>${escapeHtml(habit.name)}</h3><p>${habit.area} · ${habit.time}</p><button class="state ${habit.done?.[key] === 'complete' ? 'complete' : ''}" data-quick="${habit.id}">✓</button><span class="streak">🔥 ${streak(habit)} дн.</span></article>`).join('');
  document.querySelectorAll('[data-habit]').forEach((card) => card.onclick = (event) => { if (event.target.dataset.quick) return; user.selected = card.dataset.habit; save(); render(); });
  document.querySelectorAll('[data-quick]').forEach((button) => button.onclick = (event) => { event.stopPropagation(); setStatus(button.dataset.quick, 'complete'); });
  const done = user.habits.filter((habit) => habit.done?.[key] === 'complete').length; const percent = user.habits.length ? Math.round(done / user.habits.length * 100) : 0;
  $('#percent').textContent = `${percent}%`; $('#best').textContent = `🔥 ${Math.max(0, ...user.habits.map(streak))}`; $('#selected').textContent = user.habits.find((habit) => habit.id === user.selected)?.name || 'Выберите привычку';
  $('#streaks').innerHTML = user.habits.map((habit) => `<div class="streak-item"><i>${habit.icon}</i><b>${escapeHtml(habit.name)}</b><span class="fire">🔥 ${streak(habit)} дней</span></div>`).join('') || '<small>Пока нет привычек.</small>';
  $('#chart').innerHTML = Array.from({ length: 7 }, (_, index) => { const day = new Date(); day.setDate(day.getDate() - 6 + index); const complete = user.habits.filter((habit) => habit.done?.[dateKey(day)] === 'complete').length; const height = user.habits.length ? Math.max(7, complete / user.habits.length * 100) : 7; return `<div><i style="height:${height}%"></i>${['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][day.getDay()]}</div>`; }).join('');
  if (user.admin) renderAdmin();
}
function showView(id) { document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === id)); document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === id)); }

$('#authForm').onsubmit = (event) => { event.preventDefault(); const email = $('#authEmail').value.trim().toLowerCase(), name = $('#authName').value.trim(), password = $('#authPass').value, existing = store.accounts[email]; if (existing && existing.password !== password) return alert('Неверный пароль'); if (existing && existing.enabled === false) return alert('Доступ к аккаунту ограничен администратором.'); if (!existing) store.accounts[email] = { email, name, password, admin: email === ADMIN, enabled: true, plan: email === ADMIN ? 'Pro' : 'Free', photo: '', habits: [], areas: ['Health', 'Mindset', 'Productivity'], filter: { time: 'all', area: 'all', search: '', layout: 'grid' }, selected: null }; store.session = email; save(); modal('auth', false); render(); };
$('#habitForm').onsubmit = (event) => { event.preventDefault(); const user = current(); user.habits.unshift({ id: String(Date.now()), name: $('#habitName').value.trim(), type: $('#type').value, time: $('#time').value, area: $('#area').value, icon, done: {} }); save(); event.target.reset(); modal('habitModal', false); render(); };
$('#openHabit').onclick = () => modal('habitModal', true); document.querySelectorAll('[data-close]').forEach((button) => button.onclick = () => modal(button.dataset.close, false));
$('#icons').onclick = (event) => { const button = event.target.closest('button'); if (!button) return; icon = button.dataset.icon; document.querySelectorAll('#icons button').forEach((item) => item.classList.toggle('selected', item === button)); };
document.querySelectorAll('[data-view]').forEach((button) => button.onclick = () => showView(button.dataset.view));
document.querySelectorAll('[data-layout]').forEach((button) => button.onclick = () => { current().filter.layout = button.dataset.layout; document.querySelectorAll('[data-layout]').forEach((item) => item.classList.toggle('active', item === button)); save(); render(); });
$('#search').oninput = (event) => { current().filter.search = event.target.value; render(); };
document.querySelectorAll('[data-time]').forEach((button) => button.onclick = () => { current().filter.time = button.dataset.time; document.querySelectorAll('[data-time]').forEach((item) => item.classList.toggle('active', item === button)); save(); render(); });
document.querySelectorAll('[data-action]').forEach((button) => button.onclick = () => { if (current().selected) setStatus(current().selected, button.dataset.action); });
$('#newArea').onclick = () => { const area = prompt('Название новой сферы'); if (area?.trim() && !current().areas.includes(area.trim())) { current().areas.push(area.trim()); save(); render(); } };
$('#logout').onclick = () => { store.session = null; save(); modal('auth', true); };
$('#theme').onclick = () => { store.theme = store.theme === 'dark' ? 'light' : 'dark'; document.body.classList.toggle('dark', store.theme === 'dark'); $('#theme span').textContent = store.theme === 'dark' ? 'Light mode' : 'Dark mode'; save(); };
$('#accountToggle').onclick = () => $('#accountForm').classList.toggle('collapsed');
$('#accountForm').onsubmit = (event) => { event.preventDefault(); const user = current(); user.name = $('#editName').value.trim(); user.email = $('#editEmail').value.trim(); save(); render(); };
$('#photo').onchange = (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { current().photo = reader.result; save(); render(); }; reader.readAsDataURL(file); };
document.body.classList.toggle('dark', store.theme === 'dark'); if (!store.session) modal('auth', true); render();
