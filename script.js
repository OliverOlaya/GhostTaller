/* =========================================================
   GHOST MOTORS
   script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENTOS ================= */

    const navLinks = document.querySelectorAll("[data-tab]");
    const tabSections = document.querySelectorAll(".tab-section");

    const tabLinks = document.querySelectorAll("[data-tab-link]");

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    const appointmentForm = document.getElementById("appointmentForm");
    const successMessage = document.getElementById("successMessage");
    const newAppointment = document.getElementById("newAppointment");

    const motoFilter = document.getElementById("motoFilter");
    const motosGrid = document.getElementById("motosGrid");
    const motosCount = document.getElementById("motosCount");
    const motosEmpty = document.getElementById("motosEmpty");

    const partsFilter = document.getElementById("partsFilter");
    const partsGrid = document.getElementById("partsGrid");
    const partsCount = document.getElementById("partsCount");
    const partsEmpty = document.getElementById("partsEmpty");

    const currentYear = document.getElementById("currentYear");

    const STORAGE_KEY = "ghostMotorsData";
    const DEFAULT_STORAGE_KEY = "ghostMotorsDefaultData";
    const API_BASE_URL = (window.GHOST_API_URL || (window.location.protocol === "file:" ? "http://localhost:3000" : "")).replace(/\/$/, "");

    async function fetchJson(path, options = {}) {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(body || "Error del servidor");
        }

        return response.json();
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
        seed.heroImage = "";
        seed.galleryImages = [];
        seed.motos = [];
        seed.parts = [];
        seed.team = [];
        seed.news = [];

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
        const savedSettings = source.siteSettings && typeof source.siteSettings === "object" ? source.siteSettings : {};
        const siteSettings = {
            ...defaults.siteSettings,
            ...savedSettings
        };

        if (siteSettings.phone === "+57 300 123 4567") {
            siteSettings.phone = "3143655046";
        }

        if (siteSettings.whatsappUrl === "https://wa.me/573001234567") {
            siteSettings.whatsappUrl = "https://wa.me/573143655046";
        }

        if (siteSettings.address === "Calle 10 # 20-30") {
            siteSettings.address = "Calle 2 10-57";
        }

        if (siteSettings.phone === "+57 3143655046") {
            siteSettings.phone = "3143655046";
        }

        const cleanImage = (value) => {
            if (typeof value !== "string") {
                return "";
            }

            return value.includes("images.unsplash.com") || value.includes("i.pravatar.cc") ? "" : value;
        };

        const heroImage = cleanImage(source.heroImage || defaults.heroImage);

        return {
            heroImage,
            siteSettings,
            visitorCount: Number(source.visitorCount) || 0,
            galleryImages: Array.isArray(source.galleryImages)
                ? source.galleryImages.map(cleanImage).filter(Boolean)
                : structuredClone(defaults.galleryImages),
            motos: Array.isArray(source.motos)
                ? source.motos.map((item) => ({ ...item, image: cleanImage(item.image) }))
                : structuredClone(defaults.motos),
            parts: Array.isArray(source.parts)
                ? source.parts.map((item) => ({ ...item, image: cleanImage(item.image) }))
                : structuredClone(defaults.parts),
            team: Array.isArray(source.team)
                ? source.team.map((item) => ({ ...item, image: cleanImage(item.image) }))
                : structuredClone(defaults.team),
            news: Array.isArray(source.news)
                ? source.news
                : structuredClone(defaults.news)
        };
    }

    async function getSiteData() {
        try {
            if (API_BASE_URL) {
                try {
                    const serverData = await fetchJson("/api/site");
                    const normalized = normalizeSiteData(serverData);

                    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                    return normalized;
                } catch (error) {
                    // Fallback al almacenamiento local.
                }
            }

            if (window.location.protocol !== "file:") {
                try {
                    const staticResponse = await fetch(`site-data.json?v=${Date.now()}`, { cache: "no-store" });

                    if (staticResponse.ok) {
                        const staticData = normalizeSiteData(await staticResponse.json());
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(staticData));
                        return staticData;
                    }
                } catch (error) {
                    // Continuar con la copia local del navegador.
                }
            }

            if (window.location.protocol === "file:") {
                const saved = localStorage.getItem(STORAGE_KEY);

                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        const normalized = normalizeSiteData(parsed);

                        if (Array.isArray(normalized.motos) && Array.isArray(normalized.parts) && Array.isArray(normalized.team)) {
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                            return normalized;
                        }
                    } catch (error) {
                        // Fallback
                    }
                }

                const savedDb = await getGhostSiteData();

                if (savedDb) {
                    const normalized = normalizeSiteData(savedDb);

                    if (Array.isArray(normalized.motos) && Array.isArray(normalized.parts) && Array.isArray(normalized.team)) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                        return normalized;
                    }
                }
            }

            return getDefaultSeedData();
        } catch (error) {
            return getDefaultSeedData();
        }
    }

    function applySiteSettings(settings) {
        const values = settings || defaultSiteData.siteSettings;
        const textTargets = {
            contactPhone: values.phone,
            contactAddress: values.address,
            contactCity: values.city,
            contactWeekdayHours: values.weekdayHours,
            contactSaturdayHours: values.saturdayHours,
            footerDescription: values.description,
            footerAddress: values.address,
            footerCity: values.city,
            footerPhone: values.phone,
            footerEmail: values.email,
            footerWeekdayHours: values.weekdayHours,
            footerSaturdayHours: values.saturdayHours,
            footerSundayHours: values.sundayHours
        };

        Object.entries(textTargets).forEach(([id, value]) => {
            const target = document.getElementById(id);

            if (target && value) {
                target.textContent = value;
            }
        });

        const whatsappLinks = document.querySelectorAll("#contactWhatsappLink, #contactWhatsappButton, #footerWhatsappLink, .floating-whatsapp");
        whatsappLinks.forEach((link) => {
            if (values.whatsappUrl) {
                link.href = values.whatsappUrl;
            }
        });

        [
            ["facebookLink", values.facebook],
            ["instagramLink", values.instagram],
            ["tiktokLink", values.tiktok]
        ].forEach(([id, url]) => {
            const link = document.getElementById(id);

            if (link) {
                link.href = url || "#";
                link.classList.toggle("is-unavailable", !url);
                link.setAttribute("aria-disabled", url ? "false" : "true");
            }
        });
    }

    async function trackVisit() {
        const visitorTarget = document.getElementById("visitorCount");

        try {
            if (API_BASE_URL) {
                const response = await fetchJson("/api/visit", { method: "POST" });

                if (visitorTarget) {
                    visitorTarget.textContent = Number(response.visitorCount || 0).toLocaleString("es-CO");
                }

                return;
            }

            const localVisits = Number(localStorage.getItem("ghostMotorsVisitCount") || 0) + 1;
            localStorage.setItem("ghostMotorsVisitCount", String(localVisits));

            if (visitorTarget) {
                visitorTarget.textContent = localVisits.toLocaleString("es-CO");
            }
        } catch (error) {
            const fallbackVisits = Number(localStorage.getItem("ghostMotorsVisitCount") || 0) + 1;
            localStorage.setItem("ghostMotorsVisitCount", String(fallbackVisits));

            if (visitorTarget) {
                visitorTarget.textContent = fallbackVisits.toLocaleString("es-CO");
            }
        }
    }

    function subscribeToLiveUpdates() {
        if (!API_BASE_URL || !window.EventSource) {
            return;
        }

        const events = new EventSource(`${API_BASE_URL}/api/events`);
        events.addEventListener("site-updated", () => {
            renderSiteContent();
        });
        events.onerror = () => {
            events.close();
        };
    }

    window.renderSiteContent = async function renderSiteContent() {
        const data = await getSiteData();
        applySiteSettings(data.siteSettings);

        const heroImage = document.querySelector(".hero-image img");
        const heroContainer = document.querySelector(".hero-image");

        if (heroImage && heroContainer) {
            heroImage.hidden = !data.heroImage;

            if (data.heroImage) {
                heroImage.src = data.heroImage;
            }

            heroContainer.dataset.rendered = "true";
            heroContainer.hidden = !data.heroImage;
        }

        const gallery = document.querySelector(".gallery");

        if (gallery) {
            gallery.innerHTML = data.galleryImages
                .map((image, index) => {
                    const largeClass = index === 0 ? "gallery-large" : "";

                    return `
                        <div class="gallery-item ${largeClass}">
                            <img src="${image}" alt="Motocicleta ${index + 1}" loading="lazy">
                        </div>
                    `;
                })
                .join("");
            gallery.dataset.rendered = "true";
            gallery.hidden = false;
        }

        const motosGrid = document.getElementById("motosGrid");

        if (motosGrid) {
            const cardsHtml = data.motos.map((moto) => {
                const brand = (moto.brand || "").toLowerCase();

                return `
                    <article class="vehicle-card" data-brand="${brand}">
                        <div class="vehicle-image">
                            <img src="${moto.image || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85"}" alt="${moto.model || "Moto"}" loading="lazy">
                            <span class="vehicle-badge">Disponible</span>
                        </div>

                        <div class="vehicle-content">
                            <p class="product-category">${moto.brand || "Marca"}</p>
                            <h3>${moto.model || "Moto"}</h3>

                            <div class="vehicle-specs">
                                <span>Año: <strong>${moto.year || "2024"}</strong></span>
                                <span>Km: <strong>${moto.km || "0"}</strong></span>
                            </div>

                            <div class="vehicle-bottom">
                                <div class="price">${moto.price || "$0"}</div>
                                <a href="${moto.url || "https://wa.me/573001234567"}" class="product-button" target="_blank" rel="noopener noreferrer">Consultar</a>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");

            motosGrid.innerHTML = cardsHtml;
            motosGrid.dataset.rendered = "true";
            motosGrid.hidden = false;

            if (motosCount) {
                motosCount.textContent = data.motos.length;
            }

            if (motosEmpty) {
                motosEmpty.classList.toggle("hidden", data.motos.length !== 0);
            }
        }

        const partsGrid = document.getElementById("partsGrid");

        if (partsGrid) {
            const cardsHtml = data.parts.map((part) => `
                <article class="part-card" data-category="${part.category || "motor"}">
                    <div class="part-image">
                        <img src="${part.image || "https://images.unsplash.com/photo-1599819177626-8f49e4ba6b39?auto=format&fit=crop&w=900&q=80"}" alt="${part.name || "Repuesto"}" loading="lazy">
                    </div>

                    <div class="part-content">
                        <p class="product-category">${part.category || "Motor"}</p>
                        <h3>${part.name || "Producto"}</h3>
                        <p class="compatibility">${part.compatibility || "Compatible con múltiples referencias"}</p>

                        <div class="part-bottom">
                            <strong class="part-price">${part.price || "$0"}</strong>
                            <a href="${part.url || "https://wa.me/573001234567"}" target="_blank" rel="noopener noreferrer" class="product-button">Comprar</a>
                        </div>
                    </div>
                </article>
            `).join("");

            partsGrid.innerHTML = cardsHtml;
            partsGrid.dataset.rendered = "true";
            partsGrid.hidden = false;

            if (partsCount) {
                partsCount.textContent = data.parts.length;
            }

            if (partsEmpty) {
                partsEmpty.classList.toggle("hidden", data.parts.length !== 0);
            }
        }

        const teamGrid = document.querySelector(".team-grid");

        if (teamGrid) {
            teamGrid.innerHTML = (data.team || []).map((member) => `
                <article class="team-card">
                    <div class="team-image">
                        <img src="${member.image || "https://i.pravatar.cc/600?img=12"}" alt="Integrante del equipo" loading="lazy">
                    </div>

                    <div class="team-info">
                        <h3>${member.name || "Integrante"}</h3>
                        <p>${member.role || "Miembro del equipo"}</p>
                    </div>
                </article>
            `).join("");
            teamGrid.dataset.rendered = "true";
            teamGrid.hidden = false;
        }

        const newsGrid = document.querySelector(".news-grid");

        if (newsGrid) {
            newsGrid.innerHTML = (data.news || []).map((item) => `
                <article class="news-card">
                    <div class="news-date">${item.date || "Sin fecha"}</div>
                    <h3>${item.title || "Noticia"}</h3>
                    <p>${item.description || "Descripción disponible pronto."}</p>
                </article>
            `).join("");
        }
    }

    /* ================= AÑO FOOTER ================= */

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    renderSiteContent();
    trackVisit();
    subscribeToLiveUpdates();

    // Detectar cambios en localStorage y re-renderizar
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) {
            console.log('Datos actualizados, re-renderizando...');
            renderSiteContent();
        }
    });


    /* ================= NAVEGACIÓN ================= */

    function activateTab(tabId) {

        const targetSection = document.getElementById(tabId);

        if (!targetSection) {
            return;
        }

        /* Ocultar todas las secciones */

        tabSections.forEach((section) => {
            section.classList.remove("active");
        });


        /* Activar sección */

        targetSection.classList.add("active");


        /* Actualizar botones */

        navLinks.forEach((link) => {

            const isActive =
                link.dataset.tab === tabId;

            link.classList.toggle("active", isActive);

        });


        /* Cerrar menú móvil */

        if (mainNav) {
            mainNav.classList.remove("open");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }


        /* Subir al inicio */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            activateTab(link.dataset.tab);

        });

    });


    tabLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const tabId = link.dataset.tabLink;

            if (!document.getElementById(tabId)) {
                return;
            }

            event.preventDefault();

            activateTab(tabId);

        });

    });


    /* ================= BOTONES CON DATA-TAB ================= */

    document.querySelectorAll(".btn[data-tab]").forEach((button) => {

        button.addEventListener("click", () => {

            activateTab(button.dataset.tab);

        });

    });


    /* ================= MENÚ MÓVIL ================= */

    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mainNav.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

    }


    /* ================= FECHA MÍNIMA ================= */

    const dateInput = document.getElementById("date");

    if (dateInput) {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        dateInput.min = `${year}-${month}-${day}`;

    }


    /* ================= VALIDACIÓN FORMULARIO ================= */

    function setError(input, message) {

        const formGroup = input.closest(".form-group");

        if (!formGroup) {
            return;
        }

        const errorMessage =
            formGroup.querySelector(".error-message");

        input.classList.add("field-error");

        if (errorMessage) {
            errorMessage.textContent = message;
        }

    }


    function clearError(input) {

        const formGroup = input.closest(".form-group");

        if (!formGroup) {
            return;
        }

        const errorMessage =
            formGroup.querySelector(".error-message");

        input.classList.remove("field-error");

        if (errorMessage) {
            errorMessage.textContent = "";
        }

    }


    function validateForm() {

        let valid = true;

        const name =
            document.getElementById("name");

        const phone =
            document.getElementById("phone");

        const motorcycle =
            document.getElementById("motorcycle");

        const date =
            document.getElementById("date");

        const time =
            document.getElementById("time");

        const service =
            document.getElementById("service");


        /* NOMBRE */

        if (name.value.trim().length < 3) {

            setError(
                name,
                "Ingresa un nombre válido."
            );

            valid = false;

        } else {

            clearError(name);

        }


        /* TELÉFONO */

        const phoneValue =
            phone.value.replace(/\D/g, "");

        if (phoneValue.length < 10) {

            setError(
                phone,
                "Ingresa un número de teléfono válido."
            );

            valid = false;

        } else {

            clearError(phone);

        }


        /* MOTOCICLETA */

        if (motorcycle.value.trim().length < 2) {

            setError(
                motorcycle,
                "Indica el modelo de la motocicleta."
            );

            valid = false;

        } else {

            clearError(motorcycle);

        }


        /* FECHA */

        if (!date.value) {

            setError(
                date,
                "Selecciona una fecha."
            );

            valid = false;

        } else {

            const selectedDate =
                new Date(`${date.value}T00:00:00`);

            const today =
                new Date();

            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {

                setError(
                    date,
                    "La fecha no puede ser anterior a hoy."
                );

                valid = false;

            } else {

                clearError(date);

            }
        }


        /* HORA */

        if (!time.value) {

            setError(
                time,
                "Selecciona una hora."
            );

            valid = false;

        } else {

            clearError(time);

        }


        /* SERVICIO */

        if (!service.value) {

            setError(
                service,
                "Selecciona el tipo de servicio."
            );

            valid = false;

        } else {

            clearError(service);

        }


        return valid;

    }


    /* ================= ENVÍO DE FORMULARIO ================= */

    if (appointmentForm) {

        appointmentForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const isValid =
                    validateForm();

                if (!isValid) {
                    return;
                }


                /* Simular procesamiento */

                const submitButton =
                    appointmentForm.querySelector(
                        'button[type="submit"]'
                    );

                submitButton.disabled = true;

                submitButton.textContent =
                    "Procesando...";


                setTimeout(() => {

                    appointmentForm.style.display =
                        "none";

                    successMessage.classList.add("show");

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Solicitar cita";

                }, 900);

            }
        );

    }


    /* ================= NUEVA SOLICITUD ================= */

    if (newAppointment) {

        newAppointment.addEventListener(
            "click",
            () => {

                appointmentForm.reset();

                document
                    .querySelectorAll(".field-error")
                    .forEach((field) => {
                        field.classList.remove("field-error");
                    });

                document
                    .querySelectorAll(".error-message")
                    .forEach((message) => {
                        message.textContent = "";
                    });

                successMessage.classList.remove("show");

                appointmentForm.style.display = "";

            }
        );

    }


    /* ================= FILTRO MOTOS ================= */

    if (
        motoFilter &&
        motosGrid &&
        motosCount
    ) {

        const motoCards =
            motosGrid.querySelectorAll(".vehicle-card");

        function filterMotos() {

            const selectedBrand =
                motoFilter.value;

            let visibleCount = 0;


            motoCards.forEach((card) => {

                const brand =
                    card.dataset.brand;

                const show =
                    selectedBrand === "all" ||
                    brand === selectedBrand;

                card.classList.toggle(
                    "hidden",
                    !show
                );

                if (show) {
                    visibleCount++;
                }

            });


            motosCount.textContent =
                visibleCount;

            if (motosEmpty) {

                motosEmpty.classList.toggle(
                    "hidden",
                    visibleCount !== 0
                );

            }

        }


        motoFilter.addEventListener(
            "change",
            filterMotos
        );

    }


    /* ================= FILTRO REPUESTOS ================= */

    if (
        partsFilter &&
        partsGrid &&
        partsCount
    ) {

        const partCards =
            partsGrid.querySelectorAll(".part-card");

        function filterParts() {

            const selectedCategory =
                partsFilter.value;

            let visibleCount = 0;


            partCards.forEach((card) => {

                const category =
                    card.dataset.category;

                const show =
                    selectedCategory === "all" ||
                    category === selectedCategory;

                card.classList.toggle(
                    "hidden",
                    !show
                );

                if (show) {
                    visibleCount++;
                }

            });


            partsCount.textContent =
                visibleCount;

            if (partsEmpty) {

                partsEmpty.classList.toggle(
                    "hidden",
                    visibleCount !== 0
                );

            }

        }


        partsFilter.addEventListener(
            "change",
            filterParts
        );

    }


    /* ================= CERRAR MENÚ AL REDIMENSIONAR ================= */

    window.addEventListener("resize", () => {

        if (
            window.innerWidth > 760 &&
            mainNav
        ) {

            mainNav.classList.remove("open");

            if (menuToggle) {

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }

    });

});