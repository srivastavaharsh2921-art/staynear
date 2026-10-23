const { rateLimit } = require("express-rate-limit");

const createPasswordResetLimiter = (limit) => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many password reset attempts. Please wait and try again."
    }
});

const passwordResetRequestLimiter = createPasswordResetLimiter(5);
const passwordResetSubmitLimiter = createPasswordResetLimiter(10);

module.exports = {
    passwordResetRequestLimiter,
    passwordResetSubmitLimiter
};
