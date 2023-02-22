const mongoose = require("mongoose");

module.exports = mongoose.model("User", new mongoose.Schema({
    id: { type: String, default: null },
    admin: { type: Boolean, default: false },
    discordID: { type: String, default: null },
    name: { type: String, default: null },
    password: { type: String, default: null },
    email: { type: String, default: null },
    servers: { type: Array, default: [] },
    plan: { type: String, default: null },
    registeredAt: { type: Number, default: Date.now() },
}));