/**
 * StayNear - Core Application Script
 * 
 * Handles state management, UI controllers, filters, search, favorites,
 * user authentication mockups, onboarding workflows, and responsive navigation.
 */

// --- STATE MANAGEMENT HELPERS ---

// Retrieve logged-in user from localStorage
function getCurrentUser() {
  const userJson = localStorage.getItem('staynear_user');
  return userJson ? JSON.parse(userJson) : null;
}

// Log in a simulated user
function setCurrentUser(user) {
  localStorage.setItem('staynear_user', JSON.stringify(user));
}

// Log out the user and clear states
function logout() {
  localStorage.removeItem('staynear_user');
  // Optional: keep preferences or clear them
  window.location.href = 'index.html';
}

// Retrieve onboarding preferences
function getUserPreferences() {
  const prefsJson = localStorage.getItem('staynear_preferences');
  return prefsJson ? JSON.parse(prefsJson) : {
    name: '',
    college: 'Dev Bhoomi Uttarakhand University',
    stayType: [],
    budget: '',
    amenities: []
  };
}

// Save onboarding preferences
function saveUserPreferences(prefs) {
  localStorage.setItem('staynear_preferences', JSON.stringify(prefs));
}

// Retrieve favorited property IDs
function getFavorites() {
  const favsJson = localStorage.getItem('staynear_favorites');
  return favsJson ? JSON.parse(favsJson) : [];
}

// Toggle favorite state for a property ID
function toggleFavorite(id) {
  let favs = getFavorites();
  const index = favs.indexOf(id);
  if (index === -1) {
    favs.push(id);
  } else {
    favs.splice(index, 1);
  }
  localStorage.setItem('staynear_favorites', JSON.stringify(favs));
  return favs.includes(id);
}

// --- COMMON NAVIGATION CONTROLLER ---

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  
  // Identify the current page and initialize specific controllers
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  
  if (page === '' || page === 'index.html') {
    initLandingPage();
  } else if (page === 'signup.html') {
    initSignupPage();
  } else if (page === 'login.html') {
    initLoginPage();
  } else if (page === 'onboarding.html') {
    initOnboardingPage();
  } else if (page === 'results.html') {
    initResultsPage();
  } else if (page === 'property.html') {
    initPropertyDetailsPage();
  } else if (page === 'profile.html') {
    initProfilePage();
  } else if (page === 'owner.html') {
    initOwnerPage();
  }
});

// Require authentication before allowing visitors to leave the landing page
// for a feature that needs an account.
function initLandingPage() {
  const protectedLinks = document.querySelectorAll('[data-auth-required]');

  protectedLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      if (getCurrentUser()) {
        return;
      }

      event.preventDefault();
      const destination = link.getAttribute('href');
      if (destination) {
        window.location.href = `login.html?redirect=${encodeURIComponent(destination)}`;
      }
    });
  });
}

function getAuthRedirect() {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  if (!redirect || redirect.startsWith('/') || redirect.includes(':')) {
    return null;
  }
  return redirect;
}

// Setup mobile menus and active login navigation states
function setupNavigation() {
  const user = getCurrentUser();
  
  // Dynamic header updates based on login state
  const headerActions = document.getElementById('header-actions');
  const mobileNavActions = document.getElementById('mobile-nav-actions');
  
  if (headerActions) {
    if (user) {
      headerActions.innerHTML = `
        <a href="profile.html" class="btn btn-outline" style="border-radius: 50px;">
          <span class="icon-user"></span> ${user.name.split(' ')[0]}
        </a>
        <button id="nav-logout-btn" class="btn btn-text">Logout</button>
      `;
      // Bind logout button
      document.getElementById('nav-logout-btn').addEventListener('click', logout);
    } else {
      headerActions.innerHTML = `
        <a href="login.html" class="btn btn-text">Login</a>
        <a href="login.html" class="btn btn-primary">Get Started</a>
      `;
    }
  }

  if (mobileNavActions) {
    if (user) {
      mobileNavActions.innerHTML = `
        <a href="profile.html" class="btn btn-outline"><span class="icon-user"></span> Profile</a>
        <button id="mobile-logout-btn" class="btn btn-primary">Logout</button>
      `;
      document.getElementById('mobile-logout-btn').addEventListener('click', logout);
    } else {
      mobileNavActions.innerHTML = `
        <a href="login.html" class="btn btn-outline">Login</a>
        <a href="login.html" class="btn btn-accent">Get Started</a>
      `;
    }
  }

  // Hamburger Menu actions
  const burgerMenu = document.getElementById('burger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('mobile-backdrop');
  
  if (burgerMenu && mobileNav && backdrop) {
    const toggleMenu = () => {
      burgerMenu.classList.toggle('active');
      mobileNav.classList.toggle('active');
      backdrop.classList.toggle('active');
      
      // Animate hamburger lines
      const spans = burgerMenu.querySelectorAll('span');
      if (burgerMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    };
    
    burgerMenu.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', toggleMenu);
  }
}

// Password visibility eye helper
function setupPasswordToggle() {
  const toggles = document.querySelectorAll('.password-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = '👁️';
      } else {
        input.type = 'password';
        toggle.innerHTML = '🙈';
      }
    });
  });
}

