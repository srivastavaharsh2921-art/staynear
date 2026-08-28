function currentUser() {
  const value = sessionStorage.getItem('staynear_user');
  return value ? JSON.parse(value) : null;
}

function setUser(user) { sessionStorage.setItem('staynear_user', JSON.stringify(user)); }

async function signOut() {
  await api.auth.logout();
  sessionStorage.removeItem('staynear_user');
  window.location.href = 'index.html';
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

function setupNavigation() {
  const user = currentUser();
  const header = document.getElementById('header-actions');
  const mobile = document.getElementById('mobile-nav-actions');
  const markup = user ? `<a href="profile.html" class="btn btn-outline"><span class="icon-user"></span> ${user.name.split(' ')[0]}</a><button id="nav-logout-btn" class="btn btn-text">Logout</button>` : '<a href="login.html" class="btn btn-text">Login</a><a href="signup.html" class="btn btn-primary">Get Started</a>';
  if (header) header.innerHTML = markup;
  if (mobile) mobile.innerHTML = user ? '<a href="profile.html" class="btn btn-outline">Profile</a><button id="mobile-logout-btn" class="btn btn-primary">Logout</button>' : '<a href="login.html" class="btn btn-outline">Login</a><a href="signup.html" class="btn btn-accent">Get Started</a>';
  document.querySelectorAll('#nav-logout-btn, #mobile-logout-btn').forEach(button => button.addEventListener('click', signOut));
  const burger = document.getElementById('burger-menu');
  const nav = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('mobile-backdrop');
  if (burger && nav && backdrop) {
    const toggle = () => { burger.classList.toggle('active'); nav.classList.toggle('active'); backdrop.classList.toggle('active'); };
    burger.addEventListener('click', toggle);
    backdrop.addEventListener('click', toggle);
  }
}

async function initAuthPage(type) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const googleError = params.get('error');
  const errorAlert = document.getElementById('error-alert');
  
  if (token) {
    sessionStorage.setItem('staynear_token', token);
    try {
      const result = await api.auth.me();
      setUser(result.user);
      window.location.href = 'results.html';
      return;
    } catch (e) {
      showError(errorAlert, 'Google login failed');
    }
  } else if (googleError) {
    showError(errorAlert, 'Google authentication failed');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const form = document.getElementById(`${type}-form`);
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById(`${type}-email`).value.trim();
    const password = document.getElementById(`${type}-password`).value;
    try {
      const body = { email, password };
      if (type === 'signup') {
        body.name = document.getElementById('signup-name').value.trim();
        if (password !== document.getElementById('signup-confirm').value) throw new Error('Passwords do not match.');
      }
      const result = await api.auth[type](body);
      setUser(result.user);
      window.location.href = type === 'signup' ? 'onboarding.html' : 'results.html';
    } catch (requestError) { showError(errorAlert, requestError.message); }
  });
}

async function initOnboarding() {
  if (!currentUser()) return window.location.href = 'signup.html';
  const steps = [...document.querySelectorAll('.onboard-step')];
  const state = { ...(currentUser().preferences || {}), name: currentUser().name, stayType: [], amenities: [] };
  let current = 1;
  const next = document.getElementById('onboard-next-btn');
  const previous = document.getElementById('onboard-prev-btn');
  const name = document.getElementById('ob-name');
  document.querySelectorAll('.college-card').forEach(card => card.addEventListener('click', () => { state.college = card.dataset.college; }));
  document.querySelectorAll('.option-card').forEach(card => card.addEventListener('click', () => { card.classList.toggle('selected'); state.stayType = [...document.querySelectorAll('.option-card.selected')].map(item => item.dataset.type); }));
  document.querySelectorAll('.vertical-option').forEach(option => option.addEventListener('click', () => { document.querySelectorAll('.vertical-option').forEach(item => item.classList.remove('selected')); option.classList.add('selected'); state.budget = option.dataset.budget; }));
  document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => { chip.classList.toggle('selected'); state.amenities = [...document.querySelectorAll('.chip.selected')].map(item => item.dataset.facility); }));
  function update() { steps.forEach((step, index) => step.classList.toggle('active', index + 1 === current)); previous.style.visibility = current === 1 ? 'hidden' : 'visible'; next.textContent = current === steps.length ? 'Find My Stay' : 'Continue'; document.getElementById('progress-fill').style.width = `${current / steps.length * 100}%`; document.getElementById('progress-text-label').textContent = `Step ${current} of ${steps.length}`; }
  next.addEventListener('click', async () => { if (current === 1 && !name.value.trim()) return alert('Please enter your name to proceed.'); if (current === 3 && !state.stayType.length) return alert('Please select at least one accommodation type.'); if (current === 4 && !state.budget) return alert('Please select a budget range.'); if (current < steps.length) { if (current === 1) state.name = name.value.trim(); current += 1; update(); return; } await api.user.updateProfile({ name: state.name }); const result = await api.user.updatePreferences(state); const user = currentUser(); user.name = state.name; user.preferences = result.user.preferences; setUser(user); window.location.href = 'results.html'; });
  previous.addEventListener('click', () => { if (current > 1) { current -= 1; update(); } });
  update();
}

