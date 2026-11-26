
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// CORS CONFIGURATION
// =====================================

// CORS CONFIGURATION
const allowedOrigins = [
    "https://shikhar-security-solutions.netlify.app",
    "https://shikharsecuritysolutions.com",
    "https://www.shikharsecuritysolutions.com"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());

// =====================================
// ENVIRONMENT VARIABLES
// =====================================

if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SECRET_KEY
) {
    console.error("Supabase credentials missing!");
    process.exit(1);
}

// =====================================
// SUPABASE CONNECTION
// =====================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

// =====================================
// HOME ROUTE
// =====================================

app.get("/", (req, res) => {
    res.send("Shikhar Security Solutions Backend is running!");
});

// =====================================
// HEALTH CHECK
// =====================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working!"
    });
});

// =====================================
// CUSTOMER REVIEWS
// =====================================

app.get("/api/reviews", async (req, res) => {
    try {
        const { data, error } = await supabase.from("reviews")
            .select("id, name, city, rating, review, created_at")
            .order("created_at", { ascending: false })
            .limit(100);
        if (error) {
            console.error("REVIEWS LOAD ERROR:", error);
            return res.status(500).json({ success: false, message: "Could not load customer reviews." });
        }
        return res.json({ success: true, reviews: data || [] });
    } catch (error) {
        console.error("REVIEWS LOAD ERROR:", error);
        return res.status(500).json({ success: false, message: "Could not load customer reviews." });
    }
});

app.post("/api/reviews", async (req, res) => {
    try {
        const { name, city, rating, review } = req.body || {};
        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanCity = typeof city === "string" ? city.trim() : "";
        const cleanReview = typeof review === "string" ? review.trim() : "";
        const cleanRating = Number(rating);
        if (!cleanName || cleanName.length > 80 || !cleanCity || cleanCity.length > 80 ||
            !cleanReview || cleanReview.length > 2000 || !Number.isInteger(cleanRating) ||
            cleanRating < 1 || cleanRating > 5) {
            return res.status(400).json({ success: false, message: "Enter a name, city, review and a 1–5 star rating." });
        }
        const { data, error } = await supabase.from("reviews").insert([{
            name: cleanName, city: cleanCity, rating: cleanRating, review: cleanReview
        }]).select("id, name, city, rating, review, created_at").single();
        if (error) {
            console.error("REVIEW SAVE ERROR:", error);
            return res.status(500).json({ success: false, message: "Could not save your review. Please try again." });
        }
        return res.status(201).json({ success: true, review: data });
    } catch (error) {
        console.error("REVIEW SAVE ERROR:", error);
        return res.status(500).json({ success: false, message: "Could not save your review. Please try again." });
    }
});

// =====================================
// SAVE ENQUIRY + SEND EMAIL
// =====================================

app.post("/api/enquiries", async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            service,
            message,
            state,
            city,
            address,
            form_type
        } = req.body || {};

        // Validate required fields
        if (!name || !phone || !service) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and service are required."
            });
        }

        // Save enquiry in Supabase
        const { data, error } = await supabase
            .from("enquiries")
            .insert([{
                name: String(name).trim(),
                phone: String(phone).trim(),
                service: String(service).trim(),
                message: message || "",
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error("SUPABASE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Database error while saving enquiry."
            });
        }

        console.log("Enquiry saved successfully!");

        // =================================
        // EMAILJS CONFIGURATION
        // =================================

        const templateId =
            form_type === "quote"
                ? process.env.EMAILJS_QUOTE_TEMPLATE_ID
                : process.env.EMAILJS_CONTACT_TEMPLATE_ID;

        let emailSent = false;

        if (
            process.env.EMAILJS_SERVICE_ID &&
            process.env.EMAILJS_PUBLIC_KEY &&
            process.env.EMAILJS_PRIVATE_KEY &&
            templateId
        ) {
            try {
                const emailResponse = await fetch(
                    "https://api.emailjs.com/api/v1.0/email/send",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            service_id:
                                process.env.EMAILJS_SERVICE_ID,

                            template_id: templateId,

                            user_id:
                                process.env.EMAILJS_PUBLIC_KEY,

                            accessToken:
                                process.env.EMAILJS_PRIVATE_KEY,

                            template_params: {
                                title:
                                    form_type === "quote"
                                        ? "New Quote Request"
                                        : "New Contact Enquiry",

                                name: name || "",
                                phone: phone || "",
                                email: email || "",
                                service: service || "",
                                message: message || "",
                                state: state || "",
                                city: city || "",
                                address: address || "",

                                time: new Date().toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata"
                                })
                            }
                        })
                    }
                );

                if (emailResponse.ok) {
                    emailSent = true;
                    console.log("Email notification sent!");
                } else {
                    const emailError =
                        await emailResponse.text();

                    console.error("EMAILJS ERROR:", emailError);
                }

            } catch (emailError) {
                console.error(
                    "EMAIL SENDING ERROR:",
                    emailError
                );
            }

        } else {
            console.log(
                "EmailJS credentials or template ID missing."
            );
        }

        // =================================
        // SUCCESS RESPONSE
        // =================================

        return res.status(201).json({
            success: true,
            message: "Enquiry saved successfully!",
            emailSent: emailSent,
            data: data
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
