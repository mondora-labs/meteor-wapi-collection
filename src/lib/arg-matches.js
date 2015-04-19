var t  = require("tcomb-validation");

module.exports = function argMatches (type, value) {
    return t.validate(value, type).isValid();
};