// --- PAGE CONTROLLERS ---

// 1. Sign Up Page Configuration
function initSignupPage() {
  setupPasswordToggle();
  const signupForm = document.getElementById('signup-form');
  const errorAlert = document.getElementById('error-alert');
  
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;
      
      errorAlert.style.display = 'none';
      
      // Sign Up Field Validations
      if (!name || !email || !password || !confirmPassword) {
        showError("All fields are required.");
        return;
      }
      
      if (!validateEmail(email)) {
        showError("Please enter a valid email address.");
        return;
      }
      
      if (password.length < 6) {
        showError("Password must be at least 6 characters long.");
        return;
      }
      
      if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
      }
      
      // Save simulated user details
      setCurrentUser({ name, email });
      
      // Initialize fresh preferences
      const currentPrefs = getUserPreferences();
      currentPrefs.name = name;
      saveUserPreferences(currentPrefs);
      
      // Redirect to user onboarding flow
      window.location.href = 'onboarding.html';
    });
  }

  function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.style.display = 'block';
  }
}

// Helper to validate email formatting
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 2. Login Page Configuration
function initLoginPage() {
  setupPasswordToggle();
  const loginForm = document.getElementById('login-form');
  const errorAlert = document.getElementById('error-alert');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      errorAlert.style.display = 'none';
      
      if (!email || !password) {
        showError("Please enter both email and password.");
        return;
      }
      
      if (!validateEmail(email)) {
        showError("Please enter a valid email address.");
        return;
      }
      
      // For prototype, simulate success for any non-empty input
      // Extract dummy username prefix from email
      const name = email.split('@')[0].replace('.', ' ');
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      
      setCurrentUser({ name: formattedName, email });
      
      // Sync or retrieve preferences
      const currentPrefs = getUserPreferences();
      if (!currentPrefs.name) {
        currentPrefs.name = formattedName;
        saveUserPreferences(currentPrefs);
      }
      
      // Return to the feature that requested authentication when applicable.
      const redirect = getAuthRedirect();
      window.location.href = redirect || 'results.html';
    });
  }

  function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.style.display = 'block';
  }
}

