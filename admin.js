const ADMIN_SESSION_KEY = "ghostAdminSession";
const STORAGE_KEY = "ghostMotorsData";
const DEFAULT_STORAGE_KEY = "ghostMotorsDefaultData";
const DEFAULT_HISTORY_KEY = "ghostMotorsDefaultHistory";
const PERMISSIONS_STORAGE_KEY = "ghostMotorsAdminPermissions";
const ADMIN_USERS_STORAGE_KEY = "ghostMotorsAdminUsers";
const API_BASE_URL = (window.GHOST_API_URL || (window.location.protocol === "file:" ? "http://localhost:3000" : "")).replace(/\/$/, "");
let galleryDraftImages = [];
let adminNoticeTimer;

const permissionOptions = [
    { key: "hero", label: "Inicio" },
    { key: "gallery", label: "Galería" },
    { key: "motos", label: "Motos" },
    { key: "parts", label: "Repuestos" },
    { key: "team", label: "Equipo" },
    { key: "news", label: "Noticias" },
    { key: "settings", label: "Datos" }
];

const defaultAdminUsers = [
    { username: "oliver", password: "Ol28281202", role: "Administrador principal" },
    { username: "adriana", password: "marketing123", role: "Marketing" },
    { username: "julian", password: "admin2828", role: "Editor" },
    { username: "camila", password: "Cr140804", role: "Editora" }
];

function isValidLocalAdmin(username, password) {
    return getAdminUsers().some((user) => user.username.toLowerCase() === username.toLowerCase() && user.password === password);
}

function getAdminUsers() {
    try {
        const savedUsers = JSON.parse(localStorage.getItem(ADMIN_USERS_STORAGE_KEY) || "null");
        return Array.isArray(savedUsers) && savedUsers.length ? savedUsers : structuredClone(defaultAdminUsers);
    } catch (error) {
        return structuredClone(defaultAdminUsers);
    }
}

