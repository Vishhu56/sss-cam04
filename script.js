console.log("SSS CAM Started");

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
   LOCATION FORM
========================= */

const locationForm = document.querySelector(".custom-location form");

if (locationForm) {

    locationForm.addEventListener("submit", function (e) {

        e.preventDefault();

        alert("Thank You! We will contact you soon.");

    });

}

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

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.2
});

fadeElements.forEach(el => {
    observer.observe(el);
});

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

/* =========================
   EMAILJS CONTACT FORM
========================= */

emailjs.init({
    publicKey: "_S-Nud8e_2LGWonDm"
});

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        emailjs.sendForm(
            "service_ot5zsap",
            "template_n1cton1",
            this
        )
        .then(() => {

            alert("✅ Thank You! Your inquiry has been sent successfully.");

            contactForm.reset();

        })
        .catch((error) => {

            console.log("EmailJS Error:", error);

            alert("❌ Failed to send inquiry.");

        });

    });

}