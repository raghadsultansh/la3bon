const mongoose = require("mongoose");
mongoose.connect(process.env.DB_URL)


const schemas = {
    user: mongoose.model("user", new mongoose.Schema({
        username: String,
        email: String,
        password: String,
        token: String
    })),
    games: mongoose.model("games", new mongoose.Schema({
        username: String,
        name: String,
        points: Number,
        Date: { default: Date.now, type: Date },
    }))
}

module.exports = schemas;