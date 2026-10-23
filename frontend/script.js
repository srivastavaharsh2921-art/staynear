const API_BASE = (() => {
    const configuredBase =
        window.STAYNEAR_API_BASE ||
        localStorage.getItem("staynearApiBase");

    if (configuredBase) {
        return configuredBase.replace(/\/+$/, "");
    }

    const isLocal =
        window.location.protocol === "file:" ||
        ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (isLocal) {
        return "http://localhost:5000/api";
    }

    return "https://staynear-backend.vercel.app/api";
})();


const LAUNCH_UNIVERSITY = "Dev Bhoomi Uttarakhand University (DBUU)";

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

async function apiFetch(path, options = {}, authenticated = true) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (authenticated && session.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json().catch(() => ({}))
        : {};

    if (!response.ok) {
        const fallbackMessage = response.status === 404
            ? "API route not found. Check that the backend is deployed and /api is routed correctly."
            : "Something went wrong. Please try again.";

        throw new Error(data.message || fallbackMessage);
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

function setAuthFeedback(element, message, state = "info") {
    if (!element) return;
    element.textContent = message;
    element.dataset.state = state;
    element.hidden = !message;
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

function isLaunchUniversity(university) {
    return /^Dev Bhoomi Uttarakhand University(?:\s+\(DBUU\))?$/i.test(
        String(university || "").replace(/\s+/g, " ").trim()
    );
}

function propertyUniversityLabel(university) {
    return isLaunchUniversity(university) ? LAUNCH_UNIVERSITY : "Institution needs review";
}

function propertyImage(property, className = "") {
    const imageUrl = Array.isArray(property.images)
        ? property.images.find((image) => /^https?:\/\//i.test(image))
        : "";

    return imageUrl
        ? `<img class="${className}" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(property.title)}" loading="lazy">`
        : `<div class="${className} property-image-placeholder" role="img" aria-label="No property photo available"><span>Photo not provided</span></div>`;
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
            ${propertyImage(property, "property-image")}
            <div class="property-content">
                <div class="property-top">
                    <h3>${escapeHtml(property.title)}</h3>
                    <strong>&#8377;${formatPrice(property.price)}</strong>
                </div>
                <p class="property-location">${escapeHtml(property.location)}</p>
                <p class="property-university">${escapeHtml(propertyUniversityLabel(property.university))}</p>
                <div class="property-tags">
                    ${renderAmenities(property.amenities)}
                    <span>${escapeHtml(property.roomType)}</span>
                    <span>${escapeHtml(property.type)}</span>
                    ${isOwner ? `<span class="availability-tag">${property.isAvailable ? "Available" : "Unavailable"}</span>` : ""}
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
        `Finding stays for ${LAUNCH_UNIVERSITY}.`
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
                "Try another location, budget or room type."
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

    requireLogin();

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
        document.getElementById("propertyUniversity").textContent = propertyUniversityLabel(property.university);
        document.getElementById("propertyPrice").textContent = `Rs ${formatPrice(property.price)}`;
        document.getElementById("propertyDescription").textContent =
            property.description || "The owner has not added a detailed description yet.";
        document.getElementById("propertyRoomType").textContent = property.roomType;
        document.getElementById("propertyType").textContent = property.type;
        const statusValue = document.querySelector(".room-details div:last-child strong");
        if (statusValue) statusValue.textContent = property.isAvailable ? "Available" : "Unavailable";
        document.getElementById("ownerName").textContent = property.ownerName;
        document.getElementById("ownerEmail").textContent = property.ownerEmail;
        document.getElementById("ownerInitial").textContent =
            property.ownerName.charAt(0).toUpperCase();

        const amenities = document.getElementById("propertyAmenities");
        amenities.innerHTML = (property.amenities.length ? property.amenities : ["Basic facilities"])
            .map((amenity) => `<div class="amenity"><span>${escapeHtml(amenity)}</span></div>`)
            .join("");

        const gallery = document.querySelector(".property-gallery");
        const images = Array.isArray(property.images)
            ? property.images.filter((image) => /^https?:\/\//i.test(image))
            : [];
        if (gallery) {
            gallery.innerHTML = images.length
                ? `<img class="property-large-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(property.title)}" loading="lazy">${images.length > 1 ? `<div class="property-small-images">${images.slice(1, 4).map((image, index) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(property.title)} photo ${index + 2}" loading="lazy">`).join("")}</div>` : ""}`
                : '<div class="property-image-placeholder property-large-image" role="img" aria-label="No property photos available"><span>No property photos provided</span></div>';
        }
    } catch (error) {
        if (content) {
            content.innerHTML = emptyState("Could not load property", error.message);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const button = forgotPasswordForm.querySelector("button[type='submit']");
            const feedback = document.getElementById("forgotPasswordFeedback");
            setAuthFeedback(feedback, "");
            setButtonLoading(button, true, "Sending...");

            try {
                const data = await apiFetch("/auth/forgot-password", {
                    method: "POST",
                    body: JSON.stringify({
                        email: document.getElementById("forgotEmail").value.trim()
                    })
                }, false);
                setAuthFeedback(feedback, data.message, "success");
            } catch (error) {
                setAuthFeedback(feedback, error.message, "error");
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if (resetPasswordForm) {
        const token = new URLSearchParams(window.location.search).get("token") || "";
        if (token) window.history.replaceState(null, "", window.location.pathname);
        const feedback = document.getElementById("resetPasswordFeedback");
        const loginLink = document.getElementById("resetLoginLink");

        if (!/^[a-f0-9]{64}$/i.test(token)) {
            resetPasswordForm.hidden = true;
            setAuthFeedback(
                feedback,
                "This password reset link is invalid. Request a new link to continue.",
                "error"
            );
        }

        resetPasswordForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const button = resetPasswordForm.querySelector("button[type='submit']");
            const password = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmNewPassword").value;

            if (password !== confirmPassword) {
                setAuthFeedback(feedback, "The passwords do not match.", "error");
                document.getElementById("confirmNewPassword").focus();
                return;
            }

            setAuthFeedback(feedback, "");
            setButtonLoading(button, true, "Updating...");

            try {
                const data = await apiFetch("/auth/reset-password", {
                    method: "POST",
                    body: JSON.stringify({ token, password, confirmPassword })
                }, false);
                resetPasswordForm.hidden = true;
                if (loginLink) loginLink.hidden = false;
                setAuthFeedback(feedback, data.message, "success");
                resetPasswordForm.reset();
                window.history.replaceState(null, "", window.location.pathname);
            } catch (error) {
                setAuthFeedback(feedback, error.message, "error");
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

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
                        university: LAUNCH_UNIVERSITY,
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
