var jp     = require("fast-json-patch");
var should = require("should");

var applyPatches = require("lib/apply-patches.js");

describe("The applyPatches function", function () {

    it("should apply the supplied set of patches to the supplied object", function () {
        var oldObj = {
            a: 1
        };
        var newObj = {
            a: 2
        };
        var patches = jp.compare(oldObj, newObj);
        var patchedObj = applyPatches(oldObj, patches);
        patchedObj.should.eql(newObj);
    });

    it("should not mutate the object to which it applies patches", function () {
        var oldObj = {
            a: 1
        };
        var oldObjClone = {
            a: 1
        };
        var newObj = {
            a: 2
        };
        var patches = jp.compare(oldObj, newObj);
        applyPatches(oldObj, patches);
        oldObj.should.eql(oldObjClone);
    });

});
