var jp     = require("fast-json-patch");
var should = require("should");
var t      = require("tcomb-validation");

var PatchesType = require("lib/patches-type.js");

describe("The PatchesType object", function () {

    it("should be a tcomb type", function () {
        t.Type.is(PatchesType).should.equal(true);
    });

    it("should match valid JSON patches", function () {
        var validPatches_0 = [];
        var validPatches_1 = jp.compare({a: 1}, {b: 1});
        t.validate(validPatches_0, PatchesType).isValid().should.equal(true);
        t.validate(validPatches_1, PatchesType).isValid().should.equal(true);
    });

    it("should not match invalid JSON patches", function () {
        var invalidPatches = [{a: 2}];
        t.validate(invalidPatches, PatchesType).isValid().should.equal(false);
    });

});
