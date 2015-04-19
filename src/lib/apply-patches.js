var jp = require("fast-json-patch");
var R  = require("ramda");

module.exports = function applyPatches (object, patches) {
    var target = R.clone(object);
    jp.apply(target, patches);
    return target;
};
