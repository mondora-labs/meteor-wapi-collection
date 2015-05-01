var MW     = require("meteor-wapi");
var R      = require("ramda");
var should = require("should-promised");

var getOldDocument = require("lib/get-old-document.js");

describe("Unit suite - The getOldDocument function", function () {

    it("should return a promise", function () {
        var collection = {
            dbCollection: {
                findOne: R.always({})
            }
        };
        return getOldDocument(collection).should.be.a.Promise;
    });

});

describe("Unit suite - The promise returned by the getOldDocument function", function () {

    it("should be fulfilled if a document is found", function () {
        var collection = {
            dbCollection: {
                findOne: R.always({})
            }
        };
        return getOldDocument(collection).should.be.fulfilledWith({});
    });

    it("should be rejected with a MW.Error if no document is found", function () {
        var collection = {
            dbCollection: {
                findOne: R.always(null)
            }
        };
        return getOldDocument(collection).should.be.rejectedWith(MW.Error);
    });

});