function budgetRange(value) { return { 'under-5000': { maxRent: 4999 }, '5000-8000': { minRent: 5000, maxRent: 8000 }, '8000-12000': { minRent: 8000, maxRent: 12000 }, 'above-12000': { minRent: 12001 } }[value] || {}; }

async function initResults() {
  const grid = document.getElementById('properties-grid');
  let filters = { type: 'All', amenities: [], ...budgetRange(currentUser()?.preferences?.budget) };
  const render = async () => { const params = { search: document.getElementById('search-input')?.value || '', type: filters.type, amenities: filters.amenities.join(','), ...budgetRange(filters.budget) }; const result = await api.properties.list(params); const favorites = (await api.favorites.list().catch(() => ({ items: [] }))).items.map(item => String(item.property.id)); sessionStorage.setItem('staynear_favorites', JSON.stringify(favorites)); grid.innerHTML = result.properties.length ? result.properties.map(property => propertyCard(property, favorites)).join('') : '<div class="empty-state"><h3>No stays found</h3><p>Try removing some filters.</p></div>'; grid.querySelectorAll('.fav-btn').forEach(button => button.addEventListener('click', async () => { const id = button.dataset.id; const saved = await toggleApiFavorite(id); button.classList.toggle('active', saved); button.textContent = saved ? '❤️' : '🤍'; })); };
  function propertyCard(property, favorites) { const favorite = favorites.includes(String(property.id)); return `<div class="property-card"><div class="property-card-img-wrapper"><img class="property-card-img" src="${property.image}" alt="${property.name}"><span class="property-badge">${property.type}</span><button class="fav-btn ${favorite ? 'active' : ''}" data-id="${property.id}">${favorite ? '❤️' : '🤍'}</button></div><div class="property-card-body"><div class="property-card-rating">★ ${property.rating} <span>(Verified)</span></div><h3 class="property-card-title">${property.name}</h3><div class="property-card-location">${property.location}</div><div class="property-card-facilities">${property.facilities.slice(0, 3).map(item => `<span class="facility-tag">${item}</span>`).join('')}</div><div class="property-card-footer"><div class="property-card-price"><h4>₹${Number(property.price).toLocaleString()}<span>/month</span></h4></div><a href="property.html?id=${property.id}" class="btn btn-outline">View Details</a></div></div></div>`; }
  async function toggleApiFavorite(id) { if (!currentUser()) { window.location.href = 'login.html'; return false; } const favorites = JSON.parse(sessionStorage.getItem('staynear_favorites') || '[]'); const saved = favorites.includes(id); if (saved) await api.favorites.remove(id); else await api.favorites.add(id); const next = saved ? favorites.filter(item => item !== id) : [...favorites, id]; sessionStorage.setItem('staynear_favorites', JSON.stringify(next)); return !saved; }
  document.getElementById('search-input')?.addEventListener('input', render); document.querySelectorAll('.category-tab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.category-tab').forEach(item => item.classList.remove('active')); tab.classList.add('active'); filters.type = tab.dataset.category; render(); })); document.getElementById('filter-budget')?.addEventListener('change', event => { filters.budget = event.target.value; render(); }); document.querySelectorAll('.amenity-checkbox').forEach(box => box.addEventListener('change', () => { filters.amenities = [...document.querySelectorAll('.amenity-checkbox:checked')].map(item => item.value); render(); })); await render();
}

