var jp     = require("fast-json-patch");
var should = require("should");
var t      = require("tcomb-validation");

var PatchesType = require("lib/patches-type.js");

describe("Unit suite - The PatchesType object", function () {

    it("should be a tcomb type", function () {
        t.Type.is(PatchesType).should.equal(true);
    });

    it("should match valid JSON patches, unless they're an empty array", function () {
        var validPatches_0 = [{
            op: "add",
            path: "/prop",
            value: "value"
        }];
        var validPatches_1 = jp.compare({a: 1}, {b: 1});
        t.validate(validPatches_0, PatchesType).isValid().should.equal(true);
        t.validate(validPatches_1, PatchesType).isValid().should.equal(true);
    });

    it("should not match invalid JSON patches and empty arrays", function () {
        var invalidPatches_0 = [{a: 2}];
        t.validate(invalidPatches_0, PatchesType).isValid().should.equal(false);
        var invalidPatches_1 = [];
        t.validate(invalidPatches_1, PatchesType).isValid().should.equal(false);
    });

});
