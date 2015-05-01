var should = require("should");

var randomId = require("lib/random-id.js");

describe("Unit suite - The randomId function", function () {

    it("should generate a random 16-bytes string (32 characters long)", function () {
        var string = randomId();
        string.should.be.a.String;
        string.length.should.equal(32);
    });

});