// 3. Onboarding Multi-step Flow Setup
function initOnboardingPage() {
  // Ensure user is signed in to see onboarding
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'signup.html';
    return;
  }
  
  let currentStep = 1;
  const totalSteps = 5;
  
  const steps = document.querySelectorAll('.onboard-step');
  const nextBtn = document.getElementById('onboard-next-btn');
  const prevBtn = document.getElementById('onboard-prev-btn');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text-label');
  
  // Local onboarding form state variables
  let onboardingState = getUserPreferences();
  
  // Set initial name in Step 1 if available
  const nameInput = document.getElementById('ob-name');
  if (nameInput && onboardingState.name) {
    nameInput.value = onboardingState.name;
  }

  // --- INTERACTIVE CARD BINDINGS ---
  
  // Step 2: College selection (selects card by default)
  const collegeCards = document.querySelectorAll('.college-card');
  collegeCards.forEach(card => {
    card.addEventListener('click', () => {
      collegeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      onboardingState.college = card.dataset.college;
    });
  });
  
  // Step 3: Room Type selection (multi-select allowed)
  const optionCards = document.querySelectorAll('.option-card');
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const type = card.dataset.type;
      
      if (card.classList.contains('selected')) {
        if (!onboardingState.stayType.includes(type)) {
          onboardingState.stayType.push(type);
        }
      } else {
        onboardingState.stayType = onboardingState.stayType.filter(t => t !== type);
      }
    });
  });
  
  // Step 4: Budget selection
  const budgetOptions = document.querySelectorAll('.vertical-option');
  budgetOptions.forEach(option => {
    option.addEventListener('click', () => {
      budgetOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      onboardingState.budget = option.dataset.budget;
    });
  });
  
  // Step 5: Preferences chips
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const facility = chip.dataset.facility;
      
      if (chip.classList.contains('selected')) {
        if (!onboardingState.amenities.includes(facility)) {
          onboardingState.amenities.push(facility);
        }
      } else {
        onboardingState.amenities = onboardingState.amenities.filter(f => f !== facility);
      }
    });
  });
  
  // Update step cards visibility and progress updates
  function updateSteps() {
    steps.forEach((step, idx) => {
      if (idx + 1 === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
    
    // Manage action buttons labels
    if (currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }
    
    if (currentStep === totalSteps) {
      nextBtn.textContent = 'Find My Stay 🚀';
    } else {
      nextBtn.textContent = 'Continue';
    }
    
    // Update progress bar percentage
    const percent = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
  }
  
  // Step transition click listeners
  nextBtn.addEventListener('click', () => {
    if (currentStep === 1) {
      const nameVal = nameInput.value.trim();
      if (!nameVal) {
        alert("Please enter your name to proceed.");
        return;
      }
      onboardingState.name = nameVal;
      // Sync user profile name
      const user = getCurrentUser();
      if (user) {
        user.name = nameVal;
        setCurrentUser(user);
      }
    }
    
    if (currentStep === 3 && onboardingState.stayType.length === 0) {
      alert("Please select at least one accommodation type.");
      return;
    }
    
    if (currentStep === 4 && !onboardingState.budget) {
      alert("Please select a budget range.");
      return;
    }
    
    if (currentStep < totalSteps) {
      currentStep++;
      updateSteps();
    } else {
      // Complete onboarding and save to local storage
      saveUserPreferences(onboardingState);
      window.location.href = 'results.html';
    }
  });
  
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateSteps();
    }
  });
  
  // Initialize steps UI
  updateSteps();
}

