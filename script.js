
console.log("Shikhar Security Solutions site loaded");

/* =========================
   COUNTER ANIMATION
========================= */

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    const updateCounter = () => {
        const target = +counter.getAttribute("data-target");
        const current = +counter.innerText;
        const increment = target / 100;

        if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(updateCounter, 20);
        } else {
            counter.innerText = target + "+";
        }
    };

    updateCounter();
});

/* =========================
   MOBILE MENU
========================= */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

/* =========================
   LOADER
========================= */

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";

            setTimeout(() => {
                loader.style.display = "none";
            }, 800);
        }, 1500);
    }
});

/* =========================
   SCROLL ANIMATION
========================= */

const fadeElements = document.querySelectorAll(".fade-up");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    fadeElements.forEach(el => observer.observe(el));
} else {
    fadeElements.forEach(el => el.classList.add("show"));
}

/* =========================
   ACTIVE NAV LINK
========================= */

const sections = document.querySelectorAll("section");
const navMenuLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;

        if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    navMenuLinks.forEach(link => {
        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});

/* =========================
   NAVBAR SHADOW
========================= */

window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");

    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow =
                "0 5px 20px rgba(0,0,0,0.2)";
        } else {
            navbar.style.boxShadow = "none";
        }
    }
});



/* =========================================
   EMAILJS + SUPABASE CONFIGURATION
========================================= */

const API_BASE_URL = "https://shikhar-security-solution.onrender.com";

const EMAILJS_PUBLIC_KEY = "_S-Nud8e_2LGWonDm";
const EMAILJS_SERVICE_ID = "service_ot5zsap";

const CONTACT_TEMPLATE_ID = "template_n1cton1";
const QUOTE_TEMPLATE_ID = "template_7mwv9wg";

// Initialize EmailJS
if (window.emailjs) {
    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });
}
/* =========================================
   PROFESSIONAL WEBSITE NOTIFICATION
========================================= */

function showSiteToast(message, type = "success") {
    let toast = document.getElementById("site-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "site-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        document.body.appendChild(toast);
    }

    const isSuccess = type === "success";

    toast.innerHTML = `
        <div class="site-toast-icon">
            ${isSuccess ? "✓" : "!"}
        </div>
        <div class="site-toast-content">
            <strong>${isSuccess ? "Thank You!" : "Please Check"}</strong>
            <span></span>
        </div>
        <button type="button" aria-label="Close">×</button>
    `;

    toast.querySelector("span").textContent = message;

    Object.assign(toast.style, {
        position: "fixed",
        top: "25px",
        right: "25px",
        zIndex: "99999",
        width: "min(390px, calc(100% - 30px))",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        background: "#ffffff",
        color: "#111827",
        borderRadius: "12px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        borderLeft: `4px solid ${isSuccess ? "#16a34a" : "#dc2626"}`,
        fontFamily: "Arial, sans-serif",
        animation: "siteToastIn .3s ease"
    });

    Object.assign(toast.querySelector(".site-toast-icon").style, {
        width: "34px",
        height: "34px",
        minWidth: "34px",
        borderRadius: "50%",
        background: isSuccess ? "#dcfce7" : "#fee2e2",
        color: isSuccess ? "#15803d" : "#dc2626",
        display: "grid",
        placeItems: "center",
        fontSize: "20px",
        fontWeight: "bold"
    });

    Object.assign(toast.querySelector(".site-toast-content").style, {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        flex: "1"
    });

    toast.querySelector("strong").style.fontSize = "16px";
    toast.querySelector("span").style.cssText =
        "font-size:13px;color:#6b7280;line-height:1.5";

    const closeButton = toast.querySelector("button");
    closeButton.style.cssText =
        "border:0;background:none;font-size:24px;color:#9ca3af;cursor:pointer";

    closeButton.onclick = () => toast.remove();

    clearTimeout(window.siteToastTimer);

    window.siteToastTimer = setTimeout(() => {
        toast.remove();
    }, 5000);
}