function renderAdminUsers() {
    const list = document.getElementById("adminUsersList");

    if (!list) {
        return;
    }

    list.innerHTML = getAdminUsers().map((user, index) => {
        const isOwner = user.username.toLowerCase() === "oliver";

        return `
            <article class="admin-user-card" data-admin-user-index="${index}">
                <div class="admin-user-card-header">
                    <strong>${isOwner ? "Oliver" : `Administrador ${index}`}</strong>
                    ${isOwner ? '<span class="permissions-owner">Principal</span>' : '<button type="button" class="remove-btn" data-remove-admin>Eliminar</button>'}
                </div>
                <div class="admin-user-fields">
                    <div class="field">
                        <label>Usuario</label>
                        <input type="text" data-admin-field="username" value="${escapeHtml(user.username || "")}" ${isOwner ? "readonly" : ""}>
                    </div>
                    <div class="field">
                        <label>Contraseña</label>
                        <input type="text" data-admin-field="password" value="${escapeHtml(user.password || "")}">
                    </div>
                    <div class="field">
                        <label>Cargo</label>
                        <input type="text" data-admin-field="role" value="${escapeHtml(user.role || "")}">
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function addAdminUser() {
    const users = getAdminUsers();
    users.push({ username: "nuevo_usuario", password: "", role: "Editor" });
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
    renderAdminUsers();
    showAdminNotice("Se agregó un administrador. Completa sus datos y guarda los cambios.");
}

function saveAdminUsers() {
    if (getAdminSessionUser() !== "oliver") {
        return;
    }

    const users = [];
    document.querySelectorAll("[data-admin-user-index]").forEach((card) => {
        const existingUser = getAdminUsers()[Number(card.dataset.adminUserIndex)] || {};
        const getValue = (field) => card.querySelector(`[data-admin-field="${field}"]`)?.value.trim() || "";
        const username = existingUser.username.toLowerCase() === "oliver" ? "oliver" : getValue("username").toLowerCase();

        if (username && getValue("password")) {
            users.push({ username, password: getValue("password"), role: getValue("role") || "Editor" });
        }
    });

    if (!users.some((user) => user.username === "oliver")) {
        showAdminNotice("Oliver debe permanecer como administrador principal.", "error");
        return;
    }

    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
    renderAdminUsers();
    renderPermissions();
    showAdminNotice("Administradores guardados correctamente.");
}

function setAdminSession(username) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        authenticated: true,
        username: username.toLowerCase()
    }));
}

function getAdminSessionUser() {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);

    if (!savedSession) {
        return "";
    }

    if (savedSession === "true") {
        return "oliver";
    }

    try {
        const session = JSON.parse(savedSession);
        return session && session.authenticated ? String(session.username || "").toLowerCase() : "";
    } catch (error) {
        return "";
    }
}

function getAdminPermissions() {
    const allPermissions = Object.fromEntries(permissionOptions.map((option) => [option.key, true]));
    const managedAdmins = getAdminUsers().filter((user) => user.username.toLowerCase() !== "oliver").map((user) => user.username.toLowerCase());

    try {
        const saved = JSON.parse(localStorage.getItem(PERMISSIONS_STORAGE_KEY) || "{}");

        return Object.fromEntries(managedAdmins.map((username) => [
            username,
            { ...allPermissions, ...(saved[username] || {}) }
        ]));
    } catch (error) {
        return Object.fromEntries(managedAdmins.map((username) => [username, { ...allPermissions }]));
    }
}

function renderPermissions() {
    const list = document.getElementById("permissionsList");

    if (!list) {
        return;
    }

    const permissions = getAdminPermissions();

    const managedAdmins = getAdminUsers().filter((user) => user.username.toLowerCase() !== "oliver").map((user) => user.username.toLowerCase());

    list.innerHTML = managedAdmins.map((username) => `
        <article class="permission-card" data-permission-user="${username}">
            <div class="permission-user">
                <strong>${username}</strong>
                <span>Administrador</span>
            </div>
            <div class="permission-options">
                ${permissionOptions.map((option) => `
                    <label class="permission-option">
                        <input type="checkbox" data-permission="${option.key}" ${permissions[username][option.key] ? "checked" : ""}>
                        <span>${option.label}</span>
                    </label>
                `).join("")}
            </div>
        </article>
    `).join("");
}

function applyPermissionsAccess() {
    const currentUser = getAdminSessionUser();
    const canManagePermissions = currentUser === "oliver";
    const permissions = getAdminPermissions()[currentUser] || Object.fromEntries(permissionOptions.map((option) => [option.key, true]));
    const permissionLink = document.querySelector("[data-permission-admin]");
    const permissionPanel = document.getElementById("permissions-panel");

    permissionLink?.classList.toggle("hidden", !canManagePermissions);
    if (permissionLink) {
        permissionLink.hidden = !canManagePermissions;
    }
    permissionPanel?.classList.toggle("is-hidden", !canManagePermissions);
    if (permissionPanel) {
        permissionPanel.dataset.permissionAllowed = canManagePermissions ? "true" : "false";
        permissionPanel.hidden = !canManagePermissions;
    }

    document.querySelectorAll(".admin-nav [data-permission]").forEach((link) => {
        link.classList.toggle("hidden", !permissions[link.dataset.permission]);
    });

    document.querySelectorAll("[data-permission-panel]").forEach((panel) => {
        panel.dataset.permissionAllowed = permissions[panel.dataset.permissionPanel] === false ? "false" : "true";
    });

    if (canManagePermissions) {
        renderPermissions();
        renderAdminUsers();
    }
}

function savePermissions() {
    if (getAdminSessionUser() !== "oliver") {
        return;
    }

    const savedPermissions = {};

    document.querySelectorAll("[data-permission-user]").forEach((card) => {
        const username = card.dataset.permissionUser;
        savedPermissions[username] = {};

        card.querySelectorAll("[data-permission]").forEach((checkbox) => {
            savedPermissions[username][checkbox.dataset.permission] = checkbox.checked;
        });
    });

    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(savedPermissions));
    showAdminNotice("Permisos guardados correctamente.");
}

function showAdminNotice(message, type = "success") {
    const notice = document.getElementById("adminNotice");

    if (!notice) {
        return;
    }

    window.clearTimeout(adminNoticeTimer);
    notice.textContent = message;
    notice.className = `admin-notice is-visible ${type}`;

    adminNoticeTimer = window.setTimeout(() => {
        notice.classList.remove("is-visible");
    }, 3600);
}

function subscribeToLiveAdminUpdates() {
    if (!API_BASE_URL || !window.EventSource) {
        return;
    }

    const events = new EventSource(`${API_BASE_URL}/api/events`);
    events.addEventListener("site-updated", () => {
        loadContent();
        showAdminNotice("El sitio fue actualizado por otro administrador.");
    });
    events.onerror = () => {
        events.close();
    };
}

async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error en la API");
    }

    return response.json();
}

async function syncSiteDataWithServer(data) {
    if (!API_BASE_URL) {
        return data;
    }

    try {
        await fetchJson("/api/site", {
            method: "POST",
            body: JSON.stringify(data)
        });
    } catch (error) {
        // Fallback local en caso de que el backend aún no esté levantado.
    }

    return data;
}

const defaultSiteData = {
    heroImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
    siteSettings: {
        workshopName: "Ghost Motors",
        phone: "+57 300 123 4567",
        whatsappUrl: "https://wa.me/573001234567",
        address: "Calle 10 # 20-30",
        city: "Neiva, Huila, Colombia",
        weekdayHours: "Lunes - Viernes: 8:00 AM - 6:00 PM",
        saturdayHours: "Sábados: 8:00 AM - 2:00 PM",
        sundayHours: "Domingos: Cerrado",
        email: "contacto@ghostmotors.com",
        facebook: "",
        instagram: "",
        tiktok: "",
        description: "Pasión, potencia y servicio para quienes viven sobre dos ruedas."
    },
    visitorCount: 0,
    galleryImages: [
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1558980394-0c94b0b0e8b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=900&q=80"
    ],
    motos: [
        {
            brand: "Yamaha",
            model: "MT-03",
            year: "2022",
            km: "18.500",
            price: "$22.900.000",
            image: "https://images.unsplash.com/photo-1558980664-10e7170c70f1?auto=format&fit=crop&w=1000&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Yamaha%20MT-03%202022."
        },
        {
            brand: "Bajaj",
            model: "Pulsar NS200",
            year: "2021",
            km: "24.300",
            price: "$11.800.000",
            image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1000&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Bajaj%20Pulsar%20NS200%202021."
        },
        {
            brand: "Honda",
            model: "CB190R",
            year: "2023",
            km: "10.900",
            price: "$14.900.000",
            image: "https://images.unsplash.com/photo-1517846693594-ea5c7cfb0d3b?auto=format&fit=crop&w=1000&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Honda%20CB190R%202023."
        },
        {
            brand: "TVS",
            model: "Raider 125",
            year: "2024",
            km: "7.800",
            price: "$9.700.000",
            image: "https://images.unsplash.com/photo-1558980663-368d1a2d8a29?auto=format&fit=crop&w=1000&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20TVS%20Raider%20125%202024."
        },
        {
            brand: "Yamaha",
            model: "XTZ 250",
            year: "2022",
            km: "16.200",
            price: "$18.500.000",
            image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Yamaha%20XTZ%20250%202022."
        },
        {
            brand: "Bajaj",
            model: "Dominar 400",
            year: "2020",
            km: "35.600",
            price: "$16.900.000",
            image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1000&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Bajaj%20Dominar%20400%202020."
        }
    ],
    parts: [
        {
            category: "frenos",
            name: "Pastillas de freno",
            compatibility: "Compatibilidad: NS200 / RS200 / Dominar",
            price: "$68.000",
            image: "https://images.unsplash.com/photo-1619771914272-e3c3d8e39f38?auto=format&fit=crop&w=900&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20pastillas%20de%20freno."
        },
        {
            category: "lubricantes",
            name: "Aceite 4T 10W-40",
            compatibility: "Referencia: 1 Litro",
            price: "$52.000",
            image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20aceite%204T%2010W-40."
        },
        {
            category: "motor",
            name: "Filtro de aceite",
            compatibility: "Compatible con múltiples referencias",
            price: "$24.000",
            image: "https://images.unsplash.com/photo-1599819177626-8f49e4ba6b39?auto=format&fit=crop&w=900&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20filtro%20de%20aceite."
        },
        {
            category: "transmision",
            name: "Kit de arrastre",
            compatibility: "Referencia: Cadena + piñón + corona",
            price: "$185.000",
            image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20kit%20de%20arrastre."
        },
        {
            category: "electrico",
            name: "Batería 12V",
            compatibility: "Referencia: 7Ah - Libre mantenimiento",
            price: "$210.000",
            image: "https://images.unsplash.com/photo-1609607847926-da4702f01fef?auto=format&fit=crop&w=900&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20bateria%2012V."
        },
        {
            category: "frenos",
            name: "Disco de freno",
            compatibility: "Compatibilidad según modelo",
            price: "$135.000",
            image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=80",
            url: "https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20disco%20de%20freno."
        }
    ],
    team: [
        {
            name: "Juan Pérez",
            role: "Director / Mecánico",
            image: "https://i.pravatar.cc/600?img=12"
        },
        {
            name: "Carlos Gómez",
            role: "Mecánico especializado",
            image: "https://i.pravatar.cc/600?img=11"
        },
        {
            name: "Laura Martínez",
            role: "Administración y ventas",
            image: "https://i.pravatar.cc/600?img=47"
        },
        {
            name: "Julian",
            role: "Mecánico",
            image: "https://i.pravatar.cc/600?img=33"
        },
        {
            name: "Adriana",
            role: "Mecánica",
            image: "https://i.pravatar.cc/600?img=48"
        },
        {
            name: "Oliver",
            role: "Aprendiz",
            image: "https://i.pravatar.cc/600?img=15"
        }
    ],
    news: [
        {
            date: "15 Jun",
            title: "Renovación de servicios premium",
            description: "Hemos reforzado nuestro taller con nuevas herramientas para mantenimiento, diagnóstico y ajuste fino en motos de alto rendimiento."
        },
        {
            date: "02 Jul",
            title: "Promoción de revisión general",
            description: "Este mes incluye revisión completa, ajuste de frenos, inspección de cadena y revisión de chasis con diagnóstico personalizado."
        },
        {
            date: "18 Jul",
            title: "Encuentro de motociclistas",
            description: "Organizamos una reunión abierta para compartir experiencias, recomendar rutas y conectar con otros apasionados por las dos ruedas."
        }
    ]
};

function getDefaultSeedData() {
    const seed = structuredClone(defaultSiteData);

    try {
        const savedDefault = localStorage.getItem(DEFAULT_STORAGE_KEY);

        if (savedDefault) {
            const parsed = JSON.parse(savedDefault);

            if (parsed && typeof parsed === "object") {
                Object.assign(seed, parsed);
                seed.siteSettings = {
                    ...defaultSiteData.siteSettings,
                    ...(parsed.siteSettings && typeof parsed.siteSettings === "object" ? parsed.siteSettings : {})
                };
            }
        }
    } catch (error) {
        // Mantener la configuración incluida en el proyecto si el respaldo no es válido.
    }

    return seed;
}

function normalizeSiteData(data) {
    const source = data && typeof data === "object" ? data : {};
    const defaults = getDefaultSeedData();

    return {
        heroImage: source.heroImage || defaults.heroImage,
        siteSettings: {
            ...defaults.siteSettings,
            ...(source.siteSettings && typeof source.siteSettings === "object" ? source.siteSettings : {})
        },
        visitorCount: Number(source.visitorCount) || 0,
        galleryImages: Array.isArray(source.galleryImages)
            ? source.galleryImages
            : structuredClone(defaults.galleryImages),
        motos: Array.isArray(source.motos)
            ? source.motos
            : structuredClone(defaults.motos),
        parts: Array.isArray(source.parts)
            ? source.parts
            : structuredClone(defaults.parts),
        team: Array.isArray(source.team)
            ? source.team
            : structuredClone(defaults.team),
        news: Array.isArray(source.news)
            ? source.news
            : structuredClone(defaults.news)
    };
}

function getStoredDefaultData() {
    try {
        const history = getDefaultHistory();

        if (history.length) {
            return normalizeSiteData(history[0].data);
        }

        const savedDefault = localStorage.getItem(DEFAULT_STORAGE_KEY);

        if (savedDefault) {
            return normalizeSiteData(JSON.parse(savedDefault));
        }
    } catch (error) {
        // Usar los datos incluidos en el código si el respaldo no es válido.
    }

    return structuredClone(defaultSiteData);
}

function getDefaultHistory() {
    try {
        const savedHistory = localStorage.getItem(DEFAULT_HISTORY_KEY);
        let history = savedHistory ? JSON.parse(savedHistory) : [];

        if (!Array.isArray(history)) {
            history = [];
        }

        if (!history.length) {
            const savedDefault = localStorage.getItem(DEFAULT_STORAGE_KEY);

            if (savedDefault) {
                history = [{
                    savedAt: new Date().toISOString(),
                    data: JSON.parse(savedDefault)
                }];
                localStorage.setItem(DEFAULT_HISTORY_KEY, JSON.stringify(history));
            }
        }

        return history;
    } catch (error) {
        return [];
    }
}

function renderDefaultHistory() {
    const historyContainer = document.getElementById("defaultHistory");

    if (!historyContainer) {
        return;
    }

    const history = getDefaultHistory();

    if (!history.length) {
        historyContainer.innerHTML = '<p class="panel-description">Todavía no hay versiones guardadas.</p>';
        return;
    }

    historyContainer.innerHTML = history.map((version, index) => {
        const savedDate = new Date(version.savedAt).toLocaleString("es-CO", {
            dateStyle: "medium",
            timeStyle: "short"
        });
        const motoCount = Array.isArray(version.data?.motos) ? version.data.motos.length : 0;
        const newsCount = Array.isArray(version.data?.news) ? version.data.news.length : 0;

        return `
            <article class="default-history-item">
                <div>
                    <strong>Versión ${history.length - index}</strong>
                    <span>${savedDate}</span>
                    <small>${motoCount} motos · ${newsCount} noticias</small>
                </div>
                <button type="button" class="secondary-btn small" data-restore-default="${index}">Restaurar</button>
            </article>
        `;
    }).join("");
}

function ensureDefaultSiteData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            const seed = getStoredDefaultData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
            return seed;
        }

        const parsed = JSON.parse(saved);
        const isEmptyState =
            !parsed ||
            typeof parsed !== "object" ||
            !Array.isArray(parsed.motos) ||
            !Array.isArray(parsed.parts) ||
            !Array.isArray(parsed.team) ||
            !Array.isArray(parsed.news) ||
            (
                parsed.motos.length === 0 &&
                parsed.parts.length === 0 &&
                parsed.team.length === 0 &&
                parsed.news.length === 0
            );

        if (isEmptyState) {
            const seed = getStoredDefaultData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
            return seed;
        }

        const normalized = normalizeSiteData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    } catch (error) {
        const seed = getStoredDefaultData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
}

async function getSiteData() {
    try {
        if (API_BASE_URL) {
            try {
                const response = await fetchJson("/api/site");
                const normalized = normalizeSiteData(response);

                localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                return normalized;
            } catch (error) {
                // Continuar con almacenamiento local.
            }
        }

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const normalized = normalizeSiteData(parsed);

                if (Array.isArray(normalized.motos) && Array.isArray(normalized.parts) && Array.isArray(normalized.team) && Array.isArray(normalized.news)) {
                    return normalized;
                }
            } catch (error) {
                // Continuar con fallback
            }
        }

        const savedDb = await getGhostSiteData();

        if (savedDb) {
            const normalized = normalizeSiteData(savedDb);

            if (Array.isArray(normalized.motos) && Array.isArray(normalized.parts) && Array.isArray(normalized.team) && Array.isArray(normalized.news)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                return normalized;
            }
        }

        return ensureDefaultSiteData();
    } catch (error) {
        return ensureDefaultSiteData();
    }
}

async function saveSiteData(data) {
    const normalized = normalizeSiteData(data);
    await syncSiteDataWithServer(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    await saveGhostSiteData(normalized);
    
    // Disparar evento de storage para que otras pestañas se actualicen
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(normalized),
        url: window.location.href
    }));
    
    return normalized;
}

function showLogin() {
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("adminScreen").classList.add("hidden");
}

function showAdmin() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("adminScreen").classList.remove("hidden");
    applyPermissionsAccess();

    if (getAdminSessionUser() !== "oliver" && window.location.hash === "#permissions-panel") {
        history.replaceState(null, "", "#hero-panel");
    }

    const panels = document.querySelectorAll(".panel-card[id]");
    const activeLink = document.querySelector(".admin-nav a.active");
    const targetId = activeLink ? activeLink.getAttribute("href")?.replace("#", "") : panels[0]?.id;

    if (targetId) {
        const showSection = (sectionId) => {
            panels.forEach((panel) => {
                const shouldShow = panel.id === sectionId;
                panel.classList.toggle("is-hidden", !shouldShow);
            });

            document.querySelectorAll(".admin-nav a").forEach((link) => {
                const isActive = link.getAttribute("href") === `#${sectionId}`;
                link.classList.toggle("active", isActive);
            });
        };

        showSection(targetId);
    }

    loadContent();
}

