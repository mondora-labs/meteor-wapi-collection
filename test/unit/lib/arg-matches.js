var should = require("should");
var t      = require("tcomb");

var argMatches = require("lib/arg-matches.js");

describe("Unit suite - The argMatches function", function () {

    it("should return true the argument is of the correct type", function () {
        argMatches(t.Str, "I'm a string").should.equal(true);
    });

    it("should throw an MW.Error if the argument is of the incorrect type", function () {
        argMatches(t.Num, "I'm a string, not a number").should.equal(false);
    });

});
