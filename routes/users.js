var express = require("express");
var router = express.Router();
var path = require("path");
const bcrypt = require("bcrypt");
const checkAuth = require("../middleware/checkauth");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sharp = require("sharp");
const jsonpatch = require("jsonpatch");

var http = require("https");
var fs = require("fs");

var download = function (url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http
    .get(url, function (response) {
      response.pipe(file);
      file.on("finish", function () {
        file.close(cb);
      });
    })
    .on("error", function (err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async.
      if (cb) cb(err.message);
    });
};

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    try {
      const user = new User({
        username: req.body.username,
        password: hash,
      });
      user
        .save()
        .then((result) => {
          console.log("user created");
          res.status(201).json({ message: "User created", result: result });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    } catch (error) {
      res.status(403).send(error.message);
    }
  });
});

router.post("/login", (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        console.log("no user");
        res.status(500).json({ message: "User not found" });
      } else {
        fetchedUser = user;
        let result = bcrypt.compare(req.body.password, fetchedUser.password);
        if (!result) {
          return res.status(401).json({ message: "Password not matched" });
        } else {
          const token = jwt.sign(
            { username: fetchedUser.username },
            "sercret_and_longer_string"
          );
          res.status(200).json({
            token: token,
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(401).json({ message: "Auth failed" });
    });
});

router.put("/address", checkAuth, async (req, res, next) => {
  try {
    let user = await User.updateOne(
      { username: req.userData.username },
      { $set: { address: req.body.address } }
    );
    res.status(200).json({ result: user });
  } catch (error) {
    return res.status(401).json({ message: "something went wrong" });
  }
});

router.post("/thumbnail", checkAuth, async (req, res, next) => {
  try {
    download(req.body.url, "./image.jpg", () => {
      sharp("./image.jpg")
        .resize(50, 50)
        .toFile(__dirname + "output2.jpg", (err, info) => {
          res.status(200).sendFile(__dirname + "output2.jpg");
        });
    });
  } catch (error) {
    return res.status(401).json({ message: "something went wrong" });
  }
});

router.get("/patch", async (req, res, next) => {
  let obj = {
    name: "jcm",
  };
  let patchObj = [
    { op: "replace", path: "/name", value: "Jagdish" },
    { op: "add", path: "/address", value: "Udaipur" },
  ];
  let patcheddoc = jsonpatch.apply_patch(obj, patchObj);
  res.status(200).json(patcheddoc);
});

module.exports = router;