function renderHeroPreview(image) {
    const heroPreview = document.getElementById("heroPreview");

    if (!heroPreview) {
        return;
    }

    heroPreview.src = image || defaultSiteData.heroImage;
}

function renderSiteSettings(data) {
    const settings = {
        ...defaultSiteData.siteSettings,
        ...(data && data.siteSettings ? data.siteSettings : {})
    };
    const fields = {
        settingWorkshopName: settings.workshopName,
        settingPhone: settings.phone,
        settingWhatsappUrl: settings.whatsappUrl,
        settingEmail: settings.email,
        settingAddress: settings.address,
        settingCity: settings.city,
        settingWeekdayHours: settings.weekdayHours,
        settingSaturdayHours: settings.saturdayHours,
        settingSundayHours: settings.sundayHours,
        settingFacebook: settings.facebook,
        settingInstagram: settings.instagram,
        settingTiktok: settings.tiktok,
        settingDescription: settings.description
    };

    Object.entries(fields).forEach(([id, value]) => {
        const field = document.getElementById(id);

        if (field) {
            field.value = value || "";
        }
    });

    const visitorCount = document.getElementById("adminVisitorCount");

    if (visitorCount) {
        const localVisitorCount = Number(localStorage.getItem("ghostMotorsVisitCount") || 0);
        visitorCount.textContent = Math.max(Number(data?.visitorCount || 0), localVisitorCount).toLocaleString("es-CO");
    }

    const dashboardCounts = {
        adminMotoCount: Array.isArray(data?.motos) ? data.motos.length : 0,
        adminPartCount: Array.isArray(data?.parts) ? data.parts.length : 0,
        adminNewsCount: Array.isArray(data?.news) ? data.news.length : 0
    };

    Object.entries(dashboardCounts).forEach(([id, count]) => {
        const target = document.getElementById(id);

        if (target) {
            target.textContent = count.toLocaleString("es-CO");
        }
    });
}

