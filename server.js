
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// CORS CONFIGURATION
// =====================================


app.use(cors({
    origin: "https://shikhar-security-solutions.netlify.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

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

                                time: new Date().toLocaleString("en-IN")
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
