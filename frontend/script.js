const API_BASE =
    window.location.protocol === "file:" ||
    (window.location.port && window.location.port !== "5000")
        ? "http://localhost:5000/api"
        : "/api";

const UTTARAKHAND_UNIVERSITIES = [
    "Dev Bhoomi Uttarakhand University",
    "Graphic Era Deemed to be University",
    "UPES Dehradun",
    "Doon University",
    "Uttarakhand Technical University",
    "Uttaranchal University",
    "IMS Unison University",
    "Quantum University",
    "Swami Rama Himalayan University",
    "Hemvati Nandan Bahuguna Garhwal University",
    "Kumaun University",
    "Sri Dev Suman Uttarakhand University",
    "Gurukula Kangri University",
    "Motherhood University",
    "University of Patanjali"
];

const session = {
    get user() {
        const saved = localStorage.getItem("staynearUser");
        return saved ? JSON.parse(saved) : null;
    },
    get token() {
        return localStorage.getItem("staynearToken");
    },
    save(data) {
        localStorage.setItem("staynearUser", JSON.stringify(data.user));
        localStorage.setItem("staynearToken", data.token);
    },
    clear() {
        localStorage.removeItem("staynearUser");
        localStorage.removeItem("staynearToken");
    }
};

async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (session.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    button.disabled = isLoading;
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = text;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

function redirectByRole(user) {
    window.location.href =
        user.role === "owner" ? "owner-dashboard.html" : "student-dashboard.html";
}

function requireLogin(role) {
    const user = session.user;

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    if (role && user.role !== role) {
        redirectByRole(user);
        return null;
    }

    return user;
}

function logout() {
    session.clear();
    window.location.href = "index.html";
}

function populateUniversitySelect(selectId, includeAny = false) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = includeAny
        ? '<option value="">Any university</option>'
        : '<option value="">Select university</option>';

    UTTARAKHAND_UNIVERSITIES.forEach((university) => {
        const option = document.createElement("option");
        option.value = university;
        option.textContent = university;
        select.appendChild(option);
    });
}

function renderAmenities(amenities = []) {
    if (!amenities.length) {
        return "<span>Basic facilities</span>";
    }

    return amenities
        .slice(0, 4)
        .map((amenity) => `<span>${escapeHtml(amenity)}</span>`)
        .join("");
}

function propertyCard(property, isOwner = false) {
    const detailLink = `property.html?id=${property._id}`;
    const ownerActions = isOwner
        ? `<button class="delete-property-button" data-id="${property._id}" type="button">Delete</button>`
        : "";

    return `
        <article class="property-card">
            <div class="property-image">
                <span>StayNear</span>
            </div>
            <div class="property-content">
                <div class="property-top">
                    <h3>${escapeHtml(property.title)}</h3>
                    <strong>&#8377;${formatPrice(property.price)}</strong>
                </div>
                <p class="property-location">&#128205; ${escapeHtml(property.location)}</p>
                <p class="property-university">${escapeHtml(property.university)}</p>
                <div class="property-tags">
                    ${renderAmenities(property.amenities)}
                    <span>${escapeHtml(property.roomType)}</span>
                    <span>${escapeHtml(property.type)}</span>
                </div>
                <div class="property-actions">
                    <a href="${detailLink}" class="view-property-button">View Property</a>
                    ${ownerActions}
                </div>
            </div>
        </article>
    `;
}

function emptyState(title, message, action = "") {
    return `
        <div class="owner-empty-state">
            <div class="empty-icon">SN</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
            ${action}
        </div>
    `;
}

async function loadStudentProperties(params = {}) {
    const propertyGrid = document.getElementById("propertyGrid");
    if (!propertyGrid) return;

    requireLogin("student");
    propertyGrid.innerHTML = emptyState(
        "Loading stays",
        "Finding rooms and PGs near Uttarakhand universities."
    );

    try {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value) searchParams.set(key, value);
        });

        const query = searchParams.toString() ? `?${searchParams}` : "";
        const { properties } = await apiFetch(`/properties${query}`);

        if (!properties.length) {
            propertyGrid.innerHTML = emptyState(
                "No matching properties",
                "Try another university, nearby location, budget or room type."
            );
            return;
        }

        propertyGrid.innerHTML = properties
            .map((property) => propertyCard(property))
            .join("");
    } catch (error) {
        propertyGrid.innerHTML = emptyState("Could not load properties", error.message);
    }
}

async function loadOwnerProperties() {
    const container = document.getElementById("ownerPropertiesContainer");
    if (!container) return;

    requireLogin("owner");
    container.innerHTML = emptyState("Loading listings", "Getting your properties from MongoDB.");

    try {
        const { properties } = await apiFetch("/properties/mine");
        const total = document.getElementById("ownerTotal");
        const active = document.getElementById("ownerActive");

        if (total) total.textContent = properties.length;
        if (active) active.textContent = properties.filter((item) => item.isAvailable).length;

        if (!properties.length) {
            container.innerHTML = emptyState(
                "No properties yet",
                "Add your first property and start reaching students.",
                '<a href="add-property.html" class="empty-state-button">Add Your First Property</a>'
            );
            return;
        }

        container.innerHTML = properties
            .map((property) => propertyCard(property, true))
            .join("");
    } catch (error) {
        container.innerHTML = emptyState("Could not load listings", error.message);
    }
}

async function deleteProperty(id) {
    if (!confirm("Delete this property listing?")) return;

    try {
        await apiFetch(`/properties/${id}`, { method: "DELETE" });
        await loadOwnerProperties();
    } catch (error) {
        alert(error.message);
    }
}