const toastStyle = document.createElement("style");
toastStyle.textContent = `
@keyframes siteToastIn {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(toastStyle);
/* =========================================
   SAVE ENQUIRY + SEND EMAIL
========================================= */

async function sendEnquiryToBackend(
    payload,
    form,
    successMessage,
    templateId,
    emailParams
) {
    const submitButton = form.querySelector('[type="submit"]');

    const originalText = submitButton
        ? submitButton.textContent
        : "Submit";

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
    }

    try {
        // Save enquiry through your backend
        const response = await fetch(
            `${API_BASE_URL}/api/enquiries`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Request could not be submitted."
            );
        }

        // Send notification email
        try {
            if (!window.emailjs) {
                throw new Error("Email service unavailable.");
            }

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                templateId,
                emailParams
            );

            showSiteToast(
                successMessage,
                "success"
            );

        } catch (emailError) {
            console.error("EmailJS Error:", emailError);

            // Enquiry is saved even if email notification fails
            showSiteToast(
                "Your request has been received. Our team will contact you shortly.",
                "success"
            );
        }

        form.reset();

    } catch (error) {
        console.error("Enquiry Error:", error);

        showSiteToast(
            "Something went wrong. Please try again in a moment.",
            "error"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
}

/* =========================================
   CONTACT FORM
========================================= */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const formData = new FormData(contactForm);

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const service = String(formData.get("service") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!name || !phone || !service) {
            showSiteToast("Please fill in your name, phone number and service.", "error");
            return;
        }

        const currentTime = new Date().toLocaleString("en-IN");

        const emailParams = {
            title: "New Enquiry - " + service,
            name: name,
            time: currentTime,
            message: message,
            phone: phone,
            email: email,
            service: service
        };

        await sendEnquiryToBackend(
            {
                form_type: "contact",
                name: name,
                phone: phone,
                email: email,
                service: service,
                message: message
            },
            contactForm,
            "Thank you for contacting us! Your message has been received. We'll get back to you soon. .",
            CONTACT_TEMPLATE_ID,
            emailParams
        );
    });
}


/* =========================================
   QUOTE FORM
========================================= */

const quoteForm = document.getElementById("quoteForm");

if (quoteForm) {
    quoteForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const formData = new FormData(quoteForm);

        const name = String(formData.get("name") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const state = String(formData.get("state") || "").trim();
        const city = String(formData.get("city") || "").trim();
        const address = String(formData.get("address") || "").trim();
        const service = String(formData.get("service") || "").trim();

        if (!name || !phone || !service) {
            showSiteToast("Please fill in all required details.", "error");
            return;
        }

        const currentTime = new Date().toLocaleString("en-IN");

        const message = [
            "QUOTE REQUEST",
            email ? `Email: ${email}` : "",
            state ? `State: ${state}` : "",
            city ? `City: ${city}` : "",
            address ? `Address: ${address}` : ""
        ].filter(Boolean).join("\n");

        const emailParams = {
            title: "New Quote Request - " + service,
            name: name,
            time: currentTime,
            message: message,
            phone: phone,
            email: email,
            state: state,
            city: city,
            address: address,
            service: service
        };

        await sendEnquiryToBackend(
            {
                form_type: "quote",
                name: name,
                phone: phone,
                email: email,
                state: state,
                city: city,
                address: address,
                service: service,
                message: message
            },
            quoteForm,
            "Your quote request has been submitted successfully. Our team will contact you shortly.",
            QUOTE_TEMPLATE_ID,
            emailParams
        );
    });
}


/* =========================
   TESTIMONIAL SEE MORE
========================= */

const reviewsBtn = document.getElementById("reviewsBtn");
const extraReviews = document.querySelectorAll(".extra-testimonial");

if (reviewsBtn) {

    reviewsBtn.addEventListener("click", function() {

        const isOpen = this.classList.toggle("opened");

        extraReviews.forEach(review => {
            review.classList.toggle("show-review", isOpen);
        });

        this.textContent = isOpen
            ? "Show Less Reviews"
            : "See More Reviews";

    });
}


/* =========================
   CLIENT REVIEW SYSTEM
========================= */

let selectedRating = 0;

const stars = document.querySelectorAll(".star-rating span");

stars.forEach(star => {

    star.addEventListener("click", function() {

        selectedRating = Number(this.dataset.rating);

        stars.forEach(s => {
            s.classList.remove("selected");
        });

        for (let i = 0; i < selectedRating; i++) {
            stars[i].classList.add("selected");
        }

    });

});

const submitReview = document.getElementById("submitReview");

if (submitReview) {

    submitReview.addEventListener("click", function() {

        const name = document.getElementById("reviewName").value.trim();
        const city = document.getElementById("reviewCity").value.trim();
        const review = document.getElementById("reviewText").value.trim();

        if (!name || !city || !review || selectedRating === 0) {
            alert("Please complete your rating, name, city and review.");
            return;
        }

        const reviewCard = document.createElement("div");

        reviewCard.className = "testimonial-card";

        const ratingElement = document.createElement("div");
        ratingElement.className = "user-rating";
        ratingElement.textContent = "★".repeat(selectedRating);

        const reviewElement = document.createElement("p");
        reviewElement.textContent = `"${review}"`;

        const nameElement = document.createElement("h4");
        nameElement.textContent = name;

        const cityElement = document.createElement("span");
        cityElement.textContent = city;

        reviewCard.append(
            ratingElement,
            reviewElement,
            nameElement,
            cityElement
        );

        const testimonialGrid =
            document.querySelector(".testimonial-grid");

        if (!testimonialGrid) return;

        testimonialGrid.appendChild(reviewCard);

        document.getElementById("reviewName").value = "";
        document.getElementById("reviewCity").value = "";
        document.getElementById("reviewText").value = "";

        stars.forEach(s => {
            s.classList.remove("selected");
        });

        selectedRating = 0;

        showSiteToast("Thank you for sharing your feedback!", "success");

    });

}


/* =========================================
   SERVICE DETAILS SYSTEM
========================================= */

function openService(serviceName) {

    const servicesHome =
        document.getElementById("services-home");

    const detailsArea =
        document.getElementById("service-details-area");

    const allDetails =
        document.querySelectorAll(".service-detail");

    if (!servicesHome || !detailsArea) return;

    servicesHome.classList.add("hidden");

    detailsArea.classList.add("active");

    allDetails.forEach(function(detail) {
        detail.classList.remove("active");
    });

    const selectedService =
        document.getElementById("service-" + serviceName);

    if (selectedService) {
        selectedService.classList.add("active");
    }

    const servicesSection = document.getElementById("services");

    if (servicesSection) {
        servicesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function closeService() {

    const servicesHome =
        document.getElementById("services-home");

    const detailsArea =
        document.getElementById("service-details-area");

    const allDetails =
        document.querySelectorAll(".service-detail");

    if (!servicesHome || !detailsArea) return;

    detailsArea.classList.remove("active");

    allDetails.forEach(function(detail) {
        detail.classList.remove("active");
    });

    servicesHome.classList.remove("hidden");

    const servicesSection = document.getElementById("services");

    if (servicesSection) {
        servicesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}
