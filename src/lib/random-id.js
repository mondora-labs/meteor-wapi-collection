var crypto = require("crypto");

module.exports = function randomId () {
    return crypto.randomBytes(16).toString("hex");
};