function collectSiteSettings() {
    const getValue = (id) => document.getElementById(id)?.value.trim() || "";

    return {
        workshopName: getValue("settingWorkshopName"),
        phone: getValue("settingPhone"),
        whatsappUrl: getValue("settingWhatsappUrl"),
        email: getValue("settingEmail"),
        address: getValue("settingAddress"),
        city: getValue("settingCity"),
        weekdayHours: getValue("settingWeekdayHours"),
        saturdayHours: getValue("settingSaturdayHours"),
        sundayHours: getValue("settingSundayHours"),
        facebook: getValue("settingFacebook"),
        instagram: getValue("settingInstagram"),
        tiktok: getValue("settingTiktok"),
        description: getValue("settingDescription")
    };
}

async function exportSiteData() {
    const data = await getSiteData();
    const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "site-data.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showAdminNotice("Datos exportados. Sube site-data.json al repositorio de GitHub.");
}

function renderGalleryPreview(images) {
    const galleryPreview = document.getElementById("galleryPreview");

    if (!galleryPreview) {
        return;
    }

    const safeImages = Array.isArray(images) ? images : [];

    galleryPreview.innerHTML = safeImages.length
        ? safeImages.map((image, index) => `
            <div class="gallery-preview-item">
                <img src="${image || defaultSiteData.galleryImages[0]}" alt="Vista previa de galería" loading="lazy">
                <button type="button" class="remove-gallery-btn" data-remove-gallery="${index}">Eliminar foto</button>
            </div>
        `).join("")
        : '<p class="empty-gallery-message">No hay fotos en la galería.</p>';
}

