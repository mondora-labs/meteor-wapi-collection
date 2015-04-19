var jp = require("fast-json-patch");
var t  = require("tcomb");

module.exports = t.irreducible("JSON Patches", function (patches) {
    var errors = jp.validate(patches);
    return (errors === undefined);
});