// 4. Search & Filters Results Page Setup
function initResultsPage() {
  // Read state and favorites
  const preferences = getUserPreferences();
  let favorites = getFavorites();
  
  // Local DOM references
  const searchInput = document.getElementById('search-input');
  const tabs = document.querySelectorAll('.category-tab');
  const budgetFilter = document.getElementById('filter-budget');
  const amenitiesCheckboxes = document.querySelectorAll('.amenity-checkbox');
  const propertiesGrid = document.getElementById('properties-grid');
  
  // Live filtering parameters state
  let currentSearch = '';
  let activeCategory = 'All'; // Default Tab filter
  let activeBudget = 'All';
  let activeAmenities = [];
  
  // Auto-apply preferences from onboarding step on initial load
  if (preferences.stayType && preferences.stayType.length > 0) {
    // If onboarding preferences exist, pre-select tab if it's singular
    if (preferences.stayType.length === 1) {
      activeCategory = preferences.stayType[0];
      // Select corresponding category tab UI
      tabs.forEach(tab => {
        if (tab.dataset.category.toLowerCase() === activeCategory.toLowerCase()) {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }
      });
    }
  }
  
  if (preferences.budget) {
    activeBudget = preferences.budget;
    if (budgetFilter) {
      budgetFilter.value = activeBudget;
    }
  }
  
  if (preferences.amenities && preferences.amenities.length > 0) {
    activeAmenities = [...preferences.amenities];
    amenitiesCheckboxes.forEach(cb => {
      if (activeAmenities.includes(cb.value)) {
        cb.checked = true;
      }
    });
  }

  // --- RENDER FUNCTION ---
  
  function renderProperties() {
    propertiesGrid.innerHTML = '';
    
    // Filter matching logic
    const filtered = PROPERTIES.filter(item => {
      // 1. Search Query filter (matches name or location)
      const matchesSearch = item.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                            item.location.toLowerCase().includes(currentSearch.toLowerCase());
                            
      // 2. Category Tab Filter (matches Type)
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        // PG matches PG, Shared Room matches Shared Room, Private Room matches Private Room
        matchesCategory = item.type.toLowerCase() === activeCategory.toLowerCase();
      }
      
      // 3. Budget Dropdown Filter
      let matchesBudget = true;
      if (activeBudget !== 'All') {
        const price = item.price;
        if (activeBudget === 'under-5000') {
          matchesBudget = price < 5000;
        } else if (activeBudget === '5000-8000') {
          matchesBudget = price >= 5000 && price <= 8000;
        } else if (activeBudget === '8000-12000') {
          matchesBudget = price >= 8000 && price <= 12000;
        } else if (activeBudget === 'above-12000') {
          matchesBudget = price > 12000;
        }
      }
      
      // 4. Amenities checklist filters
      let matchesAmenities = true;
      if (activeAmenities.length > 0) {
        matchesAmenities = activeAmenities.every(amenity => 
          item.facilities.some(fac => fac.toLowerCase() === amenity.toLowerCase())
        );
      }
      
      return matchesSearch && matchesCategory && matchesBudget && matchesAmenities;
    });
    
    // Display Empty State if no records match
    if (filtered.length === 0) {
      propertiesGrid.style.gridTemplateColumns = '1fr';
      propertiesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No stays found</h3>
          <p>We couldn't find any student accommodations matching your current search criteria. Try removing some filters or adjusting your budget.</p>
          <button id="reset-filters-btn" class="btn btn-primary" style="margin-top: 1rem;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('reset-filters-btn').addEventListener('click', resetAllFilters);
      return;
    }
    
    // Reset layout standard grids
    propertiesGrid.removeAttribute('style');
    
    // Render dynamic card items
    filtered.forEach(prop => {
      const isFav = favorites.includes(prop.id);
      const card = document.createElement('div');
      card.className = 'property-card';
      
      // Render facilities tags (display max 3 on list layout)
      const facilitiesHtml = prop.facilities.slice(0, 3).map(fac => `
        <span class="facility-tag">${fac}</span>
      `).join('');
      
      card.innerHTML = `
        <div class="property-card-img-wrapper">
          <img class="property-card-img" src="${prop.image}" alt="${prop.name}">
          <span class="property-badge">${prop.type}</span>
          <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${prop.id}" title="Save to Favorites">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="property-card-body">
          <div class="property-card-rating">
            <span class="icon-star"></span> ${prop.rating} <span>(Verified)</span>
          </div>
          <h3 class="property-card-title">${prop.name}</h3>
          <div class="property-card-location">
            <span class="icon-loc"></span> ${prop.location}
          </div>
          <div>
            <span class="property-card-distance">${prop.distance}</span>
          </div>
          <div class="property-card-facilities">
            ${facilitiesHtml}
            ${prop.facilities.length > 3 ? `<span class="facility-tag" style="background:var(--border-color); color:var(--text-main)">+${prop.facilities.length - 3}</span>` : ''}
          </div>
          <div class="property-card-footer">
            <div class="property-card-price">
              <h4>₹${prop.price.toLocaleString()}<span>/month</span></h4>
            </div>
            <a href="property.html?id=${prop.id}" class="btn btn-outline">View Details</a>
          </div>
        </div>
      `;
      
      // Bind favorites click listener
      const favBtn = card.querySelector('.fav-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const active = toggleFavorite(prop.id);
        favorites = getFavorites();
        favBtn.classList.toggle('active', active);
        favBtn.innerHTML = active ? '❤️' : '🤍';
      });
      
      propertiesGrid.appendChild(card);
    });
  }

  // --- FILTER BINDINGS ---
  
  // Search Text Keyup
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderProperties();
    });
  }
  
  // Category Tab Click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderProperties();
    });
  });
  
  // Budget dropdown change
  if (budgetFilter) {
    budgetFilter.addEventListener('change', (e) => {
      activeBudget = e.target.value;
      renderProperties();
    });
  }
  
  // Amenities Checkboxes check change
  amenitiesCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      activeAmenities = Array.from(amenitiesCheckboxes)
        .filter(c => c.checked)
        .map(c => c.value);
      renderProperties();
    });
  });
  
  function resetAllFilters() {
    currentSearch = '';
    activeCategory = 'All';
    activeBudget = 'All';
    activeAmenities = [];
    
    if (searchInput) searchInput.value = '';
    if (budgetFilter) budgetFilter.value = 'All';
    amenitiesCheckboxes.forEach(c => c.checked = false);
    tabs.forEach(t => t.classList.remove('active'));
    if (tabs[0]) tabs[0].classList.add('active');
    
    renderProperties();
  }

  // Initial draw
  renderProperties();
}

