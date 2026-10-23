const { Resend } = require("resend");

const redactSensitiveText = (message) => String(message || "")
    .replace(/https?:\/\/\S+/gi, "[URL redacted]")
    .replace(/\b(?:re_)?[A-Za-z0-9_-]{32,}\b/g, "[credential redacted]")
    .replace(/\b(password|token|api[_ -]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .slice(0, 400);

const logResendError = (error) => {
    const name = typeof error?.name === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(error.name)
        ? error.name
        : "ResendError";
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : null;
    const message = redactSensitiveText(error?.message);

    console.error("[password-reset] Resend send failed", { name, statusCode, message });
};

const sendPasswordResetEmail = async ({ email, token, frontendBaseUrl }) => {
    const resetUrl = new URL("/reset-password.html", frontendBaseUrl);
    resetUrl.searchParams.set("token", token);

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        // The SDK logs the raw provider response in non-production mode; use only our redacted log below.
        resend.logError = () => {};
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Reset your StayNear password",
            text: [
                "We received a request to reset the password for your StayNear account.",
                "",
                `Use this link within 30 minutes: ${resetUrl.toString()}`,
                "",
                "If you did not request a password reset, you can ignore this email."
            ].join("\n")
        });

        if (error) {
            logResendError(error);
            throw new Error("Password reset email delivery failed.");
        }

        if (!data?.id) {
            console.error("[password-reset] Resend returned no email ID", {
                name: "ResendResponseError",
                statusCode: null,
                message: "The provider response did not include an email ID."
            });
            throw new Error("Password reset email delivery failed.");
        }
    } catch (error) {
        // The tokenized URL and recipient must never be written to server logs.
        if (error?.message !== "Password reset email delivery failed.") {
            logResendError(error);
        }
        throw new Error("Password reset email delivery failed.");
    }
};

module.exports = { sendPasswordResetEmail };
