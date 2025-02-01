const express = require('express');
const { user, games } = require('../utils/db');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const bcrypt = require('bcrypt');
const saltRounds = 5;

router.get("/login", async (req, res) => {
    const { username, password } = req.query;
    if(!username || !password) {
        return res.json({ success: false, message: "Please fill all fields" });
    }

    const data = await user.findOne({ username }).exec();
    if(data) {
        console.log({ password, dataPassword: data.password });
        if(password === data.password) {
            return res.json({ success: true, message: "User logged in successfully", token: data.token });
        } else {
            return res.json({ success: false, message: "Incorrect password" });
        }
    } else {
        return res.json({ success: false, message: "User not found" });
    }
})

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body)
    if(!username || !email || !password) {
        return res.json({ success: false, message: "Please fill all fields" });
    }

    const data = await user.findOne({ username }).exec();
    if(data) {
        console.log(data);
        return res.json({ success: false, message: "User already has data" });
    } else {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        user.create({ username, email, password, token: hashedPassword });
        return res.json({ success: true, message: "User created successfully", token: hashedPassword });
    }
});

router.post("/game", async (req, res) => {
    const { token, name, points } = req.body;
    if(!token || !name || !points) {
        return res.json({ success: false, message: "Please fill all fields" });
    }
    const userData = await user.findOne({ token }).exec();
    if(userData) {
        const data = new games({ username: userData.username, name, points  });
        await data.save();
    }
})

router.get('/user', async (req, res) => {
    const { token } = req.query;
    if(!token) {
        return res.json({ success: false, message: "Please fill all fields" });
    }
    const data = await user.findOne({ token }).exec();
    if(data) {
        const gamesData = await games.find({ username: data.username }).exec();
        return res.json({ success: true, message: "User found", username: data.username, gamesData });
    } else {
        return res.json({ success: false, message: "User not found" });
    }
})

router.get('/', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

module.exports = router;