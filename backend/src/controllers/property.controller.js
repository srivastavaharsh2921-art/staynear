const mongoose = require("mongoose");
const Property = require("../models/property.model");
const LAUNCH_UNIVERSITY = "Dev Bhoomi Uttarakhand University (DBUU)";

const addProperty = async (req, res) => {
    try {
        const {
            title,
            type,
            roomType,
            location,
            price,
            description,
            images,
            amenities
        } = req.body;

        if (!title || !type || !roomType || !location || !price) {
            return res.status(400).json({
                message: "Please provide title, type, room type, location and price"
            });
        }

        const property = await Property.create({
            ownerId: req.user._id,
            ownerName: req.user.name,
            ownerEmail: req.user.email,
            title: title.trim(),
            type,
            roomType,
            // New listings are associated with the single launch institution.
            university: LAUNCH_UNIVERSITY,
            location: location.trim(),
            price: Number(price),
            description: description || "",
            images: Array.isArray(images) ? images : [],
            amenities: Array.isArray(amenities) ? amenities : []
        });

        res.status(201).json({
            message: "Property added successfully",
            property
        });

    } catch (error) {
        console.error("Add property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getProperties = async (req, res) => {
    try {
        const { location, maxPrice, roomType, ownerId } = req.query;
        // Keep legacy records untouched while limiting student search to DBUU listings.
        const query = {
            university: {
                $regex: "^Dev Bhoomi Uttarakhand University( \\(DBUU\\))?$",
                $options: "i"
            },
            isAvailable: true
        };

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        if (maxPrice) {
            query.price = { $lte: Number(maxPrice) };
        }

        if (roomType) {
            query.roomType = roomType;
        }

        if (ownerId) {
            query.ownerId = ownerId;
        }

        const properties = await Property.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            properties
        });

    } catch (error) {
        console.error("Get properties error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            ownerId: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({ properties });
    } catch (error) {
        console.error("Get owner properties error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.status(200).json({ property });
    } catch (error) {
        console.error("Get property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can delete only your own property"
            });
        }

        await Property.findByIdAndDelete(id);

        res.status(200).json({
            message: "Property deleted successfully"
        });

    } catch (error) {
        console.error("Delete property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    addProperty,
    getProperties,
    getMyProperties,
    getPropertyById,
    deleteProperty
};