async function initProperty() { const result = await api.properties.getById(new URLSearchParams(location.search).get('id')); const property = result.property; document.getElementById('prop-name').textContent = property.name; document.getElementById('prop-badge').textContent = property.type; document.getElementById('prop-location').textContent = property.location; document.getElementById('prop-distance').textContent = property.distance; document.getElementById('prop-description').textContent = property.description; document.getElementById('widget-rent').innerHTML = `₹${Number(property.price).toLocaleString()}<span>/month</span>`; document.getElementById('widget-deposit').innerHTML = `<strong>₹${Number(property.deposit).toLocaleString()}</strong> Security Deposit`; document.getElementById('room-occupancy').textContent = property.occupancy; document.getElementById('room-available').textContent = `${property.availableRooms} Rooms`; document.getElementById('room-deposit').textContent = `₹${Number(property.deposit).toLocaleString()}`; document.getElementById('room-type').textContent = property.type; document.getElementById('prop-main-img').src = property.image; document.getElementById('prop-facilities-grid').innerHTML = property.facilities.map(item => `<div class="prop-facility-card"><span>${item}</span></div>`).join(''); document.getElementById('prop-save-btn')?.addEventListener('click', async () => { if (!currentUser()) return window.location.href = 'login.html'; const favorites = JSON.parse(sessionStorage.getItem('staynear_favorites') || '[]'); const saved = favorites.includes(String(property.id)); if (saved) await api.favorites.remove(property.id); else await api.favorites.add(property.id); document.getElementById('prop-save-btn').textContent = saved ? '🤍 Save Property' : '❤️ Saved to Favourites'; sessionStorage.setItem('staynear_favorites', JSON.stringify(saved ? favorites.filter(id => id !== String(property.id)) : [...favorites, String(property.id)])); }); }

function requireLogin() {
  if (!currentUser()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

async function initProfile() { 
  if (!requireLogin()) return;
  try {
    const result = await api.user.getProfile(); const user = result.user; setUser(user); document.getElementById('profile-avatar-letters').textContent = user.name.split(' ').map(item => item[0]).join('').toUpperCase(); document.getElementById('profile-name').textContent = user.name; document.getElementById('profile-email').textContent = user.email; const preferences = user.preferences || {}; document.getElementById('pref-display-college').textContent = preferences.college || 'Not specified'; document.getElementById('pref-display-type').textContent = (preferences.stayType || []).join(', ') || 'Not selected'; document.getElementById('pref-display-budget').textContent = preferences.budget || 'Not specified'; document.getElementById('preferences-form')?.addEventListener('submit', async event => { event.preventDefault(); await api.user.updatePreferences({ budget: document.getElementById('pref-form-budget').value, stayType: [...document.querySelectorAll('.pref-type-checkbox:checked')].map(item => item.value), amenities: [...document.querySelectorAll('.pref-amenity-checkbox:checked')].map(item => item.value) }); alert('Preferences successfully updated!'); });
  } catch (e) {
    signOut();
  }
}

async function initOwner() { 
  if (!requireLogin()) return;
  const form = document.getElementById('owner-form'); const success = document.getElementById('success-banner'); if (!form || !success) return; form.addEventListener('submit', async event => { event.preventDefault(); if (!currentUser()) return window.location.href = 'login.html'; const facilities = [...document.querySelectorAll('.owner-facility:checked')].map(item => item.value); const location = document.getElementById('owner-prop-loc').value.trim(); const rent = Number(document.getElementById('owner-prop-rent').value); const body = { name: document.getElementById('owner-prop-name').value.trim(), type: document.getElementById('owner-prop-type').value, description: document.getElementById('owner-prop-desc').value.trim() || 'Student accommodation near DBUU.', location: { address: location, area: location.split(',')[0], city: 'Dehradun', state: 'Uttarakhand', landmark: 'DBUU' }, pricing: { monthlyRent: rent, securityDeposit: rent }, rooms: { occupancy: 'Single & Double', totalRooms: 1, availableRooms: 1 }, amenities: facilities, images: [] }; try { await api.owner.createProperty(body); form.style.display = 'none'; success.style.display = 'block'; } catch (requestError) { alert(requestError.message); } }); document.getElementById('list-another-btn')?.addEventListener('click', () => { form.reset(); success.style.display = 'none'; form.style.display = 'block'; }); 
}

function initApp() { 
  setupNavigation(); 
  let page = location.pathname.split('/').pop().replace('.html', ''); 
  if (page === '') page = 'index'; // Handle root URL (http://localhost:5000/)
  
  // Make the entire website private (except login and signup)
  const publicPages = ['login', 'signup'];
  if (!publicPages.includes(page) && !currentUser()) {
    window.location.href = 'login.html';
    return;
  }

  if (page === 'signup') initAuthPage('signup'); 
  else if (page === 'login') initAuthPage('login'); 
  else if (page === 'onboarding') initOnboarding(); 
  else if (page === 'results') initResults(); 
  else if (page === 'property') initProperty(); 
  else if (page === 'profile') initProfile(); 
  else if (page === 'owner') initOwner(); 
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp); else initApp();