function bindLocalImagePreview() {
    document.querySelectorAll("[data-field='image']").forEach((input) => {
        const preview = input.parentElement?.querySelector("img");

        if (!preview) {
            return;
        }

        input.addEventListener("change", () => {
            const file = input.files && input.files[0];

            if (!file) {
                preview.src = input.dataset.fallback || "";
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                preview.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    });
}

async function loadContent() {
    const data = await getSiteData();
    galleryDraftImages = Array.isArray(data.galleryImages) ? [...data.galleryImages] : [];
    renderHeroPreview(data.heroImage || defaultSiteData.heroImage);
    renderSiteSettings(data);
    renderGalleryPreview(galleryDraftImages);
    renderMotoList(data.motos);
    renderPartList(data.parts);
    renderTeamList(data.team);
    renderNewsList(data.news);
    bindLocalImagePreview();

    const heroInput = document.getElementById("heroImageInput");
    if (heroInput) {
        heroInput.value = "";
    }

    const galleryInput = document.getElementById("galleryFiles");
    if (galleryInput) {
        galleryInput.value = "";
    }
}

function renderMotoList(motos) {
    const list = document.getElementById("motoList");

    if (!list) {
        return;
    }

    list.innerHTML = motos.map((moto, index) => `
        <article class="item-editor" data-moto-index="${index}" data-current-image="${escapeHtml(moto.image || "")}">
            <div class="item-header">
                <h4>Moto ${index + 1}</h4>
                <button type="button" class="remove-btn" data-remove-moto="${index}">Eliminar</button>
            </div>

            <div class="item-grid">
                <div class="field">
                    <label>Marca</label>
                    <input type="text" data-field="brand" value="${escapeHtml(moto.brand || "")}">
                </div>
                <div class="field">
                    <label>Modelo</label>
                    <input type="text" data-field="model" value="${escapeHtml(moto.model || "")}">
                </div>
                <div class="field">
                    <label>Año</label>
                    <input type="text" data-field="year" value="${escapeHtml(moto.year || "")}">
                </div>
                <div class="field">
                    <label>Kilómetros</label>
                    <input type="text" data-field="km" value="${escapeHtml(moto.km || "")}">
                </div>
                <div class="field">
                    <label>Precio</label>
                    <input type="text" data-field="price" value="${escapeHtml(moto.price || "")}">
                </div>
                <div class="field">
                    <label>URL de WhatsApp</label>
                    <input type="url" data-field="url" value="${escapeHtml(moto.url || "")}">
                </div>
                <div class="field" style="grid-column: 1 / -1;">
                    <label>Selecciona imagen</label>
                    <input type="file" accept="image/*" data-field="image" data-fallback="${escapeHtml(moto.image || defaultSiteData.motos[0].image)}">
                    <div class="image-preview single">
                        <img src="${moto.image || defaultSiteData.motos[0].image}" alt="Vista previa de moto" loading="lazy">
                    </div>
                </div>
            </div>
        </article>
    `).join("");
}

function renderPartList(parts) {
    const list = document.getElementById("partList");

    if (!list) {
        return;
    }

    list.innerHTML = parts.map((part, index) => `
        <article class="item-editor" data-part-index="${index}" data-current-image="${escapeHtml(part.image || "")}">
            <div class="item-header">
                <h4>Repuesto ${index + 1}</h4>
                <button type="button" class="remove-btn" data-remove-part="${index}">Eliminar</button>
            </div>

            <div class="item-grid">
                <div class="field">
                    <label>Categoría</label>
                    <select data-field="category">
                        <option value="frenos" ${part.category === "frenos" ? "selected" : ""}>Frenos</option>
                        <option value="motor" ${part.category === "motor" ? "selected" : ""}>Motor</option>
                        <option value="transmision" ${part.category === "transmision" ? "selected" : ""}>Transmisión</option>
                        <option value="electrico" ${part.category === "electrico" ? "selected" : ""}>Eléctrico</option>
                        <option value="lubricantes" ${part.category === "lubricantes" ? "selected" : ""}>Lubricantes</option>
                    </select>
                </div>
                <div class="field">
                    <label>Nombre</label>
                    <input type="text" data-field="name" value="${escapeHtml(part.name || "")}">
                </div>
                <div class="field">
                    <label>Compatibilidad</label>
                    <input type="text" data-field="compatibility" value="${escapeHtml(part.compatibility || "")}">
                </div>
                <div class="field">
                    <label>Precio</label>
                    <input type="text" data-field="price" value="${escapeHtml(part.price || "")}">
                </div>
                <div class="field">
                    <label>URL de WhatsApp</label>
                    <input type="url" data-field="url" value="${escapeHtml(part.url || "")}">
                </div>
                <div class="field" style="grid-column: 1 / -1;">
                    <label>Selecciona imagen</label>
                    <input type="file" accept="image/*" data-field="image" data-fallback="${escapeHtml(part.image || defaultSiteData.parts[0].image)}">
                    <div class="image-preview single">
                        <img src="${part.image || defaultSiteData.parts[0].image}" alt="Vista previa de repuesto" loading="lazy">
                    </div>
                </div>
            </div>
        </article>
    `).join("");
}

function renderTeamList(team) {
    const list = document.getElementById("teamList");

    if (!list) {
        return;
    }

    list.innerHTML = team.map((member, index) => `
        <article class="item-editor" data-team-index="${index}" data-current-image="${escapeHtml(member.image || "")}">
            <div class="item-header">
                <h4>Integrante ${index + 1}</h4>
                <button type="button" class="remove-btn" data-remove-team="${index}">Eliminar</button>
            </div>

            <div class="item-grid">
                <div class="field">
                    <label>Nombre</label>
                    <input type="text" data-field="name" value="${escapeHtml(member.name || "")}">
                </div>
                <div class="field">
                    <label>Cargo</label>
                    <input type="text" data-field="role" value="${escapeHtml(member.role || "")}">
                </div>
                <div class="field" style="grid-column: 1 / -1;">
                    <label>Selecciona imagen</label>
                    <input type="file" accept="image/*" data-field="image" data-fallback="${escapeHtml(member.image || defaultSiteData.team[0].image)}">
                    <div class="image-preview single">
                        <img src="${member.image || defaultSiteData.team[0].image}" alt="Vista previa del equipo" loading="lazy">
                    </div>
                </div>
            </div>
        </article>
    `).join("");
}

function renderNewsList(news) {
    const list = document.getElementById("newsList");

    if (!list) {
        return;
    }

    list.innerHTML = news.map((item, index) => `
        <article class="item-editor" data-news-index="${index}">
            <div class="item-header">
                <h4>Noticia ${index + 1}</h4>
                <button type="button" class="remove-btn" data-remove-news="${index}">Eliminar</button>
            </div>

            <div class="item-grid">
                <div class="field">
                    <label>Fecha</label>
                    <input type="text" data-field="date" value="${escapeHtml(item.date || "")}">
                </div>
                <div class="field" style="grid-column: 1 / -1;">
                    <label>Título</label>
                    <input type="text" data-field="title" value="${escapeHtml(item.title || "")}">
                </div>
                <div class="field" style="grid-column: 1 / -1;">
                    <label>Descripción</label>
                    <textarea data-field="description" rows="4">${escapeHtml(item.description || "")}</textarea>
                </div>
            </div>
        </article>
    `).join("");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
        reader.readAsDataURL(file);
    });
}

async function collectMotoData() {
    const list = document.querySelectorAll("[data-moto-index]");
    const motos = [];

    for (const card of list) {
        const fields = card.querySelectorAll("[data-field]");
        const entry = {};

        for (const field of fields) {
            const key = field.dataset.field;

            if (field.type === "file") {
                entry[key] = field.files && field.files[0]
                    ? await fileToDataUrl(field.files[0])
                    : (card.dataset.currentImage || "");
            } else {
                entry[key] = field.value.trim();
            }
        }

        if (entry.brand || entry.model || entry.image || entry.url || entry.price || entry.year || entry.km) {
            motos.push(entry);
        }
    }

    return motos;
}

async function collectPartData() {
    const list = document.querySelectorAll("[data-part-index]");
    const parts = [];

    for (const card of list) {
        const fields = card.querySelectorAll("[data-field]");
        const entry = {};

        for (const field of fields) {
            const key = field.dataset.field;

            if (field.type === "file") {
                entry[key] = field.files && field.files[0]
                    ? await fileToDataUrl(field.files[0])
                    : (card.dataset.currentImage || "");
            } else {
                entry[key] = field.value.trim();
            }
        }

        if (entry.name || entry.category || entry.image || entry.url || entry.price || entry.compatibility) {
            parts.push(entry);
        }
    }

    return parts;
}

async function collectTeamData() {
    const list = document.querySelectorAll("[data-team-index]");
    const team = [];

    for (const card of list) {
        const fields = card.querySelectorAll("[data-field]");
        const entry = {};

        for (const field of fields) {
            const key = field.dataset.field;

            if (field.type === "file") {
                entry[key] = field.files && field.files[0]
                    ? await fileToDataUrl(field.files[0])
                    : (card.dataset.currentImage || "");
            } else {
                entry[key] = field.value.trim();
            }
        }

        if (entry.name || entry.role || entry.image) {
            team.push(entry);
        }
    }

    return team;
}

async function collectNewsData() {
    const list = document.querySelectorAll("[data-news-index]");
    const news = [];

    for (const card of list) {
        const fields = card.querySelectorAll("[data-field]");
        const entry = {};

        for (const field of fields) {
            const key = field.dataset.field;
            entry[key] = field.value.trim();
        }

        if (entry.date || entry.title || entry.description) {
            news.push(entry);
        }
    }

    return news;
}

async function saveCurrentContent(showMessage = true) {
    const data = await getSiteData();
    const heroInput = document.getElementById("heroImageInput");
    const galleryInput = document.getElementById("galleryFiles");

    data.heroImage = heroInput && heroInput.files && heroInput.files[0]
        ? await fileToDataUrl(heroInput.files[0])
        : (data.heroImage || defaultSiteData.heroImage);

    if (galleryInput && galleryInput.files && galleryInput.files.length > 0) {
        galleryDraftImages = [];

        for (const file of galleryInput.files) {
            galleryDraftImages.push(await fileToDataUrl(file));
        }
    } else {
        galleryDraftImages = Array.isArray(galleryDraftImages)
            ? galleryDraftImages
            : (Array.isArray(data.galleryImages) ? data.galleryImages : []);
    }

    data.galleryImages = galleryDraftImages;
    data.siteSettings = collectSiteSettings();

    const newMotos = await collectMotoData();
    const newParts = await collectPartData();
    const newTeam = await collectTeamData();
    const newNews = await collectNewsData();

    data.motos = Array.isArray(newMotos) ? newMotos : [];
    data.parts = Array.isArray(newParts) ? newParts : [];
    data.team = Array.isArray(newTeam) ? newTeam : [];
    data.news = Array.isArray(newNews) ? newNews : [];

    await saveSiteData(data);
    await loadContent();

    if (showMessage) {
        showAdminNotice("Cambios guardados correctamente.");
    }
}

async function addMoto() {
    const data = await getSiteData();
    data.motos = Array.isArray(data.motos) ? data.motos : [];
    data.motos.push({
        brand: "Nueva marca",
        model: "Nuevo modelo",
        year: "2025",
        km: "0",
        price: "$0",
        image: defaultSiteData.motos[0].image,
        url: "https://wa.me/573001234567"
    });
    await saveSiteData(data);
    renderMotoList(data.motos);
}

async function addPart() {
    const data = await getSiteData();
    data.parts = Array.isArray(data.parts) ? data.parts : [];
    data.parts.push({
        category: "motor",
        name: "Nuevo repuesto",
        compatibility: "Compatible con múltiples referencias",
        price: "$0",
        image: defaultSiteData.parts[0].image,
        url: "https://wa.me/573001234567"
    });
    await saveSiteData(data);
    renderPartList(data.parts);
}

async function addTeamMember() {
    const data = await getSiteData();
    data.team = Array.isArray(data.team) ? data.team : [];
    data.team.push({
        name: "Nuevo integrante",
        role: "Cargo del equipo",
        image: defaultSiteData.team[0].image
    });
    await saveSiteData(data);
    renderTeamList(data.team);
}

async function addNewsItem() {
    const data = await getSiteData();
    data.news = Array.isArray(data.news) ? data.news : [];
    data.news.push({
        date: "Nueva fecha",
        title: "Nueva noticia",
        description: "Escribe aquí la nueva actualización del taller."
    });
    await saveSiteData(data);
    renderNewsList(data.news);
}

async function removeMoto(index) {
    const data = await getSiteData();
    data.motos.splice(index, 1);
    await saveSiteData(data);
    renderMotoList(data.motos);
}

async function removePart(index) {
    const data = await getSiteData();
    data.parts.splice(index, 1);
    await saveSiteData(data);
    renderPartList(data.parts);
}

async function removeTeam(index) {
    const data = await getSiteData();
    data.team.splice(index, 1);
    await saveSiteData(data);
    renderTeamList(data.team);
}

async function removeNews(index) {
    const data = await getSiteData();
    data.news.splice(index, 1);
    await saveSiteData(data);
    renderNewsList(data.news);
}

async function saveDefaultData() {
    await saveCurrentContent(false);
    const currentData = await getSiteData();
    const history = getDefaultHistory();
    history.unshift({
        savedAt: new Date().toISOString(),
        data: structuredClone(currentData)
    });
    localStorage.setItem(DEFAULT_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(structuredClone(currentData)));
    renderDefaultHistory();
    showAdminNotice("Los datos actuales ahora son los datos por defecto.");
}

async function restoreDefaultHistory(index) {
    const history = getDefaultHistory();
    const version = history[index];

    if (!version || !version.data) {
        return;
    }

    const shouldRestore = confirm("¿Deseas restaurar esta versión guardada?");

    if (!shouldRestore) {
        return;
    }

    const restoredData = normalizeSiteData(version.data);
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(structuredClone(restoredData)));
    await saveSiteData(restoredData);
    await loadContent();
    showAdminNotice("Se restauró la versión seleccionada.");
}