// 5. Property Details Page Configuration
function initPropertyDetailsPage() {
  // Parse URL query parameter: property.html?id=X
  const params = new URLSearchParams(window.location.search);
  const idStr = params.get('id');
  const id = parseInt(idStr, 10);
  
  const property = PROPERTIES.find(p => p.id === id);
  
  // Redirect to results if property doesn't exist
  if (!property) {
    window.location.href = 'results.html';
    return;
  }
  
  // Update favorite badge initially
  let favorites = getFavorites();
  let isFav = favorites.includes(property.id);
  
  // Bind dynamic page elements
  document.getElementById('prop-name').textContent = property.name;
  document.getElementById('prop-rating').innerHTML = `<span class="icon-star"></span> ${property.rating} (Verified Student Accommodation)`;
  document.getElementById('prop-badge').textContent = property.type;
  document.getElementById('prop-location').textContent = property.location;
  document.getElementById('prop-distance').textContent = property.distance;
  document.getElementById('prop-description').textContent = property.description;
  
  // Booking sidebar elements
  document.getElementById('widget-rent').innerHTML = `₹${property.price.toLocaleString()}<span>/month</span>`;
  document.getElementById('widget-deposit').innerHTML = `<strong>₹${property.deposit.toLocaleString()}</strong> Security Deposit`;
  
  // Room info grid
  document.getElementById('room-occupancy').textContent = property.occupancy;
  document.getElementById('room-available').textContent = `${property.availableRooms} Room${property.availableRooms > 1 ? 's' : ''}`;
  document.getElementById('room-deposit').textContent = `₹${property.deposit.toLocaleString()}`;
  document.getElementById('room-type').textContent = property.type;
  
  // Primary visual setup (Images)
  const mainImage = document.getElementById('prop-main-img');
  const thumbsContainer = document.getElementById('prop-thumbs');
  
  if (mainImage) {
    mainImage.src = property.image;
    mainImage.alt = property.name;
  }
  
  if (thumbsContainer && property.thumbnails) {
    thumbsContainer.innerHTML = '';
    property.thumbnails.forEach((thumbUrl, index) => {
      const thumbBox = document.createElement('div');
      thumbBox.className = 'prop-thumb-box';
      thumbBox.innerHTML = `<img src="${thumbUrl}" alt="Thumbnail image ${index + 1}">`;
      
      // Bind click switch
      thumbBox.addEventListener('click', () => {
        if (mainImage) mainImage.src = thumbUrl;
      });
      thumbsContainer.appendChild(thumbBox);
    });
  }
  
  // Facilities tags grid setup
  const facilitiesGrid = document.getElementById('prop-facilities-grid');
  if (facilitiesGrid) {
    facilitiesGrid.innerHTML = '';
    property.facilities.forEach(fac => {
      // Select appropriate icon class
      let iconClass = 'icon-wifi';
      const fLower = fac.toLowerCase();
      if (fLower.includes('food') || fLower.includes('meal')) iconClass = 'icon-food';
      else if (fLower.includes('laundry') || fLower.includes('wash')) iconClass = 'icon-laundry';
      else if (fLower.includes('security') || fLower.includes('guard')) iconClass = 'icon-security';
      else if (fLower.includes('bath')) iconClass = 'icon-bath';
      else if (fLower.includes('parking') || fLower.includes('car')) iconClass = 'icon-parking';
      else if (fLower.includes('furnish') || fLower.includes('bed')) iconClass = 'icon-furnished';
      
      const card = document.createElement('div');
      card.className = 'prop-facility-card';
      card.innerHTML = `
        <div class="icon ${iconClass}"></div>
        <span>${fac}</span>
      `;
      facilitiesGrid.appendChild(card);
    });
  }
  
  // Favorite button controller
  const saveBtn = document.getElementById('prop-save-btn');
  if (saveBtn) {
    const updateSaveBtnUI = (active) => {
      saveBtn.innerHTML = active ? '❤️ Saved to Favourites' : '🤍 Save Property';
      saveBtn.classList.toggle('btn-outline', !active);
      saveBtn.classList.toggle('btn-primary', active);
    };
    
    updateSaveBtnUI(isFav);
    
    saveBtn.addEventListener('click', () => {
      const active = toggleFavorite(property.id);
      updateSaveBtnUI(active);
    });
  }
  
  // Contact buttons mockups
  const callBtn = document.getElementById('btn-call');
  const waBtn = document.getElementById('btn-whatsapp');
  
  if (callBtn) {
    callBtn.href = `tel:${property.ownerPhone}`;
    callBtn.addEventListener('click', (e) => {
      const user = getCurrentUser();
      if (!user) {
        e.preventDefault();
        alert("Please login or sign up to get direct contact numbers for the property owners.");
        window.location.href = 'login.html';
      }
    });
  }
  
  if (waBtn) {
    const message = encodeURIComponent(`Hi, I found your property "${property.name}" on StayNear. Is it still available for students?`);
    waBtn.href = `https://wa.me/${property.ownerPhone.replace('+', '')}?text=${message}`;
    waBtn.addEventListener('click', (e) => {
      const user = getCurrentUser();
      if (!user) {
        e.preventDefault();
        alert("Please login or sign up to message property owners.");
        window.location.href = 'login.html';
      }
    });
  }
}

