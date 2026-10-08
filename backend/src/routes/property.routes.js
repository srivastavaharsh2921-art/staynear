const express = require("express");

const {
    addProperty,
    getProperties,
    getMyProperties,
    getPropertyById,
    deleteProperty
} = require("../controllers/property.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, addProperty);

router.get("/", getProperties);

router.get("/mine", protect, getMyProperties);

router.get("/:id", getPropertyById);

router.delete("/:id", protect, deleteProperty);

module.exports = router;
