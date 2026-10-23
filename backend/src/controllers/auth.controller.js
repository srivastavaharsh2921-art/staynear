const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const { sendPasswordResetEmail } = require("../services/email.service");

const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESET_MESSAGE = "If an account exists for this email, a password reset link will be sent.";
const INVALID_RESET_MESSAGE = "This password reset link is invalid or has expired. Request a new link and try again.";

const isValidEmail = (email) =>
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const isStrongPassword = (password) =>
    typeof password === "string" &&
    password.length >= 10 &&
    Buffer.byteLength(password, "utf8") <= 72 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);

const createToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please provide name, email, password and role"
            });
        }

        if (role !== "student" && role !== "owner") {
            return res.status(400).json({
                message: "Role must be student or owner"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: "Account created successfully",
            token: createToken(newUser._id),
            user: sanitizeUser(newUser)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            token: createToken(user._id),
            user: sanitizeUser(user)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const requestPasswordReset = async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL;
    const frontendBaseUrlIsValid = (() => {
        try {
            const parsed = new URL(frontendBaseUrl);
            return parsed.protocol === "https:" ||
                (parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname));
        } catch {
            return false;
        }
    })();

    const missingEmailConfig = [
        !process.env.RESEND_API_KEY?.trim() && "RESEND_API_KEY",
        !process.env.EMAIL_FROM?.trim() && "EMAIL_FROM",
        !frontendBaseUrlIsValid && "FRONTEND_BASE_URL (missing or invalid)"
    ].filter(Boolean);

    if (missingEmailConfig.length > 0) {
        console.error("[password-reset] Email configuration incomplete", {
            missing: missingEmailConfig
        });
        return res.status(503).json({
            message: "Password reset is temporarily unavailable. Please try again later."
        });
    }

    try {
        const user = await User.findOne({ email });

        if (user) {
            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
            const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

            user.passwordResetTokenHash = tokenHash;
            user.passwordResetExpiresAt = expiresAt;
            await user.save();

            try {
                await sendPasswordResetEmail({
                    email: user.email,
                    token: rawToken,
                    frontendBaseUrl
                });
            } catch {
                await User.updateOne(
                    { _id: user._id, passwordResetTokenHash: tokenHash },
                    { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }
                );
                console.error("Password reset email delivery failed.");
            }
        }

        return res.status(200).json({ message: GENERIC_RESET_MESSAGE });
    } catch {
        // Keep account lookup and mail failures out of logs and responses.
        console.error("Password reset request could not be completed.");
        return res.status(200).json({ message: GENERIC_RESET_MESSAGE });
    }
};

const resetPassword = async (req, res) => {
    const { token, password, confirmPassword } = req.body || {};

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(400).json({ message: INVALID_RESET_MESSAGE });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "The passwords do not match." });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({
            message: "Use at least 10 characters with uppercase, lowercase, and a number. Passwords must be no more than 72 UTF-8 bytes."
        });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    try {
        const user = await User.findOne({
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: { $gt: now }
        }).select("+passwordResetTokenHash +passwordResetExpiresAt");

        if (!user) {
            return res.status(400).json({ message: INVALID_RESET_MESSAGE });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await User.updateOne(
            {
                _id: user._id,
                passwordResetTokenHash: tokenHash,
                passwordResetExpiresAt: { $gt: new Date() }
            },
            {
                $set: { password: hashedPassword },
                $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 }
            }
        );

        if (result.modifiedCount !== 1) {
            return res.status(400).json({ message: INVALID_RESET_MESSAGE });
        }

        return res.status(200).json({ message: "Your password has been reset. You can now log in." });
    } catch {
        console.error("Password reset could not be completed.");
        return res.status(500).json({ message: "Password reset could not be completed. Please try again." });
    }
};

module.exports = {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword
};