// 6. User Profile Page Configuration
function initProfilePage() {
  // Redirect to login if user not authenticated
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Set profile metadata
  document.getElementById('profile-avatar-letters').textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
  
  // Load preferences
  const preferences = getUserPreferences();
  document.getElementById('pref-display-college').textContent = preferences.college;
  document.getElementById('pref-display-type').textContent = preferences.stayType.join(', ') || 'Not selected';
  document.getElementById('pref-display-budget').textContent = formatBudgetText(preferences.budget);
  
  // Fill preferences form controls
  const budgetSelect = document.getElementById('pref-form-budget');
  const typeCheckboxes = document.querySelectorAll('.pref-type-checkbox');
  const amenitiesCheckboxes = document.querySelectorAll('.pref-amenity-checkbox');
  
  if (budgetSelect && preferences.budget) {
    budgetSelect.value = preferences.budget;
  }
  
  typeCheckboxes.forEach(cb => {
    if (preferences.stayType.includes(cb.value)) {
      cb.checked = true;
    }
  });
  
  amenitiesCheckboxes.forEach(cb => {
    if (preferences.amenities.includes(cb.value)) {
      cb.checked = true;
    }
  });
  
  // Preferences Save click handler
  const prefForm = document.getElementById('preferences-form');
  if (prefForm) {
    prefForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newBudget = budgetSelect.value;
      const newTypes = Array.from(typeCheckboxes).filter(c => c.checked).map(c => c.value);
      const newAmenities = Array.from(amenitiesCheckboxes).filter(c => c.checked).map(c => c.value);
      
      preferences.budget = newBudget;
      preferences.stayType = newTypes;
      preferences.amenities = newAmenities;
      
      saveUserPreferences(preferences);
      
      // Update UI displays
      document.getElementById('pref-display-type').textContent = preferences.stayType.join(', ') || 'Not selected';
      document.getElementById('pref-display-budget').textContent = formatBudgetText(preferences.budget);
      
      alert("Preferences successfully updated! These filters will now be pre-applied on your Search Results page.");
    });
  }

  // Draw favorited accommodation cards
  renderSavedProperties();
  
  function renderSavedProperties() {
    const favGrid = document.getElementById('saved-properties-grid');
    const favorites = getFavorites();
    
    if (!favGrid) return;
    
    favGrid.innerHTML = '';
    
    const savedList = PROPERTIES.filter(p => favorites.includes(p.id));
    
    if (savedList.length === 0) {
      favGrid.style.gridTemplateColumns = '1fr';
      favGrid.innerHTML = `
        <div class="empty-state" style="padding: 3rem 1.5rem;">
          <div class="empty-state-icon">❤️</div>
          <h3>No saved properties</h3>
          <p>Tap the heart icon on any accommodation card to save them here for quick access later.</p>
          <a href="results.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Accommodations</a>
        </div>
      `;
      return;
    }
    
    favGrid.removeAttribute('style');
    
    savedList.forEach(prop => {
      const card = document.createElement('div');
      card.className = 'property-card';
      
      const facilitiesHtml = prop.facilities.slice(0, 3).map(fac => `
        <span class="facility-tag">${fac}</span>
      `).join('');
      
      card.innerHTML = `
        <div class="property-card-img-wrapper">
          <img class="property-card-img" src="${prop.image}" alt="${prop.name}">
          <span class="property-badge">${prop.type}</span>
          <button class="fav-btn active" data-id="${prop.id}">❤️</button>
        </div>
        <div class="property-card-body">
          <div class="property-card-rating">
            <span class="icon-star"></span> ${prop.rating} <span>(Verified)</span>
          </div>
          <h3 class="property-card-title">${prop.name}</h3>
          <div class="property-card-location">
            <span class="icon-loc"></span> ${prop.location}
          </div>
          <div class="property-card-facilities">
            ${facilitiesHtml}
          </div>
          <div class="property-card-footer">
            <div class="property-card-price">
              <h4>₹${prop.price.toLocaleString()}<span>/month</span></h4>
            </div>
            <a href="property.html?id=${prop.id}" class="btn btn-outline">View Details</a>
          </div>
        </div>
      `;
      
      // Bind favorites toggle on profile
      card.querySelector('.fav-btn').addEventListener('click', () => {
        toggleFavorite(prop.id);
        renderSavedProperties(); // Re-render grid
      });
      
      favGrid.appendChild(card);
    });
  }
}

