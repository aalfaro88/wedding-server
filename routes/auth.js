// routes/auth.js

var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const isAuthenticated = require("../middleware/isAuthenticated");
const User = require("../models/User");

const saltRounds = 10;


router.post("/signup", (req, res, next) => {
  const { email, password, username } = req.body;

  console.log("Signup request received. Request body:", req.body);

  if (!email || !password || !username) {
    res.status(400).json({ message: "Please provide email, password, and username." });
    return;
  }

  User.findOne({ email })
    .then((foundUserByEmail) => {
      if (foundUserByEmail) {
        res.status(400).json({ message: "Email already registered." });
        return;
      }

      User.findOne({ username })
        .then((foundUserByUsername) => {
          if (foundUserByUsername) {
            res.status(400).json({ message: "Username already exists." });
            return;
          }

          const salt = bcrypt.genSaltSync(saltRounds);
          const hashedPassword = bcrypt.hashSync(password, salt);

          User.create({ email, password: hashedPassword, username })
            .then((createdUser) => {
              const { email, _id, username } = createdUser;
              const payload = { email, _id, username };

              const authToken = jwt.sign(payload, process.env.SECRET, {
                algorithm: "HS256",
                expiresIn: "6h",
              });

              res.status(200).json({ authToken });
            })
            .catch((err) => {
              console.log(err); // Log the error for debugging
              res.status(500).json({ message: "Internal Server Error" });
            });
        })
        .catch((err) => {
          console.log(err); // Log the error for debugging
          res.status(500).json({ message: "Internal Server Error" });
        });
    })
    .catch((err) => {
      console.log(err); // Log the error for debugging
      res.status(500).json({ message: "Internal Server Error" });
    });
});



router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { email, _id, username } = foundUser;
        const payload = { email, _id, username };

        const authToken = jwt.sign(payload, process.env.SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});

router.get("/verify", isAuthenticated, (req, res, next) => {
  res.status(200).json(req.user);
});

module.exports = router;
