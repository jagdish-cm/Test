const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    //if there is a token
    const token = req.headers.authorization.split(" ")[1];
    //if yes then verify it
    const tokenData = jwt.verify(token, "sercret_and_longer_string");
    //appending decoded token data to request to be used for authorization
    req.userData = { username: tokenData.username };
    next();
  } catch (error) {
    res.status(401).json({ message: "Auth failed at token verification" });
  }
};
