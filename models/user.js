var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
