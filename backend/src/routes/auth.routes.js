const express = require("express");

const {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword
} = require("../controllers/auth.controller");
const {
    passwordResetRequestLimiter,
    passwordResetSubmitLimiter
} = require("../middleware/password-reset-rate-limit");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", passwordResetRequestLimiter, requestPasswordReset);
router.post("/reset-password", passwordResetSubmitLimiter, resetPassword);

module.exports = router;
