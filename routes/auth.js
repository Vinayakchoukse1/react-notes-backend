const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secretKey } = require("../config");
const fetchuser = require("../middleware/fetchUser");

// ROUTE 1: Create a user using: POST "/api/auth/createuser"
router.post(
    "/createuser",
    [
        body("name", "Enter a valid name").isLength({ min: 3 }),
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be atleast 5 characters long").isLength({ min: 5 })
    ],
    async (req, res) => {

        let success = false;

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        try {
            // Checking whether user exists or not
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ success, error: "Email already exits" });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt)

            // Creating new User
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });

            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, secretKey);
            success = true;
            res.json({ success, authtoken });

        } catch (error) {
            success = false;
            console.error(error.message);
            res.status(500).send({ success, error: "Internal Server Error" });
        }
    }
);

// ROUTE 2: Authenticate a user using: POST "/api/auth/login"
router.post(
    "/login", [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists()
],
    async (req, res) => {

        let success = false;

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Checking whether user exists or not
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success, error: "Wrong Credentials" });
            }

            // Checking correct password
            const flag = await bcrypt.compare(password, user.password);
            if (!flag) {
                return res.status(400).json({ success, error: "Wrong Credentials" });
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, secretKey);
            success = true;
            res.json({ success, authtoken });

        } catch (error) {
            success = false;
            console.error(error.message);
            res.status(500).send({ success, error: "Internal Server Error" });
        }
    }
);

// ROUTE 3: Get user using logged in details: POST "/api/auth/getuser"
router.post("/getuser", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;