async function loadPropertyDetails() {
    const page = document.querySelector("[data-property-page]");
    if (!page) return;

    requireLogin("student");

    const id = new URLSearchParams(window.location.search).get("id");
    const title = document.getElementById("propertyTitle");
    const content = document.getElementById("propertyDynamicContent");

    if (!id) {
        if (content) {
            content.innerHTML = emptyState(
                "Property not found",
                "Open a listing from the student dashboard."
            );
        }
        return;
    }

    try {
        const { property } = await apiFetch(`/properties/${id}`);
        document.title = `${property.title} - StayNear`;

        if (title) title.textContent = property.title;
        document.getElementById("propertyLocation").textContent = property.location;
        document.getElementById("propertyUniversity").textContent = property.university;
        document.getElementById("propertyPrice").textContent = `Rs ${formatPrice(property.price)}`;
        document.getElementById("propertyDescription").textContent =
            property.description || "The owner has not added a detailed description yet.";
        document.getElementById("propertyRoomType").textContent = property.roomType;
        document.getElementById("propertyType").textContent = property.type;
        document.getElementById("ownerName").textContent = property.ownerName;
        document.getElementById("ownerEmail").textContent = property.ownerEmail;
        document.getElementById("ownerInitial").textContent =
            property.ownerName.charAt(0).toUpperCase();

        const amenities = document.getElementById("propertyAmenities");
        amenities.innerHTML = (property.amenities.length ? property.amenities : ["Basic facilities"])
            .map((amenity) => `<div class="amenity"><span>${escapeHtml(amenity)}</span></div>`)
            .join("");
    } catch (error) {
        if (content) {
            content.innerHTML = emptyState("Could not load property", error.message);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    populateUniversitySelect("searchUniversity", true);
    populateUniversitySelect("propertyUniversity");

    const findStayBtn = document.getElementById("findStayBtn");
    if (findStayBtn) {
        findStayBtn.addEventListener("click", () => {
            const user = session.user;
            if (!user) {
                window.location.href = "login.html";
                return;
            }
            redirectByRole(user);
        });
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const button = signupForm.querySelector("button[type='submit']");
            setButtonLoading(button, true, "Creating...");

            try {
                const data = await apiFetch("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        name: document.getElementById("name").value,
                        email: document.getElementById("signupEmail").value,
                        password: document.getElementById("signupPassword").value,
                        role: document.getElementById("role").value
                    })
                });
                session.save(data);
                redirectByRole(data.user);
            } catch (error) {
                alert(error.message);
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const button = loginForm.querySelector("button[type='submit']");
            setButtonLoading(button, true, "Logging in...");

            try {
                const data = await apiFetch("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: document.getElementById("email").value,
                        password: document.getElementById("password").value
                    })
                });
                session.save(data);
                redirectByRole(data.user);
            } catch (error) {
                alert(error.message);
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    const user = session.user;
    const studentGreeting = document.getElementById("studentGreeting");
    const ownerGreeting = document.getElementById("ownerGreeting");

    if (studentGreeting && user) {
        studentGreeting.textContent = `Welcome, ${user.name}`;
    }

    if (ownerGreeting && user) {
        ownerGreeting.textContent = `Welcome, ${user.name}`;
    }

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileRole = document.getElementById("profileRole");

    if (profileName && profileEmail && profileRole) {
        const profileUser = requireLogin();
        if (profileUser) {
            profileName.textContent = profileUser.name;
            profileEmail.textContent = profileUser.email;
            profileRole.textContent =
                profileUser.role === "student" ? "Student" : "Property Owner";
        }
    }

    const propertyForm = document.getElementById("propertyForm");
    if (propertyForm) {
        requireLogin("owner");
        propertyForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const button = propertyForm.querySelector("button[type='submit']");
            setButtonLoading(button, true, "Adding...");

            const amenities = Array.from(
                document.querySelectorAll('input[name="amenities"]:checked')
            ).map((checkbox) => checkbox.value);

            try {
                await apiFetch("/properties", {
                    method: "POST",
                    body: JSON.stringify({
                        title: document.getElementById("propertyName").value,
                        type: document.getElementById("propertyType").value,
                        roomType: document.getElementById("propertyRoom").value,
                        university: document.getElementById("propertyUniversity").value,
                        location: document.getElementById("propertyLocation").value,
                        price: document.getElementById("propertyRent").value,
                        description: document.getElementById("propertyDescription").value,
                        amenities
                    })
                });

                window.location.href = "owner-dashboard.html";
            } catch (error) {
                alert(error.message);
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    const searchPropertyBtn = document.getElementById("searchPropertyBtn");
    if (searchPropertyBtn) {
        searchPropertyBtn.addEventListener("click", () => {
            loadStudentProperties({
                location: document.getElementById("searchLocation").value.trim(),
                university: document.getElementById("searchUniversity").value,
                maxPrice: document.getElementById("searchBudget").value,
                roomType: document.getElementById("searchRoom").value
            });
        });
    }

    const propertyGrid = document.getElementById("propertyGrid");
    if (propertyGrid) {
        loadStudentProperties();
    }

    const ownerPropertiesContainer = document.getElementById("ownerPropertiesContainer");
    if (ownerPropertiesContainer) {
        loadOwnerProperties();
        ownerPropertiesContainer.addEventListener("click", (event) => {
            const button = event.target.closest(".delete-property-button");
            if (button) {
                deleteProperty(button.dataset.id);
            }
        });
    }

    const contactOwnerBtn = document.getElementById("contactOwnerBtn");
    if (contactOwnerBtn) {
        contactOwnerBtn.addEventListener("click", () => {
            const ownerEmail = document.getElementById("ownerEmail")?.textContent;
            if (ownerEmail) {
                window.location.href = `mailto:${ownerEmail}?subject=StayNear property enquiry`;
            }
        });
    }

    loadPropertyDetails();
});