async function resetDefaultData() {
    const shouldReset = confirm("¿Deseas restaurar los datos por defecto del sitio?");

    if (!shouldReset) {
        return;
    }

    const defaultData = getStoredDefaultData();
    await saveSiteData(defaultData);
    await loadContent();
    showAdminNotice("Se restauraron los datos por defecto.");
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginError = document.getElementById("loginError");

    if (API_BASE_URL) {
        fetchJson("/api/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        })
            .then((result) => {
                if (result && result.success) {
                    setAdminSession(result.user?.username || username);
                    loginError.textContent = "";
                    showAdmin();
                    return;
                }

                loginError.textContent = result && result.message ? result.message : "Usuario o contraseña incorrectos.";
            })
            .catch(() => {
                if (isValidLocalAdmin(username, password)) {
                    setAdminSession(username);
                    loginError.textContent = "";
                    showAdmin();
                    return;
                }

                loginError.textContent = "Usuario o contraseña incorrectos.";
            });

        return;
    }

    if (isValidLocalAdmin(username, password)) {
        setAdminSession(username);
        loginError.textContent = "";
        showAdmin();
        return;
    }

    loginError.textContent = "Usuario o contraseña incorrectos.";
}

function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    document.getElementById("loginForm").reset();
    document.getElementById("loginError").textContent = "";
    showLogin();
}

