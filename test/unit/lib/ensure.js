var should = require("should");

var ensure = require("lib/ensure.js");

describe("The ensure function", function () {

    var error = new Error();

    it("should not throw if the condition is truthy", function () {
        var peacefulFella = function () {
            ensure(error, true);
        };
        peacefulFella.should.not.throw();
    });

    it("should throw if the condition is falsy", function () {
        var troublemaker = function () {
            ensure(error, false);
        };
        troublemaker.should.throw(Error);
    });

});
