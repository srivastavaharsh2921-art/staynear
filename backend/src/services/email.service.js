const sendPasswordResetEmail = async ({ email, token, frontendBaseUrl }) => {
    const resetUrl = new URL("/reset-password.html", frontendBaseUrl);
    resetUrl.searchParams.set("token", token);

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [email],
            subject: "Reset your StayNear password",
            text: [
                "We received a request to reset the password for your StayNear account.",
                "",
                `Use this link within 30 minutes: ${resetUrl.toString()}`,
                "",
                "If you did not request a password reset, you can ignore this email."
            ].join("\n")
        }),
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        throw new Error("Email provider request failed.");
    }
};

module.exports = { sendPasswordResetEmail };
