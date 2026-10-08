const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        ownerName: {
            type: String,
            required: true,
            trim: true
        },
        ownerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["PG", "Room", "Flat", "Hostel"],
            required: true
        },

        roomType: {
            type: String,
            enum: ["Single Room", "Double Room", "Shared Room"],
            required: true
        },

        university: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        images: {
            type: [String],
            default: []
        },

        amenities: {
            type: [String],
            default: []
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Property", propertySchema);