function setupAdminNavigation() {
    const navLinks = document.querySelectorAll(".admin-nav a");
    const panels = document.querySelectorAll(".panel-card[id]");

    if (!navLinks.length || !panels.length) {
        return;
    }

    const showSection = (targetId) => {
        panels.forEach((panel) => {
            const shouldShow = panel.id === targetId && panel.dataset.permissionAllowed !== "false";
            panel.classList.toggle("is-hidden", !shouldShow);
        });

        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${targetId}`;
            link.classList.toggle("active", isActive);
        });
    };

    panels.forEach((panel) => {
        if (panel.id !== "hero-panel") {
            panel.classList.add("is-hidden");
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href")?.replace("#", "");

            if (!targetId) {
                return;
            }

            event.preventDefault();
            showSection(targetId);
            history.replaceState(null, "", `#${targetId}`);
        });
    });

    const initialHash = window.location.hash.replace("#", "");
    const canManagePermissions = getAdminSessionUser() === "oliver";
    const validInitialHash = initialHash && document.getElementById(initialHash) && (initialHash !== "permissions-panel" || canManagePermissions) && document.getElementById(initialHash).dataset.permissionAllowed !== "false";
    const firstAllowedPanel = Array.from(panels).find((panel) => panel.dataset.permissionAllowed !== "false");
    const firstTarget = validInitialHash ? initialHash : firstAllowedPanel?.id;

    if (!firstTarget) {
        return;
    }

    showSection(firstTarget);
}