// Convert budget codes to readable string
function formatBudgetText(code) {
  if (code === 'under-5000') return 'Under ₹5,000';
  if (code === '5000-8000') return '₹5,000 – ₹8,000';
  if (code === '8000-12000') return '₹8,000 – ₹12,000';
  if (code === 'above-12000') return 'Above ₹12,000';
  return 'Not specified';
}

// 7. Property Owner Listing Page Configuration
function initOwnerPage() {
  const form = document.getElementById('owner-form');
  const successBanner = document.getElementById('success-banner');
  
  if (form && successBanner) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('owner-name').value.trim();
      const phone = document.getElementById('owner-phone').value.trim();
      const propName = document.getElementById('owner-prop-name').value.trim();
      const type = document.getElementById('owner-prop-type').value;
      const rent = document.getElementById('owner-prop-rent').value;
      
      if (!name || !phone || !propName || !type || !rent) {
        alert("Please fill in all the required form fields.");
        return;
      }
      
      // Select facilities
      const facilities = Array.from(document.querySelectorAll('.owner-facility:checked'))
        .map(cb => cb.value);
      
      // Save locally to represent uploaded details
      const ownerUploads = JSON.parse(localStorage.getItem('staynear_owner_listings') || '[]');
      ownerUploads.push({
        ownerName: name,
        ownerPhone: phone,
        propertyName: propName,
        propertyType: type,
        monthlyRent: parseFloat(rent),
        facilities: facilities,
        description: document.getElementById('owner-prop-desc').value.trim(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('staynear_owner_listings', JSON.stringify(ownerUploads));
      
      // Switch layouts to animated success banner
      form.style.display = 'none';
      successBanner.style.display = 'block';
      
      // Scroll to view success banner comfortably
      successBanner.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Bind reset link on success banner to allow adding another property
    const listAnotherBtn = document.getElementById('list-another-btn');
    if (listAnotherBtn) {
      listAnotherBtn.addEventListener('click', () => {
        form.reset();
        successBanner.style.display = 'none';
        form.style.display = 'block';
      });
    }
  }
}