document.addEventListener("DOMContentLoaded", async () => {
    ensureDefaultSiteData();

    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const addMotoBtn = document.getElementById("addMotoBtn");
    const addPartBtn = document.getElementById("addPartBtn");
    const addTeamBtn = document.getElementById("addTeamBtn");
    const addNewsBtn = document.getElementById("addNewsBtn");
    const saveDefaultDataBtn = document.getElementById("saveDefaultDataBtn");
    const exportSiteDataBtn = document.getElementById("exportSiteDataBtn");
    const resetDataBtn = document.getElementById("resetDataBtn");
    const toggleWorkshopSettingsBtn = document.getElementById("toggleWorkshopSettingsBtn");
    const workshopSettingsEditor = document.getElementById("workshopSettingsEditor");
    const toggleDefaultHistoryBtn = document.getElementById("toggleDefaultHistoryBtn");
    const defaultHistory = document.getElementById("defaultHistory");
    const savePermissionsBtn = document.getElementById("savePermissionsBtn");
    const togglePermissionsBtn = document.getElementById("togglePermissionsBtn");
    const permissionsEditor = document.getElementById("permissionsEditor");
    const toggleAdminUsersBtn = document.getElementById("toggleAdminUsersBtn");
    const adminUsersEditor = document.getElementById("adminUsersEditor");
    const addAdminBtn = document.getElementById("addAdminBtn");
    const saveAdminUsersBtn = document.getElementById("saveAdminUsersBtn");
    const heroImageInput = document.getElementById("heroImageInput");
    const galleryFilesInput = document.getElementById("galleryFiles");

    setupAdminNavigation();
    applyPermissionsAccess();
    subscribeToLiveAdminUpdates();

    if (heroImageInput) {
        heroImageInput.addEventListener("change", () => {
            const file = heroImageInput.files && heroImageInput.files[0];

            if (!file) {
                renderHeroPreview(getSiteData().heroImage || defaultSiteData.heroImage);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => renderHeroPreview(event.target.result);
            reader.readAsDataURL(file);
        });
    }

    if (galleryFilesInput) {
        galleryFilesInput.addEventListener("change", async () => {
            const files = galleryFilesInput.files ? Array.from(galleryFilesInput.files) : [];

            if (!files.length) {
                renderGalleryPreview(galleryDraftImages);
                return;
            }

            const images = [];

            for (const file of files) {
                images.push(await fileToDataUrl(file));
            }

            galleryDraftImages = images;
            renderGalleryPreview(galleryDraftImages);
        });
    }

    if (getAdminSessionUser()) {
        showAdmin();
    } else {
        showLogin();
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    if (addMotoBtn) {
        addMotoBtn.addEventListener("click", addMoto);
    }

    if (addPartBtn) {
        addPartBtn.addEventListener("click", addPart);
    }

    if (addTeamBtn) {
        addTeamBtn.addEventListener("click", addTeamMember);
    }

    if (addNewsBtn) {
        addNewsBtn.addEventListener("click", addNewsItem);
    }

    if (saveDefaultDataBtn) {
        saveDefaultDataBtn.addEventListener("click", saveDefaultData);
    }

    if (exportSiteDataBtn) {
        exportSiteDataBtn.addEventListener("click", exportSiteData);
    }

    if (resetDataBtn) {
        resetDataBtn.addEventListener("click", resetDefaultData);
    }

    if (savePermissionsBtn) {
        savePermissionsBtn.addEventListener("click", savePermissions);
    }

    if (togglePermissionsBtn && permissionsEditor) {
        togglePermissionsBtn.addEventListener("click", () => {
            const isClosed = permissionsEditor.hasAttribute("hidden");
            permissionsEditor.toggleAttribute("hidden", !isClosed);
            togglePermissionsBtn.setAttribute("aria-expanded", String(isClosed));
            togglePermissionsBtn.textContent = isClosed ? "Ocultar permisos" : "Editar permisos";
        });
    }

    if (addAdminBtn) {
        addAdminBtn.addEventListener("click", addAdminUser);
    }

    if (toggleAdminUsersBtn && adminUsersEditor) {
        toggleAdminUsersBtn.addEventListener("click", () => {
            const isClosed = adminUsersEditor.hasAttribute("hidden");
            adminUsersEditor.toggleAttribute("hidden", !isClosed);
            toggleAdminUsersBtn.setAttribute("aria-expanded", String(isClosed));
            toggleAdminUsersBtn.textContent = isClosed ? "Ocultar administradores" : "Editar administradores";
        });
    }

    if (saveAdminUsersBtn) {
        saveAdminUsersBtn.addEventListener("click", saveAdminUsers);
    }

    if (toggleWorkshopSettingsBtn && workshopSettingsEditor) {
        toggleWorkshopSettingsBtn.addEventListener("click", () => {
            const isClosed = workshopSettingsEditor.hasAttribute("hidden");
            workshopSettingsEditor.toggleAttribute("hidden", !isClosed);
            toggleWorkshopSettingsBtn.setAttribute("aria-expanded", String(isClosed));
            toggleWorkshopSettingsBtn.textContent = isClosed
                ? "Ocultar información del taller"
                : "Editar información del taller";
        });
    }

    if (toggleDefaultHistoryBtn && defaultHistory) {
        toggleDefaultHistoryBtn.addEventListener("click", () => {
            const isHidden = defaultHistory.classList.toggle("is-hidden");
            toggleDefaultHistoryBtn.textContent = isHidden ? "Listado de datos" : "Ocultar listado";

            if (!isHidden) {
                renderDefaultHistory();
            }
        });
    }

    document.querySelectorAll("[data-action='save-content']").forEach((button) => {
        button.addEventListener("click", saveCurrentContent);
    });

    document.addEventListener("click", async (event) => {
        const removeAdminBtn = event.target.closest("[data-remove-admin]");
        const restoreDefaultBtn = event.target.closest("[data-restore-default]");
        const removeGalleryBtn = event.target.closest("[data-remove-gallery]");
        const removeMotoBtn = event.target.closest("[data-remove-moto]");
        const removePartBtn = event.target.closest("[data-remove-part]");
        const removeTeamBtn = event.target.closest("[data-remove-team]");
        const removeNewsBtn = event.target.closest("[data-remove-news]");

        if (removeAdminBtn) {
            const card = removeAdminBtn.closest("[data-admin-user-index]");
            const index = Number(card?.dataset.adminUserIndex);
            const users = getAdminUsers();

            if (users[index]?.username.toLowerCase() === "oliver") {
                return;
            }

            users.splice(index, 1);
            localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
            renderAdminUsers();
            renderPermissions();
            showAdminNotice("Administrador eliminado correctamente.");
            return;
        }

        if (restoreDefaultBtn) {
            await restoreDefaultHistory(Number(restoreDefaultBtn.dataset.restoreDefault));
            return;
        }

        if (removeGalleryBtn) {
            const index = Number(removeGalleryBtn.dataset.removeGallery);
            galleryDraftImages.splice(index, 1);
            renderGalleryPreview(galleryDraftImages);
            return;
        }

        if (removeMotoBtn) {
            const index = Number(removeMotoBtn.dataset.removeMoto);
            await removeMoto(index);
        }

        if (removePartBtn) {
            const index = Number(removePartBtn.dataset.removePart);
            await removePart(index);
        }

        if (removeTeamBtn) {
            const index = Number(removeTeamBtn.dataset.removeTeam);
            await removeTeam(index);
        }

        if (removeNewsBtn) {
            const index = Number(removeNewsBtn.dataset.removeNews);
            await removeNews(index);
        }
    });
});
